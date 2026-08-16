import { auth } from "@/auth";
import { SignOutButton } from "@/app/components/SignOutButton";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { InteriorShell } from "@/app/components/InteriorShell";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { Chip, Divider } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import HistoryIcon from "@mui/icons-material/History";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin?callbackUrl=/dashboard");
  const user = session.user;
  const client = await clientPromise;
  const filter = user.id && ObjectId.isValid(user.id) ? { _id: new ObjectId(user.id) } : { email: user.email };
  const member = await client.db().collection("users").findOne(filter);
  const plan = member?.plan === "paid" ? "paid" : "free";
  const details = [
    ["性別", member?.gender || "未回答"],
    ["年代", member?.ageGroup || "未回答"],
    ["現在の状況", member?.currentStatus || member?.occupation || "未回答"],
  ];

  return (
    <InteriorShell variant="dashboard" wide eyebrow="MY SANCTUARY" title={`${user.name ?? "ゲスト"}さん、ようこそ`} description="あなた自身を知る旅の記録と、次の一歩をここから。" actions={<SignOutButton />}>
        <Card className="sanctuary-card dashboard-card">
          <CardContent className="dashboard-card-content" sx={{ p: { xs: 3, sm: 5 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
              <Avatar className="dashboard-avatar" src={member?.image ?? user.image ?? undefined} alt={user.name ?? "ユーザー"} sx={{ width: 96, height: 96 }} />
              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                <Typography color="secondary.dark" fontWeight={800} letterSpacing=".08em">MEMBER PROFILE</Typography>
                <Typography variant="h4" component="h2" className="card-title" sx={{ mt: 1 }}>あなたのプロフィール</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{user.email}</Typography>
                <Chip className={`plan-chip plan-chip--${plan}`} icon={<WorkspacePremiumIcon />} label={plan === "paid" ? "有料プラン" : "無料プラン"} sx={{ mt: 2 }} />
              </Box>
            </Stack>
            <Divider className="dashboard-divider" sx={{ my: 4 }} />
            <Box className="dashboard-profile-prompt">
              <Box>
                <Typography component="h3">より正確で詳細な分析のために</Typography>
                <Typography>プロフィールを登録・充実させてください。あなたの状況や経験を反映した、より深いAI分析が可能になります。</Typography>
              </Box>
              <Button className="dashboard-profile-prompt-action" href="/profile" variant="contained" startIcon={<AccountCircleIcon />}>プロフィールを登録・編集</Button>
            </Box>
            <Box className="dashboard-profile-grid">
              {details.map(([label, value]) => <div className="dashboard-profile-item" key={label}><small>{label}</small><strong>{value}</strong></div>)}
            </Box>
            {(member?.currentActivity || member?.currentConcern || member?.bio) && <Box className="dashboard-bio"><Typography component="h3">現在の活動・テーマ</Typography><Typography>{[member?.currentActivity, member?.currentConcern || member?.bio].filter(Boolean).join("\n")}</Typography></Box>}
            <Stack className="dashboard-actions" direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 5 }}>
              <Button className="dashboard-primary-action dashboard-diagnosis-action" href="/diagnosis" variant="contained" startIcon={<AutoAwesomeIcon />}>AI自分探し</Button>
              <Button href="/diagnosis/history" variant="outlined" startIcon={<HistoryIcon />}>診断履歴</Button>
              <Button component="a" href="/?skipOpening=1#top" variant="outlined" startIcon={<HomeIcon />}>トップページ</Button>
            </Stack>
          </CardContent>
        </Card>
    </InteriorShell>
  );
}
