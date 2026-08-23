import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
  const filter = session.user.id && ObjectId.isValid(session.user.id)
    ? { _id: new ObjectId(session.user.id) }
    : session.user.email ? { email: session.user.email.toLowerCase() } : null;
  if (!filter) return NextResponse.json({ error: "ユーザーを特定できません。" }, { status: 400 });
  const member = await (await clientPromise).db().collection("users").findOne(filter, { projection: { plan: 1 } });
  return NextResponse.json({ plan: member?.plan === "paid" ? "paid" : "free" });
}

// 開発確認用の任意プラン変更機能は廃止済みです。
export async function PATCH() {
  return NextResponse.json({ error: "この機能は利用できません。" }, { status: 410 });
}
