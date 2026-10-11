"use client";

import { useSession } from "next-auth/react";
import { useId } from "react";
import { useUserPlan } from "@/app/hooks/useUserPlan";
import { CheckoutButton } from "./CheckoutButton";

export function HeroPurchaseCta() {
  const hintId = useId();
  const { status } = useSession();
  const { plan, loading, error } = useUserPlan();
  const showHint = status === "unauthenticated" ||
    (status === "authenticated" && !loading && !error && plan === "free");

  return (
    <div className="hero-purchase-cta">
      {showHint && <span className="hero-purchase-bubble" id={hintId}>有料プランお申込み</span>}
      <CheckoutButton className="crystal-button primary" label="今すぐ本当の自分と向き合ってみる" subscribedLabel="今すぐ本当の自分と向き合ってみる" describedBy={showHint ? hintId : undefined} />
    </div>
  );
}
