"use client";

import GoogleIcon from "@mui/icons-material/Google";
import { Alert, Button, Card, CardContent, CircularProgress, Typography } from "@mui/material";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { InteriorShell } from "@/app/components/InteriorShell";
import { setGlobalBusy } from "@/app/components/GlobalBusyIndicator";

export default function SignInPage() {
  return <Suspense fallback={<SignInFallback />}><SignInContent /></Suspense>;
}

function SignInContent() {
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const hasError = Boolean(params.get("error"));

  const login = async () => {
    setLoading(true);
    setGlobalBusy(true);
    try {
      await signIn("google", { redirectTo: callbackUrl });
    } finally {
      setLoading(false);
      setGlobalBusy(false);
    }
  };

  return (
    <InteriorShell variant="login" eyebrow="MEMBER ENTRANCE" title="会員ログイン" description="あなたの内なる光を見つける旅へ出発しましょう。">
      <Card className="sanctuary-card">
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <Typography variant="h5" component="h2" className="card-title" gutterBottom>Googleアカウントで続ける</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>安全な認証で、診断結果やプロフィールを大切に保管します。</Typography>
          {hasError && <Alert severity="error" sx={{ mb: 3 }}>ログインに失敗しました。もう一度お試しください。</Alert>}
          <Button fullWidth variant="contained" size="large" startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />} onClick={login} disabled={loading}>
            Googleでログイン
          </Button>
          <Button component="a" href="/?skipOpening=1#top" sx={{ mt: 2 }}>トップページへ戻る</Button>
        </CardContent>
      </Card>
    </InteriorShell>
  );
}

function SignInFallback() {
  return (
    <InteriorShell variant="login" eyebrow="MEMBER ENTRANCE" title="会員ログイン" description="あなたの内なる光を見つける旅へ出発しましょう。">
      <Card className="sanctuary-card"><CardContent sx={{ p: 6, textAlign: "center" }}><CircularProgress aria-label="読み込み中" /></CardContent></Card>
    </InteriorShell>
  );
}
