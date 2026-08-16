import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongoose from "@/lib/mongoose";
import Diagnosis from "@/models/Diagnosis";
import { requireDiagnosisUser, serializeDiagnosis } from "@/lib/diagnosis";

type Context = { params: Promise<{ id: string }> };
async function scope(context: Context) {
  const userId = await requireDiagnosisUser();
  const { id } = await context.params;
  return userId && Types.ObjectId.isValid(id) ? { _id: id, userId } : null;
}
export async function GET(_: Request, context: Context) {
  const filter = await scope(context); if (!filter) return NextResponse.json({ error: "認証またはIDが不正です。" }, { status: 400 });
  await connectMongoose(); const doc = await Diagnosis.findOne(filter).lean();
  return doc ? NextResponse.json(serializeDiagnosis(doc)) : NextResponse.json({ error: "診断結果が見つかりません。" }, { status: 404 });
}
export async function PUT(request: Request, context: Context) {
  const filter = await scope(context); if (!filter) return NextResponse.json({ error: "認証またはIDが不正です。" }, { status: 400 });
  const body = await request.json();
  const essence = String(body?.essence ?? "").trim(); const message = String(body?.message ?? "").trim();
  if (!essence || !message || essence.length > 3000 || message.length > 3000) return NextResponse.json({ error: "本質とメッセージを1〜3000文字で入力してください。" }, { status: 400 });
  await connectMongoose(); const doc = await Diagnosis.findOneAndUpdate(filter, { $set: { "result.essence": essence, "result.message": message } }, { new: true }).lean();
  return doc ? NextResponse.json(serializeDiagnosis(doc)) : NextResponse.json({ error: "診断結果が見つかりません。" }, { status: 404 });
}
export async function DELETE(_: Request, context: Context) {
  const filter = await scope(context); if (!filter) return NextResponse.json({ error: "認証またはIDが不正です。" }, { status: 400 });
  await connectMongoose(); const doc = await Diagnosis.findOneAndDelete(filter);
  return doc ? NextResponse.json({ success: true }) : NextResponse.json({ error: "診断結果が見つかりません。" }, { status: 404 });
}
