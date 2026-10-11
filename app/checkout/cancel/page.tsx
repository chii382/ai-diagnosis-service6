import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { InteriorShell } from "@/app/components/InteriorShell";

// Stripe Checkoutで購入を中止した場合に表示するServer Componentです。
export default function CheckoutCancelPage() {
  return (
    <InteriorShell eyebrow="PAYMENT CANCELED" title="お支払いはキャンセルされました" description="ご検討いただきありがとうございます。">
      <Card className="sanctuary-card">
        <CardContent sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
          <Stack spacing={2.5} alignItems="center">
            <Typography color="text.secondary">
              決済は行われていません。内容をご確認のうえ、いつでも改めてお申し込みいただけます。
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
              <Button component={Link} href="/?skipOpening=1#top" prefetch={false} variant="outlined" startIcon={<HomeRoundedIcon />}>
                トップページへ
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </InteriorShell>
  );
}
