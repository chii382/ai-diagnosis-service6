import { NextResponse } from "next/server";

// 開発確認用の任意プラン変更機能は廃止済みです。
export async function PATCH() {
  return NextResponse.json({ error: "この機能は利用できません。" }, { status: 410 });
}
