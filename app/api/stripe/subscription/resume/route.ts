import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { getStripe, subscriptionPeriodEnd } from "@/lib/stripe-billing";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });

    const filter = session.user.id && ObjectId.isValid(session.user.id)
      ? { _id: new ObjectId(session.user.id) }
      : session.user.email ? { email: session.user.email.toLowerCase() } : null;
    if (!filter) return NextResponse.json({ error: "ユーザーを特定できません。" }, { status: 400 });

    const db = (await clientPromise).db();
    const member = await db.collection("users").findOne(filter, {
      projection: { plan: 1, stripeSubscriptionId: 1, cancelAtPeriodEnd: 1 },
    });
    if (!member || member.plan !== "paid" || !member.stripeSubscriptionId) {
      return NextResponse.json({ error: "継続できる有料プランが見つかりません。" }, { status: 409 });
    }

    const subscription = await getStripe().subscriptions.update(String(member.stripeSubscriptionId), {
      cancel_at_period_end: false,
    });
    const periodEnd = subscriptionPeriodEnd(subscription);
    await db.collection("users").updateOne(filter, {
      $set: {
        plan: "paid",
        subscriptionStatus: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        subscriptionCurrentPeriodEnd: periodEnd,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ resumed: true, periodEnd: periodEnd?.toISOString() });
  } catch (error) {
    console.error("Stripeサブスクリプションの解約予約取消に失敗しました。", error);
    return NextResponse.json({ error: "継続手続きを完了できませんでした。時間をおいて再度お試しください。" }, { status: 500 });
  }
}
