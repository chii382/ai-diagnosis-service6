import { Card, CardContent, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutButton } from "@/app/components/CheckoutButton";
import { InteriorShell } from "@/app/components/InteriorShell";

// ログイン認証とStripe Checkoutの間に置く、安全な中継画面です。
export default async function CheckoutStartPage() {
  const session = await auth();

  // 認証を確認できない場合は、ログイン後にこの画面へ戻るよう指定します。
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/checkout/start");
  }

  return (
    <InteriorShell eyebrow="SECURE CHECKOUT" title="購入手続きを準備しています" description="ログイン状態を確認しました。Stripeの安全な決済画面へ移動します。">
      <Card className="sanctuary-card">
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <Stack spacing={2.5} alignItems="center">
            <Typography color="text.secondary">画面が切り替わるまで、そのままお待ちください。</Typography>
            <CheckoutButton autoStart label="Stripe決済画面へ進む" />
          </Stack>
        </CardContent>
      </Card>
    </InteriorShell>
  );
}
