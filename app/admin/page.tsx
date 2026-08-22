"use client";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupIcon from "@mui/icons-material/Group";
import SpeedIcon from "@mui/icons-material/Speed";
import StorageIcon from "@mui/icons-material/Storage";
import TodayIcon from "@mui/icons-material/Today";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { DiagnosisResultView } from "@/app/diagnosis/DiagnosisResultView";
import type { DiagnosisData } from "@/lib/diagnosis";
import type { AnalyticsData } from "./admin-types";
import { fetchAdminJson } from "./admin-types";

type DashboardData = AnalyticsData & { responseTime: number };

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DiagnosisData | null>(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  useEffect(() => { fetchAdminJson<DashboardData>("/api/admin/analytics?period=daily").then(setData).catch((reason) => setError(reason.message)); }, []);
  const showDetail = async (id: string) => {
    setSelectedId(id); setDetail(null); setDetailError(""); setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/diagnoses/${id}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "診断結果を取得できませんでした。");
      setDetail(result);
    } catch (reason) { setDetailError(reason instanceof Error ? reason.message : "診断結果を取得できませんでした。"); }
    finally { setDetailLoading(false); }
  };
  const closeDetail = () => { setSelectedId(null); setDetail(null); setDetailError(""); };
  return <Stack spacing={4}>
    <Box><Typography className="admin-eyebrow">ADMIN SANCTUARY</Typography><Typography variant="h4" component="h1">管理者ダッシュボード</Typography><Typography color="text.secondary">サービス全体の現在地を確認できます。</Typography></Box>
    {error && <Alert severity="error">{error}</Alert>}
    {!data ? !error && <Box textAlign="center" py={8}><CircularProgress aria-label="読み込み中" /></Box> : <>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(3, 1fr)" }} gap={2}>
        <MetricCard icon={<TodayIcon />} label="本日の分析数" value={data.metrics.todayAnalyses} unit="件" />
        <MetricCard icon={<AnalyticsIcon />} label="総分析数" value={data.metrics.totalAnalyses} unit="件" />
        <MetricCard icon={<GroupIcon />} label="アクティブユーザー" value={data.metrics.activeUsers} unit="人 / 30日" />
      </Box>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", lg: "2fr 1fr" }} gap={3}>
        <Card><CardContent sx={{ p: 3 }}><Typography variant="h6" component="h2" mb={2}>最近の分析結果</Typography><Stack spacing={1.5}>{data.recent.length ? data.recent.map((item) => <Stack key={item.id} direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" gap={1.5} sx={{ width: "100%", p: 1.5, bgcolor: "rgba(41,75,154,.05)", borderRadius: 2 }}><Box sx={{ minWidth: 0, flex: 1 }}><Typography fontWeight={700}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.userName} · {item.email || "メール未設定"}</Typography></Box><Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "stretch", sm: "center" }} gap={1}><Stack direction="row" alignItems="center" gap={1} justifyContent={{ xs: "space-between", sm: "flex-start" }}><Chip size="small" label={item.plan === "paid" ? "有料" : "無料"} color={item.plan === "paid" ? "secondary" : "default"} /><Typography variant="caption" whiteSpace="nowrap">{new Date(item.createdAt).toLocaleString("ja-JP")}</Typography></Stack><Button size="small" variant="outlined" startIcon={<VisibilityIcon />} onClick={() => void showDetail(item.id)} aria-label={`${item.title}の結果詳細を表示`} sx={{ minHeight: 38, px: 2, whiteSpace: "nowrap" }}>詳細表示</Button></Stack></Stack>) : <Typography color="text.secondary">分析結果はまだありません。</Typography>}</Stack></CardContent></Card>
        <Stack spacing={3}>
          <Card><CardContent sx={{ p: 3 }}><Typography variant="h6" component="h2">システムステータス</Typography><Status icon={<StorageIcon />} label="DB接続" value={data.system.database === "connected" ? "正常" : "異常"} ok={data.system.database === "connected"} /><Status icon={<SpeedIcon />} label="API応答時間" value={`${data.responseTime} ms`} ok={data.responseTime < 1000} /></CardContent></Card>
        </Stack>
      </Box>
      <Dialog open={Boolean(selectedId)} onClose={closeDetail} fullWidth maxWidth="lg" scroll="paper" aria-labelledby="admin-diagnosis-detail-title" slotProps={{ paper: { sx: { maxHeight: "94vh", bgcolor: "#e8f2fd" } } }}>
        <DialogTitle id="admin-diagnosis-detail-title" sx={{ pr: 7 }}><Typography variant="overline" color="primary">INNER COMPASS RECORD</Typography><Typography variant="h5" component="span" display="block" fontWeight={800}>自分探しの結果詳細</Typography><IconButton aria-label="結果詳細を閉じる" onClick={closeDetail} sx={{ position: "absolute", right: 14, top: 14 }}><CloseIcon /></IconButton></DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 3 } }}>{detailLoading && <Box textAlign="center" py={10}><CircularProgress aria-label="結果詳細を読み込み中" /></Box>}{detailError && <Alert severity="error">{detailError}</Alert>}{detail && <DiagnosisResultView data={detail} readOnly />}</DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}><Button variant="contained" startIcon={<CloseIcon />} onClick={closeDetail}>閉じる</Button></DialogActions>
      </Dialog>
    </>}
  </Stack>;
}

function MetricCard({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: number; unit: string }) {
  return <Card><CardContent sx={{ p: 3 }}><Stack direction="row" justifyContent="space-between"><Box><Typography color="text.secondary">{label}</Typography><Typography variant="h3" mt={1}>{value.toLocaleString()} <Typography component="span" variant="body1">{unit}</Typography></Typography></Box><Box color="primary.main">{icon}</Box></Stack></CardContent></Card>;
}
function Status({ icon, label, value, ok }: { icon: React.ReactNode; label: string; value: string; ok: boolean }) {
  return <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}><Stack direction="row" gap={1} alignItems="center">{icon}<Typography>{label}</Typography></Stack><Chip size="small" color={ok ? "success" : "warning"} label={value} /></Stack>;
}
