import { auth } from "@/auth";
import { ProfileForm } from "./ProfileForm";
import { Card, CardContent, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { InteriorShell } from "@/app/components/InteriorShell";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/profile");

  return (
    <InteriorShell eyebrow="YOUR PROFILE" title="プロフィール" description="あなたらしさを表す、基本情報を整えます。">
        <Card className="sanctuary-card">
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <Typography variant="h5" component="h2" className="card-title" textAlign="center" gutterBottom>会員情報</Typography>
            <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>表示名の確認と変更ができます。</Typography>
            <ProfileForm />
          </CardContent>
        </Card>
    </InteriorShell>
  );
}
