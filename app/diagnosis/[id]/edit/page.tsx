import { notFound, redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import connectMongoose from "@/lib/mongoose";
import Diagnosis from "@/models/Diagnosis";
import { InteriorShell } from "@/app/components/InteriorShell";
import { EditDiagnosisForm } from "./EditDiagnosisForm";
import type { AnalysisResult } from "@/lib/diagnosis";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/diagnosis/history");
  const { id } = await params;
  if (!ObjectId.isValid(id) || !session.user.id || !ObjectId.isValid(session.user.id)) notFound();
  await connectMongoose();
  const doc = await Diagnosis.findOne({ _id: id, userId: new ObjectId(session.user.id) }).lean();
  if (!doc) notFound();
  const result = doc.result as AnalysisResult;
  return <InteriorShell eyebrow="REFINE YOUR RECORD" title="自分探しの結果を編集" description="AIの言葉を受け取った後の気づきも含め、あなた自身の記録へ育てましょう。"><EditDiagnosisForm id={id} initialEssence={result.essence ?? ""} initialMessage={result.message ?? ""} /></InteriorShell>;
}
