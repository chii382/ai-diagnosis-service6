import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import connectMongoose from "@/lib/mongoose";
import Diagnosis from "@/models/Diagnosis";
import { InteriorShell } from "@/app/components/InteriorShell";
import { DiagnosisResultView } from "../DiagnosisResultView";
import { DiagnosisActions } from "./DiagnosisActions";
import { serializeDiagnosis, type DiagnosisData } from "@/lib/diagnosis";

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/diagnosis/history");
  const { id } = await params;
  if (!ObjectId.isValid(id) || !session.user.id || !ObjectId.isValid(session.user.id)) notFound();
  await connectMongoose();
  const doc = await Diagnosis.findOne({ _id: id, userId: new ObjectId(session.user.id) }).lean();
  if (!doc) notFound();
  const raw = serializeDiagnosis(doc);
  const data = { ...raw, createdAt: String(raw.createdAt ?? ""), updatedAt: String(raw.updatedAt ?? "") } as DiagnosisData;
  return <InteriorShell variant="diagnosis-detail" wide eyebrow="INNER COMPASS RECORD" title="自分探しの結果詳細" description="その時のあなたが選んだものと、そこから生まれた言葉を振り返れます。"><DiagnosisResultView data={data} /><DiagnosisActions id={id} /></InteriorShell>;
}
