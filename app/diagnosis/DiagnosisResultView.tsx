"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BalanceIcon from "@mui/icons-material/Balance";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExploreIcon from "@mui/icons-material/Explore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LockIcon from "@mui/icons-material/Lock";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DiagnosisData, PremiumAnalysis } from "@/lib/diagnosis";
import { PremiumHistoryButton } from "@/app/components/PremiumHistoryButton";
export type { DiagnosisData } from "@/lib/diagnosis";

export function DiagnosisResultView({ data, readOnly = false }: { data: DiagnosisData; readOnly?: boolean }) {
  const [showPremiumPreview, setShowPremiumPreview] = useState(false);
  const result = data.result;
  const roadmap = data.careerRoadmap;
  const paid = data.plan === "paid" || result.plan === "paid";

  return <Card className="sanctuary-card diagnosis-result-card">
    <CardContent className="diagnosis-result-content">
      <header className="result-hero">
        <div className="result-compass" aria-hidden="true"><ExploreIcon /></div>
        <Box className="result-hero-copy">
          <Typography className="result-eyebrow">YOUR INNER COMPASS</Typography>
          <Typography variant="h3" component="h2" className="result-title">{result.title}</Typography>
          <Typography className="result-hero-lead">回答全体から見えてきた、今のあなたを表す言葉です。</Typography>
        </Box>
        <Chip className={`result-plan-chip ${paid ? "is-paid" : ""}`} label={paid ? "詳細診断" : "簡易診断"} variant="outlined" />
      </header>

      <section className="result-essence">
        <div className="result-section-icon"><AutoAwesomeIcon /></div>
        <Box><Typography className="result-kicker">あなたの本質</Typography><Typography className="result-essence-copy">{result.essence}</Typography></Box>
      </section>

      <ResultSection icon={<SpaOutlinedIcon />} eyebrow="CORE ELEMENTS" title="本質を構成する要素">
        <div className="result-element-grid">{result.coreElements?.map((element, index) => <article className="result-element-card" key={element.name}>
          <span className="result-element-number">{String(index + 1).padStart(2, "0")}</span>
          <Typography component="h4">{element.name}</Typography>
          <Typography>{element.tendency}</Typography>
          {paid && <div className="result-element-detail"><Typography><strong>日常での現れ方・活かし方</strong>{element.behavior}</Typography></div>}
        </article>)}</div>
      </ResultSection>

      {paid ? <>
        {result.premiumAnalysis && <PremiumVisualReport analysis={result.premiumAnalysis} />}
        {!result.premiumAnalysis && <div className="result-environment-grid">
          <ResultSection compact tone="positive" icon={<FavoriteBorderIcon />} eyebrow="YOUR PLACE" title="自然に力を発揮しやすい環境"><BulletList values={result.bestEnvironments} /></ResultSection>
          <ResultSection compact tone="caution" icon={<WarningAmberOutlinedIcon />} eyebrow="TAKE CARE" title="負担を感じやすい環境"><BulletList values={result.stressfulEnvironments} /></ResultSection>
        </div>}
        <div className="result-insight-grid">
          <ResultSection compact icon={<BalanceIcon />} eyebrow="DUALITY" title="あなたの中にある二面性"><Typography>{result.duality}</Typography></ResultSection>
          <ResultSection compact icon={<FavoriteBorderIcon />} eyebrow="CURRENT NEEDS" title="今のあなたが求めているもの"><Typography>{result.currentNeeds}</Typography></ResultSection>
        </div>
        <ResultSection icon={<LightbulbOutlinedIcon />} eyebrow="REFLECTION" title="今後の方向性を考えるヒント"><BulletList values={result.reflectionQuestions} ordered /></ResultSection>
      </> : <>
        <div className="result-insight-grid">
          <ResultSection compact icon={<FavoriteBorderIcon />} eyebrow="CURRENT NEEDS" title="今のあなたが求めているもの"><Typography>{result.currentNeeds}</Typography></ResultSection>
          <ResultSection compact icon={<BalanceIcon />} eyebrow="STRENGTH &amp; CARE" title="長所と注意点"><Typography>{result.duality}</Typography></ResultSection>
        </div>
        <ResultSection icon={<LightbulbOutlinedIcon />} eyebrow="REFLECTION" title="自分に問いかける質問"><BulletList values={result.reflectionQuestions} ordered /></ResultSection>
        <Alert className="result-upgrade" severity="warning" icon={<LockIcon />}>
          <div className="result-upgrade-content"><Box><strong>有料プランでは、さらに詳細な分析結果をお届けします。</strong><br />あなたの二面性、現在求めているもの、分析の根拠と確からしさ、長期行動プランまで確認できます。</Box><Button disabled={readOnly} className="premium-preview-button" variant="contained" startIcon={<VisibilityOutlinedIcon />} onClick={() => setShowPremiumPreview(true)}>有料プラン　チラ見せ</Button></div>
        </Alert>
        <Dialog className="premium-preview-dialog" open={showPremiumPreview} onClose={() => setShowPremiumPreview(false)} maxWidth="lg" fullWidth aria-labelledby="premium-preview-title">
          <DialogContent>
            <IconButton className="premium-preview-close" aria-label="プレビューを閉じる" onClick={() => setShowPremiumPreview(false)}><CloseIcon /></IconButton>
            <Typography id="premium-preview-title" className="premium-preview-title" component="h3">有料プランの詳細分析レポート例</Typography>
            <Typography className="premium-preview-lead">あなたの資質・価値観・行動計画を、ひと目で分かる形に整理します。</Typography>
            <div className="premium-preview-visual"><Image src="/images/premium-analysis-sample.png" alt="有料プランで表示されるレーダーチャート、価値観ランキング、行動ロードマップのサンプル" width={1536} height={1024} priority /><div className="premium-preview-veil"><LockIcon /><span>PREMIUM PREVIEW</span><strong>続きは有料プランで</strong></div></div>
          </DialogContent>
        </Dialog>
      </>}

      <ResultSection icon={<FlagOutlinedIcon />} eyebrow="ACTION ROADMAP" title={paid ? "あなただけの行動プラン" : "まず試してみる小さな一歩"}>
        <BulletList values={roadmap.immediate} />
        <div className="result-roadmap">
          <RoadmapStep label="NOW — 3 MONTHS" title="今後3か月" text={roadmap.shortTerm} />
          {paid && <><RoadmapStep label="6 — 12 MONTHS" title="半年〜1年" text={roadmap.midTerm} /><RoadmapStep label="1 — 3 YEARS" title="1〜3年" text={roadmap.longTerm} /></>}
        </div>
      </ResultSection>

      <section className="result-message"><FormatQuoteIcon /><Typography className="result-message-label">MESSAGE FOR YOU</Typography><Typography>{result.message}</Typography></section>

      <Stack className="diagnosis-result-actions" direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button disabled={readOnly} component={Link} href="/dashboard" variant="outlined" startIcon={<DashboardIcon />}>ダッシュボードへ</Button>
        {paid ? <Button disabled={readOnly} component={Link} href="/diagnosis/history" variant="outlined">診断履歴</Button> : <PremiumHistoryButton disabled={readOnly} />}
        <Button disabled={readOnly} className="diagnosis-retry-action" component={Link} href="/diagnosis" variant="contained">もう一度診断</Button>
        {paid && <Button disabled={readOnly} variant="outlined" startIcon={<DownloadIcon />} onClick={() => window.print()}>PDFとして保存</Button>}
      </Stack>
    </CardContent>
  </Card>;
}

function PremiumVisualReport({ analysis }: { analysis: PremiumAnalysis }) {
  return <Stack className="premium-report" spacing={3}>
    <Box className="premium-chart-grid">
      <ResultSection compact icon={<ExploreIcon />} eyebrow="TRAIT BALANCE" title="特性バランス">
        <Box className="premium-chart premium-chart--radar" aria-label="特性バランスのレーダーチャート"><ResponsiveContainer width="100%" height="100%"><RadarChart data={analysis.traitScores} outerRadius="78%"><defs><linearGradient id="traitBalanceGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#e1b640" stopOpacity=".9" /><stop offset="48%" stopColor="#7997c4" stopOpacity=".78" /><stop offset="100%" stopColor="#174f9f" stopOpacity=".92" /></linearGradient></defs><PolarGrid stroke="rgba(51,91,153,.26)" /><PolarAngleAxis dataKey="label" tick={{ fill: "#244b91", fontSize: 12, fontWeight: 800 }} /><Radar dataKey="score" stroke="#b88a22" fill="url(#traitBalanceGradient)" fillOpacity={.84} strokeWidth={2.5} dot={{ r: 3, fill: "#f0cf70", stroke: "#174f9f", strokeWidth: 1.5 }} /><Tooltip contentStyle={{ borderRadius: 12, borderColor: "rgba(216,168,54,.55)", boxShadow: "0 8px 22px rgba(17,48,104,.14)" }} /></RadarChart></ResponsiveContainer></Box>
      </ResultSection>
      <ResultSection compact icon={<FavoriteBorderIcon />} eyebrow="VALUE PRIORITIES" title="価値観の優先度">
        <Box className="premium-chart premium-chart--values" aria-label="価値観の優先度の棒グラフ"><ResponsiveContainer width="100%" height="100%"><BarChart data={analysis.valuePriorities} layout="vertical" margin={{ left: 12, right: 42, top: 8, bottom: 8 }}><defs><linearGradient id="valuePriorityGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#174f9f" /><stop offset="62%" stopColor="#4778b4" /><stop offset="100%" stopColor="#e2b33a" /></linearGradient></defs><CartesianGrid strokeDasharray="3 4" horizontal={false} stroke="rgba(62,96,151,.22)" /><XAxis type="number" domain={[0, 100]} hide /><YAxis type="category" dataKey="name" width={240} tick={{ fill: "#294b9a", fontSize: 11, fontWeight: 700 }} tickMargin={12} tickFormatter={(value, index) => `${String(index + 1).padStart(2, "0")}  ${value}`} /><Tooltip cursor={{ fill: "rgba(53,92,157,.05)" }} contentStyle={{ borderRadius: 12, borderColor: "rgba(216,168,54,.55)", boxShadow: "0 8px 22px rgba(17,48,104,.14)" }} /><Bar dataKey="score" fill="url(#valuePriorityGradient)" radius={[0, 10, 10, 0]} barSize={24}><LabelList dataKey="score" position="right" fill="#173f83" fontSize={12} fontWeight={900} formatter={(value: unknown) => `${String(value)}%`} /></Bar></BarChart></ResponsiveContainer></Box>
        <Box className="premium-value-notes">{analysis.valuePriorities.map((item) => <Typography key={item.name}><strong>{item.name}</strong>{item.insight}</Typography>)}</Box>
      </ResultSection>
    </Box>
    <Box className="premium-chart-grid">
      <ResultSection compact tone="positive" icon={<FavoriteBorderIcon />} eyebrow="YOUR PLACE" title="力を発揮しやすい環境"><BulletList values={analysis.goodEnvironments} /></ResultSection>
      <ResultSection compact tone="caution" icon={<WarningAmberOutlinedIcon />} eyebrow="TAKE CARE" title="注意したい環境"><BulletList values={analysis.cautionEnvironments} /></ResultSection>
    </Box>
  </Stack>;
}

function ResultSection({ title, eyebrow, icon, children, compact = false, tone = "default" }: { title: string; eyebrow: string; icon: React.ReactNode; children: React.ReactNode; compact?: boolean; tone?: "default" | "positive" | "caution" }) {
  return <section className={`result-section${compact ? " is-compact" : ""} tone-${tone}`}><header><span className="result-section-icon">{icon}</span><Box><Typography className="result-section-eyebrow">{eyebrow}</Typography><Typography variant="h5" component="h3">{title}</Typography></Box></header><div className="result-section-body">{children}</div></section>;
}

function BulletList({ values = [], ordered = false }: { values?: string[]; ordered?: boolean }) {
  return <Box className="result-list" component={ordered ? "ol" : "ul"}>{values.map((value) => <Typography component="li" key={value}>{value}</Typography>)}</Box>;
}

function RoadmapStep({ label, title, text }: { label: string; title: string; text?: string }) {
  return <article className="result-roadmap-step"><span /><Box><Typography className="result-roadmap-label">{label}</Typography><Typography component="h4">{title}</Typography><Typography>{text}</Typography></Box></article>;
}
