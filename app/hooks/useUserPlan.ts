"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type UserPlan = "free" | "paid";
let cachedPlan: UserPlan | null = null;
let planRequest: Promise<UserPlan> | null = null;

function requestPlan() {
  if (cachedPlan) return Promise.resolve(cachedPlan);
  if (!planRequest) {
    planRequest = fetch("/api/user/plan")
      .then(async (response) => {
        if (!response.ok) throw new Error("plan-fetch-failed");
        const data = await response.json() as { plan?: UserPlan };
        cachedPlan = data.plan === "paid" ? "paid" : "free";
        return cachedPlan;
      })
      .finally(() => { planRequest = null; });
  }
  return planRequest;
}

export function useUserPlan() {
  const { status } = useSession();
  const [plan, setPlan] = useState<UserPlan | null>(status === "authenticated" ? cachedPlan : null);

  useEffect(() => {
    if (status !== "authenticated") {
      setPlan(null);
      return;
    }
    let active = true;
    void requestPlan().then((value) => { if (active) setPlan(value); }).catch(() => { if (active) setPlan("free"); });
    return () => { active = false; };
  }, [status]);

  return { plan, loading: status === "loading" || (status === "authenticated" && plan === null) };
}
