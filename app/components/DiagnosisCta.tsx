"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { setGlobalBusy } from "./GlobalBusyIndicator";

export function DiagnosisCta({ children, variant = "primary", paid = false, comingSoon = false }: { children: ReactNode; variant?: "light" | "primary" | "gold"; paid?: boolean; comingSoon?: boolean }) {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!showComingSoon) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowComingSoon(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showComingSoon]);

  if (comingSoon) {
    return (
      <>
        <button type="button" className={`crystal-button ${variant}`} onClick={() => setShowComingSoon(true)}>
          <span aria-hidden="true">✦</span>{children}
        </button>
        {showComingSoon && (
          <div className="coming-soon-backdrop" role="presentation" onClick={() => setShowComingSoon(false)}>
            <div className="coming-soon-dialog" role="dialog" aria-modal="true" aria-labelledby="coming-soon-title" onClick={(event) => event.stopPropagation()}>
              <span className="coming-soon-sparkle" aria-hidden="true">✦</span>
              <h2 id="coming-soon-title">COMING SOON</h2>
              <p>診断サービスは現在準備中です。<br />公開まで今しばらくお待ちください。</p>
              <button type="button" onClick={() => setShowComingSoon(false)}>閉じる</button>
            </div>
          </div>
        )}
      </>
    );
  }

  const scrollToPlan = () => {
    const target = document.getElementById(paid ? "paid-plan" : "free-plan");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startFreePlan = () => {
    setGlobalBusy(true);
    router.push(status === "authenticated" ? "/dashboard" : "/auth/signin?callbackUrl=%2Fdashboard");
  };

  return (
    <button type="button" className={`crystal-button ${variant}`} disabled={!paid && status === "loading"} onClick={paid ? scrollToPlan : startFreePlan}>
      <span aria-hidden="true">✦</span>{children}
    </button>
  );
}
