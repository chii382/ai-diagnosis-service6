import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// StripeのCheckout Sessionを作成するサーバーAPIです。
export async function POST() {
  try {
    const authSession = await auth();
    if (!authSession?.user?.email) {
      return NextResponse.json({ error: "購入にはログインが必要です。" }, { status: 401 });
    }
    // 秘密鍵はブラウザーへ渡さず、必ずサーバー側の環境変数から取得します。
    const secretKey = process.env.STRIPE_SECRET_KEY;
    // 購入する商品のPrice IDもサーバー側で決定し、金額の改ざんを防ぎます。
    const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
    // 成功・キャンセル後に戻るアプリのURLです。
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // 必須設定が不足している場合は、Stripeへ通信する前に分かりやすいエラーを返します。
    if (!secretKey || !priceId || !appUrl) {
      return NextResponse.json(
        { error: "Stripe Checkoutに必要な環境変数が設定されていません。" },
        { status: 500 },
      );
    }

    // 末尾のスラッシュを取り除き、URLにスラッシュが重複しないようにします。
    const baseUrl = appUrl.replace(/\/$/, "");
    // Stripeクライアントをテスト用秘密鍵で初期化します。
    const stripe = new Stripe(secretKey);
    const userId = authSession.user.id;
    const filter = userId && ObjectId.isValid(userId)
      ? { _id: new ObjectId(userId) }
      : { email: authSession.user.email.toLowerCase() };
    const member = await (await clientPromise).db().collection("users").findOne(filter, {
      projection: { plan: 1, stripeCustomerId: 1 },
    });
    if (member?.plan === "paid") {
      return NextResponse.json({ error: "すでに有料プランへお申し込み済みです。" }, { status: 409 });
    }
    const metadata = {
      ...(userId ? { userId } : {}),
      userEmail: authSession.user.email.toLowerCase(),
    };
    // 月額の継続Priceを購入するため、サブスクリプション用Checkout Sessionを作成します。
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      // 支払いを受け付けた後はsuccess画面へ移動します。確定処理は今後Webhookで行います。
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      // 購入を中止した場合は、穏やかな案内を表示するcancel画面へ移動します。
      cancel_url: `${baseUrl}/checkout/cancel`,
      client_reference_id: userId,
      metadata,
      subscription_data: { metadata },
      ...(member?.stripeCustomerId
        ? { customer: String(member.stripeCustomerId) }
        : { customer_email: authSession.user.email }),
    });

    // クライアントがStripe Checkoutへ移動するためのURLを返します。
    if (!session.url) {
      return NextResponse.json({ error: "Checkout URLを取得できませんでした。" }, { status: 502 });
    }
    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Stripeの内部情報や秘密情報をブラウザーへ返さず、サーバーログだけに残します。
    console.error("Stripe Checkout Sessionの作成に失敗しました。", error);
    return NextResponse.json(
      { error: "購入手続きを開始できませんでした。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }
}
