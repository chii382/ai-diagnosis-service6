import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { InteriorShell } from "@/app/components/InteriorShell";
import { auth } from "@/auth";
import { applyCheckoutSession, getStripe } from "@/lib/stripe-billing";

// Stripe Checkoutから支払い受付後に戻ってくるServer Componentです。
export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const [{ session_id: sessionId }, authSession] = await Promise.all([searchParams, auth()]);
  let reflected = false;
  if (sessionId && authSession?.user?.email) {
    try {
      const checkout = await getStripe().checkout.sessions.retrieve(sessionId);
      const identityMatches = checkout.client_reference_id
        ? checkout.client_reference_id === authSession.user.id
        : checkout.customer_details?.email?.toLowerCase() === authSession.user.email.toLowerCase();
      if (identityMatches) {
        reflected = await applyCheckoutSession(checkout, {
          userId: authSession.user.id,
          email: authSession.user.email,
        });
      }
    } catch (error) {
      console.error("Checkout成功画面での契約反映に失敗しました。", error);
    }
  }
  return (
    <InteriorShell eyebrow="PAYMENT RECEIVED" title="お支払いを受け付けました" description="お申し込みいただき、ありがとうございます。">
      <Card className="sanctuary-card">
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <Stack spacing={2.5} alignItems="center">
            <CheckCircleOutlineIcon color="primary" sx={{ fontSize: 64 }} aria-hidden="true" />
            <Typography variant="h5" component="h2">{reflected ? "Pro機能を利用できます" : "Pro機能はまもなく反映されます"}</Typography>
            <Typography color="text.secondary">
              この画面はお支払いの受付をお知らせするものです。契約情報の確認後、利用できる機能が自動的に更新されます。
            </Typography>
            <Button component={Link} href="/dashboard" className="checkout-success-action" variant="contained" size="large">
              マイページへ
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </InteriorShell>
  );
}
