"use client";

import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useUserPlan } from "@/app/hooks/useUserPlan";

// Stripe Checkoutを開始する購入ボタンです。
export function CheckoutButton({
  label = "購入する",
  className,
  autoStart = false,
}: {
  label?: string;
  className?: string;
  autoStart?: boolean;
}) {
  const { status } = useSession();
  const { plan, loading: planLoading } = useUserPlan();
  const autoStarted = useRef(false);
  // 通信中かどうかを保持し、二重クリックを防ぎます。
  const [loading, setLoading] = useState(false);
  // エラーが起きたかどうかを保持し、再試行などの選択肢を表示します。
  const [hasError, setHasError] = useState(false);

  const startCheckout = useCallback(async () => {
    // 未ログインの場合は、認証成功後に購入を再開する中継画面を戻り先に指定します。
    if (status !== "authenticated") {
      window.location.assign("/auth/signin?callbackUrl=%2Fcheckout%2Fstart");
      return;
    }
    if (planLoading || plan === "paid") return;
    setLoading(true);
    setHasError(false);

    try {
      // サーバーAPIへCheckout Sessionの作成を依頼します。
      const response = await fetch("/api/checkout", { method: "POST" });
      // 画面側の表示とサーバー側の認証状態が食い違った場合も、Stripeへ進ませず再認証します。
      if (response.status === 401) {
        window.location.assign("/auth/signin?callbackUrl=%2Fcheckout%2Fstart");
        return;
      }
      const data = await response.json() as { url?: string };

      // HTTPエラー、またはURLがない応答を画面用エラーへ変換します。
      if (!response.ok || !data.url) {
        throw new Error("checkout-start-failed");
      }

      // Stripeが返したCheckout URLへブラウザーを移動します。
      window.location.assign(data.url);
    } catch {
      // 技術的な内容は表示せず、利用者が次の行動を選べる案内へ切り替えます。
      setHasError(true);
      setLoading(false);
    }
  }, [plan, planLoading, status]);

  // ログイン後の中継画面では、認証済みセッションを確認してから一度だけCheckoutを開始します。
  useEffect(() => {
    if (!autoStart || status !== "authenticated" || planLoading || plan === "paid" || autoStarted.current) return;
    autoStarted.current = true;
    void startCheckout();
  }, [autoStart, plan, planLoading, startCheckout, status]);

  if (hasError) {
    return (
      <Stack spacing={1.5}>
        <Alert severity="error">一時的な問題が発生しました</Alert>
        <Button className={className} type="button" variant="contained" size="large" onClick={() => void startCheckout()}>
          もう一度試す
        </Button>
        <Button component={Link} href="/contact" variant="outlined">
          お問い合わせ
        </Button>
        <Button component={Link} href="/">
          トップページへ戻る
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5}>
      <Button
        className={className}
        type="button"
        variant="contained"
        size="large"
        disabled={loading || (status === "authenticated" && (planLoading || plan === "paid"))}
        onClick={() => void startCheckout()}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
      >
        {loading ? "購入画面を準備中…" : plan === "paid" ? "有料プラン申込済み" : label}
      </Button>
    </Stack>
  );
}
