import { auth } from "@/auth";
import { ObjectId } from "mongodb";

export type Plan = "free" | "paid";
export type AnswerItem = { questionId: string; question: string; optionId: string; answer: string };
export type CoreElement = { name: string; tendency: string; evidence: string; behavior: string };
export type Confidence = { certain: string[]; hypotheses: string[]; unknown: string[] };
export type AnalysisResult = {
  plan: Plan;
  title: string;
  essence: string;
  coreElements: CoreElement[];
  bestEnvironments: string[];
  stressfulEnvironments: string[];
  duality: string;
  currentNeeds: string;
  reflectionQuestions: string[];
  confidence: Confidence;
  message: string;
};
export type CareerRoadmap = { immediate: string[]; shortTerm: string; midTerm: string; longTerm: string };
export type DiagnosisData = { id: string; answers: { selections: AnswerItem[]; supplements?: Record<string, string>; profile?: unknown }; result: AnalysisResult; careerRoadmap: CareerRoadmap; plan: Plan; createdAt: string; updatedAt?: string };

export async function requireDiagnosisUser() {
  const session = await auth();
  if (!session?.user) return null;
  const id = session.user.id;
  return id && ObjectId.isValid(id) ? new ObjectId(id) : null;
}

type DiagnosisShape = { _id: unknown; answers: unknown; result: unknown; careerRoadmap: unknown; plan?: unknown; createdAt?: Date; updatedAt?: Date };
export function serializeDiagnosis(doc: DiagnosisShape) {
  const source = (doc.result ?? {}) as Partial<AnalysisResult> & { summary?: string; strengths?: string[]; advice?: string };
  const plan: Plan = doc.plan === "paid" || source.plan === "paid" ? "paid" : "free";
  const result: AnalysisResult = {
    plan,
    title: source.title ?? "過去の診断結果",
    essence: source.essence ?? source.summary ?? "記録された分析内容がありません。",
    coreElements: source.coreElements ?? (source.strengths ?? []).map((strength) => ({ name: strength, tendency: strength, evidence: "旧診断結果から移行", behavior: "" })),
    bestEnvironments: source.bestEnvironments ?? [],
    stressfulEnvironments: source.stressfulEnvironments ?? [],
    duality: source.duality ?? "旧診断では分析されていません。",
    currentNeeds: source.currentNeeds ?? "旧診断では分析されていません。",
    reflectionQuestions: source.reflectionQuestions ?? [],
    confidence: source.confidence ?? { certain: [], hypotheses: [], unknown: ["旧形式の診断結果のため、確からしさは記録されていません。"] },
    message: source.message ?? source.advice ?? "この結果を、今の自分と照らし合わせて振り返ってみてください。",
  };
  const sourceRoadmap = (doc.careerRoadmap ?? {}) as Partial<CareerRoadmap>;
  const careerRoadmap: CareerRoadmap = {
    immediate: sourceRoadmap.immediate ?? [],
    shortTerm: sourceRoadmap.shortTerm ?? "",
    midTerm: sourceRoadmap.midTerm ?? "",
    longTerm: sourceRoadmap.longTerm ?? "",
  };
  return {
    id: String(doc._id), answers: doc.answers, result,
    careerRoadmap, plan, createdAt: doc.createdAt, updatedAt: doc.updatedAt,
  };
}
