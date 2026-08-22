import { NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe SDKが必要とするNode.js環境で、このAPI Routeを実行します。
export const runtime = "nodejs";

// Stripeから送信されるWebhook通知を受け取ります。
export async function POST(request: Request) {
  // STEP 1: 署名検証に必要な材料を取得します。
  // JSONへ変換すると元の本文が変わる可能性があるため、必ず文字列のまま取得します。
  const body = await request.text();
  // Stripeがリクエストヘッダーへ付けた署名を取得します。
  const signature = request.headers.get("stripe-signature");
  // StripeダッシュボードまたはStripe CLIで発行されたWebhook署名シークレットです。
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // Stripe APIの秘密鍵は、ブラウザーへ公開せずサーバー側だけで使用します。
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  // 必須設定や署名が不足している場合は、安全のため処理を中止します。
  if (!signature || !webhookSecret || !stripeSecretKey) {
    return NextResponse.json({ error: "Webhookの設定または署名が不足しています。" }, { status: 400 });
  }

  // STEP 2: 受信した本文が本当にStripeから送られたものか署名検証します。
  let event: Stripe.Event;
  try {
    const stripe = new Stripe(stripeSecretKey);
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    // 署名が一致しない通知は信用せず、400エラーを返します。
    console.error("Stripe Webhookの署名検証に失敗しました。", error);
    return NextResponse.json({ error: "Webhookの署名を確認できませんでした。" }, { status: 400 });
  }

  // STEP 3: Stripeのイベント種別に応じて処理を分けます。
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // event.typeで絞り込まれるため、Stripe.Checkout.Sessionとして型安全に扱えます。
        const session = event.data.object;
        console.log("Checkout Session ID:", session.id);
        console.log("Customer email:", session.customer_details?.email ?? null);

        // TODO: 次のレッスンで、購入者に対応するユーザー情報をDBで更新します。
        break;
      }
      default:
        // 未対応イベントはエラーにせず、確認できるようログだけ残します。
        console.log("未対応のStripeイベントを受信しました:", event.type);
    }
  } catch (error) {
    // 署名検証後の処理で問題が起きてもStripeへ200を返し、受信自体は完了させます。
    console.error("Stripe Webhookイベントの処理中にエラーが発生しました。", error);
  }

  // STEP 4: 署名検証済みの通知には、最後に必ず200 OKを返します。
  return NextResponse.json({ received: true }, { status: 200 });
}
