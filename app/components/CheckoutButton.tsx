"use client";

import { Alert, Button, CircularProgress, Stack } from "@mui/material";
import Link from "next/link";
import { useState } from "react";

// Stripe Checkoutを開始する購入ボタンです。
export function CheckoutButton({ label = "購入する", className }: { label?: string; className?: string }) {
  // 通信中かどうかを保持し、二重クリックを防ぎます。
  const [loading, setLoading] = useState(false);
  // エラーが起きたかどうかを保持し、再試行などの選択肢を表示します。
  const [hasError, setHasError] = useState(false);

  async function startCheckout() {
    setLoading(true);
    setHasError(false);

    try {
      // サーバーAPIへCheckout Sessionの作成を依頼します。
      const response = await fetch("/api/checkout", { method: "POST" });
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
  }

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
        disabled={loading}
        onClick={() => void startCheckout()}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
      >
        {loading ? "購入画面を準備中…" : label}
      </Button>
    </Stack>
  );
}
