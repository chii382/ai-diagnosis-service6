import { NextResponse } from "next/server";
import { Types } from "mongoose";
import connectMongoose from "@/lib/mongoose";
import Diagnosis from "@/models/Diagnosis";
import { requireAdmin } from "@/lib/admin";
import { reportAdminError } from "@/lib/admin-errors";
import { serializeDiagnosis } from "@/lib/diagnosis";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, context: Context) {
  const access = await requireAdmin();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const { id } = await context.params;
  if (!Types.ObjectId.isValid(id)) return NextResponse.json({ error: "診断IDが不正です。" }, { status: 400 });
  try {
    await connectMongoose();
    const doc = await Diagnosis.findById(id).lean();
    return doc ? NextResponse.json(serializeDiagnosis(doc)) : NextResponse.json({ error: "診断結果が見つかりません。" }, { status: 404 });
  } catch (error) {
    await reportAdminError(error, "管理者による診断詳細取得");
    return NextResponse.json({ error: "診断結果を取得できませんでした。" }, { status: 500 });
  }
}
