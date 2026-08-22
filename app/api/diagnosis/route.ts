import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import connectMongoose from "@/lib/mongoose";
import clientPromise from "@/lib/mongodb";
import Diagnosis from "@/models/Diagnosis";
import { requireDiagnosisUser, requirePaidDiagnosisUser, serializeDiagnosis, type AnalysisResult, type CareerRoadmap, type Plan } from "@/lib/diagnosis";
import { diagnosisQuestions, resolveAnswers } from "@/lib/diagnosis-questions";

export async function GET() {
  try {
    const access = await requirePaidDiagnosisUser();
    if (!access.authenticated) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    if (!access.paid) return NextResponse.json({ error: "診断履歴は有料プラン限定の機能です。" }, { status: 403 });
    await connectMongoose();
    const docs = await Diagnosis.find({ userId: access.userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(docs.map((doc) => serializeDiagnosis(doc)));
  } catch (error) {
    console.error("診断履歴の取得に失敗しました。", error);
    return NextResponse.json({ error: "診断履歴を取得できませんでした。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireDiagnosisUser();
    if (!userId) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    const body = await request.json();
    const rawSelections = body?.selections && typeof body.selections === "object" ? body.selections as Record<string, unknown> : {};
    const selections = Object.fromEntries(Object.entries(rawSelections).map(([key, value]) => [key, String(value)]));
    const resolved = resolveAnswers(selections);
    if (resolved.length !== diagnosisQuestions.length || resolved.some((answer) => !answer.answer)) {
      return NextResponse.json({ error: "5問すべてに表示された選択肢から回答してください。" }, { status: 400 });
    }
    const rawSupplements = body?.supplements && typeof body.supplements === "object" ? body.supplements as Record<string, unknown> : {};
    const supplements = Object.fromEntries(Object.entries(rawSupplements).map(([key, value]) => [key, String(value).trim().slice(0, 501)]));
    if (Object.values(supplements).some((value) => value.length > 500)) return NextResponse.json({ error: "補足入力は500文字以内で入力してください。" }, { status: 400 });
    if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "ANTHROPIC_API_KEYが設定されていません。" }, { status: 503 });

    // AI生成後にDB接続を始めると待ち時間が直列に増えるため、両DB接続を先に並行準備する。
    const [client] = await Promise.all([clientPromise, connectMongoose()]);
    const member = await client.db().collection("users").findOne({ _id: userId });
    const plan: Plan = member?.plan === "paid" ? "paid" : "free";
    const profile = {
      currentStatus: optionalProfileText(member?.currentStatus ?? member?.occupation),
      currentActivity: optionalProfileText(member?.currentActivity),
      repeatedRoles: optionalProfileList(member?.repeatedRoles),
      naturalStrengths: optionalProfileList(member?.naturalStrengths),
      stressfulSituations: optionalProfileList(member?.stressfulSituations),
      selfDiscoveryGoal: optionalProfileText(member?.selfDiscoveryGoal),
      currentConcern: optionalProfileText(member?.currentConcern ?? member?.bio),
    };
    const answerPrompt = resolved.map((answer, index) => `Q${index + 1}: ${answer.question}\n回答: ${answer.optionId}. ${answer.answer}${supplements[answer.questionId] ? `\n補足: ${supplements[answer.questionId]}` : ""}`).join("\n\n");
    const profileLines = [
      profile.currentStatus && `現在の状況: ${profile.currentStatus}`,
      profile.currentActivity && `現在の仕事・主な活動: ${profile.currentActivity}`,
      profile.repeatedRoles.length > 0 && `繰り返してきた役割: ${profile.repeatedRoles.join("、")}`,
      profile.naturalStrengths.length > 0 && `自然にできること（自己評価）: ${profile.naturalStrengths.join("、")}`,
      profile.stressfulSituations.length > 0 && `負担を感じやすい状況: ${profile.stressfulSituations.join("、")}`,
      profile.selfDiscoveryGoal && `今、自分について知りたいこと: ${profile.selfDiscoveryGoal}`,
      profile.currentConcern && `最近の気がかり・違和感: ${profile.currentConcern}`,
    ].filter((line): line is string => Boolean(line));
    const profilePrompt = profileLines.length > 0
      ? `以下は利用者が入力したプロフィールです。5つの質問への回答と照合し、矛盾があれば消さずに二面性として扱ってください。入力されていない項目は推測しないでください。\n${profileLines.join("\n")}`
      : "プロフィールは入力されていません。プロフィールを推測・補完せず、5つの質問への回答だけを根拠に分析してください。";

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
    const maxTokens = plan === "paid" ? 3500 : 2500;
    const userPrompt = `# 5つの質問への回答\n${answerPrompt}\n\n# プロフィール情報\n${profilePrompt}\n\n# 分析の深さ\n${buildOutputInstruction(plan)}`;
    const createJsonFallback = () => anthropic.messages.create({
      model, max_tokens: maxTokens,
      system: `${buildSystemPrompt(plan)}\nJSONオブジェクトだけを出力してください。Markdownのコードブロックや前置きは付けないでください。`,
      messages: [{ role: "user", content: `${userPrompt}\n\n${buildJsonFallbackGuide(plan)}` }],
    });
    let message;
    if (plan === "paid") {
      // 有料版の詳細スキーマはAnthropicのgrammar上限を超えるため、簡潔なJSONガイドを直接使用する。
      message = await createJsonFallback();
    } else {
      try {
        message = await anthropic.messages.create({
          model, max_tokens: maxTokens, system: buildSystemPrompt(plan),
          messages: [{ role: "user", content: userPrompt }],
          output_config: { format: { type: "json_schema", schema: buildDiagnosisSchema(plan) } },
        });
      } catch (cause) {
        if (!isSchemaCompatibilityError(cause)) throw cause;
        console.warn("構造化出力スキーマが拒否されたため、JSONフォールバックで再実行します。", cause);
        message = await createJsonFallback();
      }
    }
    if (message.stop_reason === "max_tokens" || message.stop_reason === "model_context_window_exceeded") throw new Error("AI分析結果が出力上限で途切れました。");
    const text = message.content.find((block) => block.type === "text")?.text ?? "";
    const parsed = parseGeneratedJson(text) as { result: AnalysisResult; careerRoadmap: CareerRoadmap };
    validateResult(parsed, plan);
    normalizeGeneratedResult(parsed, plan);
    parsed.result.plan = plan;
    const doc = await Diagnosis.create({ userId, answers: { selections: resolved, supplements, profile }, result: parsed.result, careerRoadmap: parsed.careerRoadmap, plan });
    return NextResponse.json(serializeDiagnosis(doc.toObject()), { status: 201 });
  } catch (error) {
    console.error("AI自分探しの実行に失敗しました。", error);
    return NextResponse.json({ error: "AI自分探しを実行できませんでした。時間をおいて再度お試しください。" }, { status: 500 });
  }
}

function buildSystemPrompt(plan: Plan) {
  return `あなたは、無意識の選択、過去の行動、現在の状況から共通する価値観や行動原理を言語化する自己理解パートナーです。既存の性格タイプへ分類せず、複数回答を横断して本人がまだ言葉にできていない自分らしさを翻訳してください。
必須方針:
1. 一つの回答だけで決めず、複数箇所の共通点を根拠にする。
2. 最近の音楽等が示す現在の状態と、役割や最上位価値観が示す長期傾向を分ける。
3. 自由記述の具体的経験を重視する。
4. 矛盾は消さず二面性として扱う。
5. 事実、本人の自己認識、AIの仮説を区別する。
6. 誰にでも当てはまる表現で終わらず行動への現れ方まで具体化する。
7. 心理状態、病名、適職、未来を断定しない。
8. 美化せず、性質が強く出た際の葛藤も穏やかに示す。
9. 未回答は推測で埋めない。
10. 指定されたJSON構造に厳密に従う。
11. 選択肢の文言、記号、回答内容を結果へ再掲・引用・言い換えしない。複数回答を横断して導いた洞察だけを書く。
12. 同じ内容を複数項目で繰り返さず、各項目は指定文字数内で簡潔にする。
今回のプランは${plan === "paid" ? "有料詳細診断" : "無料簡易診断"}です。`;
}

function buildOutputInstruction(plan: Plan) {
  return plan === "paid"
    ? "詳細診断として、短い文章と数値で視覚化しやすく構造化してください。coreElementsは強み3件、traitScoresは指定6軸、valuePrioritiesは上位3件、環境は各2件、reflectionQuestionsは2件に限定します。careerRoadmapはimmediateを3件、shortTermを3か月、midTermを半年〜1年、longTermを1〜3年で各200文字以内にしてください。"
    : "簡易診断として、title、短いessence、coreElements 2件、currentNeeds、duality（長所と注意点）、reflectionQuestions 1件、今日からできるimmediate 3件、shortTerm、短いmessageに絞ってください。環境分析と詳細根拠は生成しません。midTermとlongTermは『詳細版でご案内します』としてください。";
}

function buildDiagnosisSchema(plan: Plan): Record<string, unknown> {
  const text = (maxLength = 500) => ({ type: "string", minLength: 1, maxLength });
  const stringList = (minItems: number, maxLength = 500) => ({ type: "array", minItems: minItems === 0 ? 0 : 1, items: text(maxLength) });
  const emptyList = () => ({ type: "array", minItems: 0, items: text(1) });
  const coreElement = { type: "object", additionalProperties: false, required: ["name", "tendency", "behavior"], properties: { name: text(50), tendency: text(160), behavior: text(180) } };
  return {
    type: "object",
    additionalProperties: false,
    required: ["result", "careerRoadmap"],
    properties: {
      result: {
        type: "object", additionalProperties: false,
        required: ["plan", "title", "essence", "coreElements", "bestEnvironments", "stressfulEnvironments", "duality", "currentNeeds", "reflectionQuestions", "confidence", "message"],
        properties: {
          plan: { type: "string", enum: [plan] },
          title: text(80),
          essence: text(260),
          coreElements: { type: "array", minItems: 1, items: coreElement },
          bestEnvironments: emptyList(), stressfulEnvironments: emptyList(),
          duality: text(220), currentNeeds: text(180), reflectionQuestions: stringList(1, 160),
          confidence: {
            type: "object", additionalProperties: false, required: ["certain", "hypotheses", "unknown"],
            properties: { certain: emptyList(), hypotheses: emptyList(), unknown: emptyList() },
          },
          message: text(180),
        },
      },
      careerRoadmap: {
        type: "object", additionalProperties: false, required: ["immediate", "shortTerm", "midTerm", "longTerm"],
        properties: { immediate: stringList(1, 180), shortTerm: text(220), midTerm: text(30), longTerm: text(30) },
      },
    },
  };
}

function validateResult(value: { result?: AnalysisResult; careerRoadmap?: CareerRoadmap }, plan: Plan) {
  if (!value.result?.title || !value.result?.essence || !Array.isArray(value.result.coreElements) || !Array.isArray(value.result.reflectionQuestions) || !value.result.confidence || !Array.isArray(value.result.confidence.certain) || !Array.isArray(value.result.confidence.hypotheses) || !Array.isArray(value.result.confidence.unknown) || !value.careerRoadmap?.shortTerm || !Array.isArray(value.careerRoadmap.immediate)) throw new Error("AI分析結果の形式が不正です。");
  if (plan === "paid") {
    const premium = value.result.premiumAnalysis;
    if (!premium || !Array.isArray(premium.traitScores) || !Array.isArray(premium.valuePriorities) || !Array.isArray(premium.goodEnvironments) || !Array.isArray(premium.cautionEnvironments) || !value.careerRoadmap?.midTerm || !value.careerRoadmap?.longTerm) throw new Error("有料版AI分析結果の形式が不正です。");
  }
  if (value.result.plan !== plan) value.result.plan = plan;
}

function normalizeGeneratedResult(value: { result: AnalysisResult; careerRoadmap: CareerRoadmap }, plan: Plan) {
  value.result.coreElements = value.result.coreElements.slice(0, plan === "paid" ? 3 : 2);
  value.result.reflectionQuestions = value.result.reflectionQuestions.slice(0, plan === "paid" ? 3 : 1);
  value.result.bestEnvironments = [];
  value.result.stressfulEnvironments = [];
  value.careerRoadmap.immediate = value.careerRoadmap.immediate.slice(0, 3);

  if (plan === "free") {
    value.result.confidence = { certain: [], hypotheses: [], unknown: [] };
    delete value.result.premiumAnalysis;
    value.careerRoadmap.midTerm = "詳細版でご案内します";
    value.careerRoadmap.longTerm = "詳細版でご案内します";
    return;
  }

  const premium = value.result.premiumAnalysis;
  if (!premium) return;
  premium.traitScores = premium.traitScores.slice(0, 6).map((item) => ({ ...item, score: normalizeScore(item.score) }));
  premium.valuePriorities = premium.valuePriorities.slice(0, 3).map((item) => ({ ...item, score: normalizeScore(item.score) }));
  premium.goodEnvironments = premium.goodEnvironments.slice(0, 2);
  premium.cautionEnvironments = premium.cautionEnvironments.slice(0, 2);
  value.result.confidence = { certain: [], hypotheses: [], unknown: [] };
}

function isSchemaCompatibilityError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; message?: unknown };
  return candidate.status === 400 && typeof candidate.message === "string"
    && (candidate.message.includes("output_config.format.schema") || candidate.message.includes("compiled grammar is too large"));
}

function parseGeneratedJson(text: string) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("AI分析結果にJSONが含まれていません。");
  return JSON.parse(trimmed.slice(start, end + 1));
}

function normalizeScore(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, Math.round(number))) : 50;
}

function buildJsonFallbackGuide(plan: Plan) {
  const common = `JSONの最上位はresultとcareerRoadmap。resultにはplan,title,essence,coreElements:[{name,tendency,behavior}],bestEnvironments,stressfulEnvironments,duality,currentNeeds,reflectionQuestions,confidence:{certain,hypotheses,unknown},messageを含める。careerRoadmapにはimmediate,shortTerm,midTerm,longTermを含める。文章は各値1〜2文で簡潔にする。`;
  if (plan === "free") return `${common}\ncoreElementsは2件、reflectionQuestionsは1件、immediateは3件。bestEnvironmentsとstressfulEnvironments、confidence内の各配列は空配列にする。`;
  return `${common}\nresult.planはpaid。bestEnvironmentsとstressfulEnvironments、confidence内の各配列は空配列にする。resultにpremiumAnalysisを追加し、次の小さなキー構造だけを厳守する。
premiumAnalysis: {
traitScores:[{label,score}], valuePriorities:[{name,score,insight}],
goodEnvironments:[string], cautionEnvironments:[string]
}
traitScoresは「自律性」「安定志向」「変化・刺激」「対人協調」「表現・創造」「探究・成長」をこの順で0〜100の6件。valuePrioritiesとcoreElementsは3件、goodEnvironmentsとcautionEnvironmentsとreflectionQuestionsは2件、immediateは3件にする。shortTermは3か月、midTermは半年〜1年、longTermは1〜3年の具体策を各200文字以内で書く。回答文は再掲しない。`;
}

function optionalProfileText(value: unknown) {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  return !normalized || normalized === "未回答" ? "" : normalized;
}

function optionalProfileList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(optionalProfileText).filter(Boolean);
}
