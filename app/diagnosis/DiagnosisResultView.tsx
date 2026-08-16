"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BalanceIcon from "@mui/icons-material/Balance";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import ExploreIcon from "@mui/icons-material/Explore";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import LockIcon from "@mui/icons-material/Lock";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { Alert, Box, Button, Card, CardContent, Chip, Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { DiagnosisData } from "@/lib/diagnosis";
export type { DiagnosisData } from "@/lib/diagnosis";

export function DiagnosisResultView({ data }: { data: DiagnosisData }) {
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
          <Typography className="result-hero-lead">5つの選択から見えてきた、今のあなたを表す言葉です。</Typography>
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
          {paid && <div className="result-element-detail"><Typography><strong>分析の根拠</strong>{element.evidence}</Typography><Typography><strong>行動への現れ方</strong>{element.behavior}</Typography></div>}
        </article>)}</div>
      </ResultSection>

      <div className="result-environment-grid">
        <ResultSection compact tone="positive" icon={<FavoriteBorderIcon />} eyebrow="YOUR PLACE" title="自然に力を発揮しやすい環境"><BulletList values={result.bestEnvironments} /></ResultSection>
        <ResultSection compact tone="caution" icon={<WarningAmberOutlinedIcon />} eyebrow="TAKE CARE" title="負担を感じやすい環境"><BulletList values={result.stressfulEnvironments} /></ResultSection>
      </div>

      {paid ? <>
        <div className="result-insight-grid">
          <ResultSection compact icon={<BalanceIcon />} eyebrow="DUALITY" title="あなたの中にある二面性"><Typography>{result.duality}</Typography></ResultSection>
          <ResultSection compact icon={<FavoriteBorderIcon />} eyebrow="CURRENT NEEDS" title="今のあなたが求めているもの"><Typography>{result.currentNeeds}</Typography></ResultSection>
        </div>
        <ResultSection icon={<LightbulbOutlinedIcon />} eyebrow="REFLECTION" title="今後の方向性を考えるヒント"><BulletList values={result.reflectionQuestions} ordered /></ResultSection>
        <ResultSection icon={<VerifiedOutlinedIcon />} eyebrow="CONFIDENCE" title="分析の確からしさ">
          <div className="result-confidence-grid"><Confidence tone="certain" title="比較的確かな傾向" values={result.confidence?.certain} /><Confidence tone="hypothesis" title="現時点での仮説" values={result.confidence?.hypotheses} /><Confidence tone="unknown" title="今回だけでは判断できないこと" values={result.confidence?.unknown} /></div>
        </ResultSection>
      </> : <>
        <Alert className="result-upgrade" severity="warning" icon={<LockIcon />}>
          <div className="result-upgrade-content"><Box><strong>有料プランでは、さらに詳細な分析結果をお届けします。</strong><br />あなたの二面性、現在求めているもの、分析の根拠と確からしさ、長期行動プランまで確認できます。</Box><Button className="premium-preview-button" variant="contained" startIcon={<VisibilityOutlinedIcon />} onClick={() => setShowPremiumPreview(true)}>有料プラン　チラ見せ</Button></div>
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
        <Button component={Link} href="/diagnosis/history" variant="outlined">診断履歴</Button>
        <Button className="diagnosis-retry-action" component={Link} href="/diagnosis" variant="contained">もう一度診断</Button>
        {paid && <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => window.print()}>PDFとして保存</Button>}
      </Stack>
    </CardContent>
  </Card>;
}

function ResultSection({ title, eyebrow, icon, children, compact = false, tone = "default" }: { title: string; eyebrow: string; icon: React.ReactNode; children: React.ReactNode; compact?: boolean; tone?: "default" | "positive" | "caution" }) {
  return <section className={`result-section${compact ? " is-compact" : ""} tone-${tone}`}><header><span className="result-section-icon">{icon}</span><Box><Typography className="result-section-eyebrow">{eyebrow}</Typography><Typography variant="h5" component="h3">{title}</Typography></Box></header><div className="result-section-body">{children}</div></section>;
}

function BulletList({ values = [], ordered = false }: { values?: string[]; ordered?: boolean }) {
  return <Box className="result-list" component={ordered ? "ol" : "ul"}>{values.map((value) => <Typography component="li" key={value}>{value}</Typography>)}</Box>;
}

function Confidence({ title, values = [], tone }: { title: string; values?: string[]; tone: string }) {
  return <article className={`result-confidence-card is-${tone}`}><Typography component="h4">{title}</Typography><BulletList values={values} /></article>;
}

function RoadmapStep({ label, title, text }: { label: string; title: string; text?: string }) {
  return <article className="result-roadmap-step"><span /><Box><Typography className="result-roadmap-label">{label}</Typography><Typography component="h4">{title}</Typography><Typography>{text}</Typography></Box></article>;
}
