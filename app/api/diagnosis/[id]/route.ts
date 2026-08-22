import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongoose from "@/lib/mongoose";
import Diagnosis from "@/models/Diagnosis";
import { requirePaidDiagnosisUser, serializeDiagnosis } from "@/lib/diagnosis";

type Context = { params: Promise<{ id: string }> };
async function scope(context: Context) {
  const access = await requirePaidDiagnosisUser();
  const { id } = await context.params;
  if (!access.authenticated) return { error: "認証が必要です。", status: 401 as const, filter: null };
  if (!access.paid) return { error: "診断履歴は有料プラン限定の機能です。", status: 403 as const, filter: null };
  return Types.ObjectId.isValid(id)
    ? { error: null, status: 200 as const, filter: { _id: id, userId: access.userId } }
    : { error: "診断結果のIDが不正です。", status: 400 as const, filter: null };
}
export async function GET(_: Request, context: Context) {
  const access = await scope(context); if (!access.filter) return NextResponse.json({ error: access.error }, { status: access.status }); const filter = access.filter;
  await connectMongoose(); const doc = await Diagnosis.findOne(filter).lean();
  return doc ? NextResponse.json(serializeDiagnosis(doc)) : NextResponse.json({ error: "診断結果が見つかりません。" }, { status: 404 });
}
export async function DELETE(_: Request, context: Context) {
  const access = await scope(context); if (!access.filter) return NextResponse.json({ error: access.error }, { status: access.status }); const filter = access.filter;
  await connectMongoose(); const doc = await Diagnosis.findOneAndDelete(filter);
  return doc ? NextResponse.json({ success: true }) : NextResponse.json({ error: "診断結果が見つかりません。" }, { status: 404 });
}
