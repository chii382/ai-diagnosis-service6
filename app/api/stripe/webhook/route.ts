import { NextResponse } from "next/server";
import Stripe from "stripe";
import { applyCheckoutSession, applyStripeSubscription, getStripe } from "@/lib/stripe-billing";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook設定が不足しています。" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch (error) {
    console.error("Stripe Webhookの署名検証に失敗しました。", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await applyCheckoutSession(event.data.object);
        break;
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applyStripeSubscription(event.data.object);
        break;
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Stripe Webhook処理に失敗しました: ${event.type}`, error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
