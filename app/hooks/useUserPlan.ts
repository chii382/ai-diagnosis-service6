"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type UserPlan = "free" | "paid";
const planRequests = new Map<string, Promise<UserPlan>>();

function requestPlan(userId: string) {
  let planRequest = planRequests.get(userId);
  if (!planRequest) {
    planRequest = fetch("/api/user/plan", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("plan-fetch-failed");
        const data = await response.json() as { plan?: UserPlan };
        return data.plan === "paid" ? "paid" : "free";
      })
      .finally(() => { planRequests.delete(userId); });
    planRequests.set(userId, planRequest);
  }
  return planRequest;
}

export function useUserPlan() {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setPlan(null);
      setError(false);
      return;
    }
    let active = true;
    setPlan(null);
    setError(false);
    void requestPlan(session?.user?.id || session?.user?.email || "current").then((value) => { if (active) setPlan(value); }).catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [status, session?.user?.id, session?.user?.email]);

  return { plan, error, loading: status === "loading" || (status === "authenticated" && plan === null && !error) };
}
