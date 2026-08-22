"use client";

import DownloadIcon from "@mui/icons-material/Download";
import InsightsIcon from "@mui/icons-material/Insights";
import { Alert, Box, Button, Card, CardContent, CircularProgress, LinearProgress, Stack, Tab, Tabs, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import type { AnalyticsData, CountItem } from "../admin-types";
import { fetchAdminJson } from "../admin-types";

const periods = ["daily", "weekly", "monthly"] as const;
const labels = { daily: "日別", weekly: "週別", monthly: "月別" };

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>("daily");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { setData(null); setError(""); fetchAdminJson<AnalyticsData>(`/api/admin/analytics?period=${period}`).then(setData).catch((reason) => setError(reason.message)); }, [period]);
  return <Stack spacing={3}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}><Box><Typography className="admin-eyebrow">INSIGHT REPORT</Typography><Stack direction="row" gap={1} alignItems="center"><InsightsIcon color="primary" /><Typography variant="h4" component="h1">分析レポート</Typography></Stack><Typography color="text.secondary">診断利用とユーザー属性の傾向を把握できます。</Typography></Box><Button className="admin-csv-export" component="a" href={`/api/admin/analytics?period=${period}&format=csv`} variant="outlined" startIcon={<DownloadIcon />}>CSVエクスポート</Button></Stack>
    <Card><CardContent sx={{ p: 3 }}><Tabs value={period} onChange={(_, value) => setPeriod(value)} aria-label="集計期間">{periods.map((value) => <Tab key={value} value={value} label={labels[value]} />)}</Tabs>{error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}{!data ? !error && <Box textAlign="center" py={8}><CircularProgress /></Box> : <Box height={360} pt={3}><ResponsiveContainer width="100%" height="100%"><BarChart data={data.timeline} barCategoryGap="42%"><defs><linearGradient id="adminAnalysisBarGradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#174f9f" /><stop offset="68%" stopColor="#4778b4" /><stop offset="100%" stopColor="#e0b23b" /></linearGradient></defs><CartesianGrid strokeDasharray="3 4" stroke="rgba(64,96,151,.2)" /><XAxis dataKey="label" tick={{ fontSize: 12, fill: "#526486" }} axisLine={{ stroke: "rgba(41,75,154,.38)" }} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#526486" }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "rgba(49,86,148,.05)" }} contentStyle={{ borderRadius: 12, borderColor: "rgba(216,168,54,.48)", boxShadow: "0 8px 22px rgba(17,48,104,.12)" }} /><Bar dataKey="count" name="分析数" fill="url(#adminAnalysisBarGradient)" radius={[12, 12, 4, 4]} barSize={30} maxBarSize={34} /></BarChart></ResponsiveContainer></Box>}</CardContent></Card>
    {data && <>
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}><Summary title="分析完了率" value={`${data.metrics.completionRate}%`} caption={`${data.metrics.totalUsers}人中、診断完了ユーザーの割合`} /><Summary title="総分析数" value={`${data.metrics.totalAnalyses}件`} caption="全期間の完了済み分析" /><Summary title="アクティブユーザー" value={`${data.metrics.activeUsers}人`} caption="直近30日以内にログイン" /></Box>
      <Typography variant="h5" component="h2">自己理解プロフィール TOP10</Typography><Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(2, 1fr)" }} gap={2}><Ranking title="自然な強み" rows={data.profile.naturalStrengths} /><Ranking title="繰り返してきた役割" rows={data.profile.repeatedRoles} /><Ranking title="負担を感じやすい状況" rows={data.profile.stressfulSituations} /><Ranking title="知りたい価値観・テーマ" rows={data.profile.selfDiscoveryGoals} /></Box>
      <Typography variant="h5" component="h2">ユーザー属性別の傾向</Typography><Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "repeat(3, 1fr)" }} gap={2}><Ranking title="年代" rows={data.attributes.ageGroup} /><Ranking title="性別" rows={data.attributes.gender} /><Ranking title="現在の状況" rows={data.attributes.currentStatus} /></Box>
    </>}
  </Stack>;
}

function Summary({ title, value, caption }: { title: string; value: string; caption: string }) { return <Card><CardContent sx={{ p: 3 }}><Typography color="text.secondary">{title}</Typography><Typography variant="h3" my={1}>{value}</Typography><Typography variant="caption" color="text.secondary">{caption}</Typography></CardContent></Card>; }
function Ranking({ title, rows }: { title: string; rows: CountItem[] }) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return <Card><CardContent sx={{ p: 3 }}><Typography variant="h6" component="h3" mb={2}>{title}</Typography><Stack spacing={1.5}>{rows.length ? rows.map((row, index) => <Box key={row.label}><Stack direction="row" justifyContent="space-between"><Typography variant="body2">{index + 1}. {row.label}</Typography><Typography variant="body2" fontWeight={700}>{row.count}</Typography></Stack><LinearProgress variant="determinate" value={row.count / max * 100} sx={{ mt: .5, height: 6, borderRadius: 3 }} /></Box>) : <Typography color="text.secondary">データがありません。</Typography>}</Stack></CardContent></Card>;
}
