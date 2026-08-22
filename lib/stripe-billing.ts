import Stripe from "stripe";
import { ObjectId, type Filter } from "mongodb";
import clientPromise from "@/lib/mongodb";

const paidStatuses = new Set<Stripe.Subscription.Status>(["active", "trialing", "past_due"]);

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(key);
}

function userFilter(userId?: string | null, email?: string | null): Filter<Record<string, unknown>> | null {
  if (userId && ObjectId.isValid(userId)) return { _id: new ObjectId(userId) };
  if (email) return { email: email.toLowerCase() };
  return null;
}

function stripeId(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const timestamps = subscription.items.data.map((item) => item.current_period_end).filter(Number.isFinite);
  return timestamps.length ? new Date(Math.max(...timestamps) * 1000) : null;
}

export async function applyStripeSubscription(
  subscription: Stripe.Subscription,
  fallback?: { userId?: string | null; email?: string | null },
) {
  const db = (await clientPromise).db();
  const customerId = stripeId(subscription.customer);
  const metadataUserId = subscription.metadata?.userId;
  const metadataEmail = subscription.metadata?.userEmail;
  const filter = userFilter(metadataUserId || fallback?.userId, metadataEmail || fallback?.email)
    ?? (customerId ? { stripeCustomerId: customerId } : null);
  if (!filter) return false;

  const plan = paidStatuses.has(subscription.status) ? "paid" : "free";
  const result = await db.collection("users").updateOne(filter, {
    $set: {
      plan,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      subscriptionCurrentPeriodEnd: subscriptionPeriodEnd(subscription),
      updatedAt: new Date(),
    },
  });
  return result.matchedCount > 0;
}

export async function refreshStripeSubscription(
  subscriptionId: string,
  fallback?: { userId?: string | null; email?: string | null },
) {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await applyStripeSubscription(subscription, fallback);
  return subscription;
}

export async function applyCheckoutSession(
  checkout: Stripe.Checkout.Session,
  fallback?: { userId?: string | null; email?: string | null },
) {
  const subscriptionId = stripeId(checkout.subscription);
  if (!subscriptionId || checkout.status !== "complete") return false;
  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return applyStripeSubscription(subscription, {
    userId: checkout.client_reference_id || checkout.metadata?.userId || fallback?.userId,
    email: checkout.customer_details?.email || checkout.customer_email || fallback?.email,
  });
}
