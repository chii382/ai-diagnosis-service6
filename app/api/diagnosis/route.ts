import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import connectMongoose from "@/lib/mongoose";
import clientPromise from "@/lib/mongodb";
import Diagnosis from "@/models/Diagnosis";
import { requireDiagnosisUser, serializeDiagnosis, type AnalysisResult, type CareerRoadmap, type Plan } from "@/lib/diagnosis";
import { diagnosisQuestions, resolveAnswers } from "@/lib/diagnosis-questions";

export async function GET() {
  try {
    const userId = await requireDiagnosisUser();
    if (!userId) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    await connectMongoose();
    const docs = await Diagnosis.find({ userId }).sort({ createdAt: -1 }).lean();
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

    const client = await clientPromise;
    const member = await client.db().collection("users").findOne({ _id: userId });
    const plan: Plan = member?.plan === "paid" ? "paid" : "free";
    const profile = {
      currentStatus: member?.currentStatus ?? member?.occupation ?? "未回答",
      currentActivity: member?.currentActivity ?? "未回答",
      repeatedRoles: Array.isArray(member?.repeatedRoles) ? member.repeatedRoles : [],
      naturalStrengths: Array.isArray(member?.naturalStrengths) ? member.naturalStrengths : [],
      stressfulSituations: Array.isArray(member?.stressfulSituations) ? member.stressfulSituations : [],
      selfDiscoveryGoal: member?.selfDiscoveryGoal ?? "未回答",
      currentConcern: member?.currentConcern ?? member?.bio ?? "未回答",
    };
    const answerPrompt = resolved.map((answer, index) => `Q${index + 1}: ${answer.question}\n回答: ${answer.optionId}. ${answer.answer}${supplements[answer.questionId] ? `\n補足: ${supplements[answer.questionId]}` : ""}`).join("\n\n");
    const profilePrompt = [
      `現在の状況: ${profile.currentStatus}`,
      `現在の仕事・主な活動: ${profile.currentActivity}`,
      `繰り返してきた役割: ${profile.repeatedRoles.join("、") || "未回答"}`,
      `自然にできること（自己評価）: ${profile.naturalStrengths.join("、") || "未回答"}`,
      `負担を感じやすい状況: ${profile.stressfulSituations.join("、") || "未回答"}`,
      `今、自分について知りたいこと: ${profile.selfDiscoveryGoal}`,
      `最近の気がかり・違和感: ${profile.currentConcern}`,
    ].join("\n");

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: plan === "paid" ? 8000 : 6000,
      system: buildSystemPrompt(plan),
      messages: [{ role: "user", content: `# 5つの質問への回答\n${answerPrompt}\n\n# プロフィール情報\n${profilePrompt}\n\n# 分析の深さ\n${buildOutputInstruction(plan)}` }],
      output_config: { format: { type: "json_schema", schema: buildDiagnosisSchema(plan) } },
    });
    if (message.stop_reason === "max_tokens" || message.stop_reason === "model_context_window_exceeded") throw new Error("AI分析結果が出力上限で途切れました。");
    const text = message.content.find((block) => block.type === "text")?.text ?? "";
    const parsed = JSON.parse(text) as { result: AnalysisResult; careerRoadmap: CareerRoadmap };
    validateResult(parsed, plan);
    parsed.result.plan = plan;
    await connectMongoose();
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
10. 指定されたJSONスキーマに厳密に従う。
今回のプランは${plan === "paid" ? "有料詳細診断" : "無料簡易診断"}です。`;
}

function buildOutputInstruction(plan: Plan) {
  return plan === "paid"
    ? "coreElementsは3件、bestEnvironmentsは3件、stressfulEnvironmentsは2〜3件、reflectionQuestionsは3件。全項目を具体的に詳しく記述してください。careerRoadmapは本人専用の具体策として、immediateを3件、shortTermを今後3か月、midTermを半年〜1年、longTermを1〜3年で記述してください。"
    : "簡易診断として、coreElementsは2件、bestEnvironmentsとstressfulEnvironmentsは各1〜2件、reflectionQuestionsは1件に絞ってください。dualityとconfidenceは短くしてください。careerRoadmapはimmediateを3件とshortTermだけ具体的にし、midTermとlongTermには『有料プランで詳しく分析できます』と入れてください。";
}

function buildDiagnosisSchema(plan: Plan): Record<string, unknown> {
  const count = (free: number, paid: number) => plan === "paid" ? paid : free;
  const text = (maxLength = 500) => ({ type: "string", minLength: 1, maxLength });
  const stringList = (_minItems: number, _maxItems: number, maxLength = 500) => ({ type: "array", minItems: 1, items: text(maxLength) });
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
          essence: text(700),
          coreElements: {
            type: "array", minItems: 1,
            items: { type: "object", additionalProperties: false, required: ["name", "tendency", "evidence", "behavior"], properties: { name: text(60), tendency: text(400), evidence: text(400), behavior: text(400) } },
          },
          bestEnvironments: stringList(count(1, 3), count(2, 3), 350),
          stressfulEnvironments: stringList(count(1, 2), count(2, 3), 350),
          duality: text(500),
          currentNeeds: text(500),
          reflectionQuestions: stringList(count(1, 3), count(1, 3), 250),
          confidence: {
            type: "object", additionalProperties: false, required: ["certain", "hypotheses", "unknown"],
            properties: { certain: stringList(1, 3, 300), hypotheses: stringList(1, 3, 300), unknown: stringList(1, 3, 300) },
          },
          message: text(500),
        },
      },
      careerRoadmap: {
        type: "object", additionalProperties: false, required: ["immediate", "shortTerm", "midTerm", "longTerm"],
        properties: { immediate: stringList(3, 3, 300), shortTerm: text(600), midTerm: text(600), longTerm: text(600) },
      },
    },
  };
}

function validateResult(value: { result?: AnalysisResult; careerRoadmap?: CareerRoadmap }, plan: Plan) {
  if (!value.result?.title || !value.result?.essence || !Array.isArray(value.result.coreElements) || !value.careerRoadmap?.shortTerm || !Array.isArray(value.careerRoadmap.immediate)) throw new Error("AI分析結果の形式が不正です。");
  if (value.result.plan !== plan) value.result.plan = plan;
}
