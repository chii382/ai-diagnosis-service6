"use client";

import DownloadIcon from "@mui/icons-material/Download";
import LockIcon from "@mui/icons-material/Lock";
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import type { DiagnosisData } from "@/lib/diagnosis";
export type { DiagnosisData } from "@/lib/diagnosis";

export function DiagnosisResultView({ data }: { data: DiagnosisData }) {
  const result = data.result;
  const roadmap = data.careerRoadmap;
  const paid = data.plan === "paid" || result.plan === "paid";
  return <Card className="sanctuary-card diagnosis-result-card"><CardContent sx={{ p: { xs: 3, md: 5 } }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
      <Box><Typography color="secondary.dark" fontWeight={800} letterSpacing=".08em">YOUR INNER COMPASS</Typography><Typography variant="h4" component="h2" className="card-title" sx={{ my: 2 }}>{result.title}</Typography></Box>
      <Chip label={paid ? "詳細診断" : "簡易診断"} color={paid ? "warning" : "primary"} variant="outlined" />
    </Stack>
    <Typography variant="h6" color="primary.dark">あなたの本質</Typography><Typography sx={{ mt: 1.5, whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{result.essence}</Typography>
    <Divider sx={{ my: 4 }} />
    <Section title="本質を構成する要素">{result.coreElements?.map((element) => <Alert severity="info" icon={false} key={element.name} sx={{ mt: 1.5 }}><Typography fontWeight={800}>{element.name}</Typography><Typography>{element.tendency}</Typography>{paid && <><Typography variant="body2" sx={{ mt: 1 }}><strong>根拠：</strong>{element.evidence}</Typography><Typography variant="body2"><strong>行動への現れ方：</strong>{element.behavior}</Typography></>}</Alert>)}</Section>
    <Section title="自然に力を発揮しやすい環境"><BulletList values={result.bestEnvironments} /></Section>
    <Section title="負担を感じやすい環境"><BulletList values={result.stressfulEnvironments} /></Section>
    {paid ? <>
      <Section title="あなたの中にある二面性"><Typography>{result.duality}</Typography></Section>
      <Section title="今のあなたが求めているもの"><Typography>{result.currentNeeds}</Typography></Section>
      <Section title="今後の方向性を考えるヒント"><BulletList values={result.reflectionQuestions} ordered /></Section>
      <Section title="分析の確からしさ"><Confidence title="比較的確かな傾向" values={result.confidence?.certain} /><Confidence title="現時点での仮説" values={result.confidence?.hypotheses} /><Confidence title="今回だけでは判断できないこと" values={result.confidence?.unknown} /></Section>
    </> : <Alert severity="warning" icon={<LockIcon />} sx={{ my: 4 }}><strong>有料プランでは、さらに詳細な分析結果お届けします。</strong><br />あなたの二面性、現在求めているもの、分析の根拠と確からしさ、長期行動プランまで確認できます。</Alert>}
    <Section title={paid ? "あなただけの行動プラン" : "まず試してみる小さな一歩"}><BulletList values={roadmap.immediate} /><Alert severity="success" icon={false} sx={{ mt: 2 }}><strong>今後3か月：</strong>{roadmap.shortTerm}</Alert>{paid && <><Alert severity="success" icon={false} sx={{ mt: 1 }}><strong>半年〜1年：</strong>{roadmap.midTerm}</Alert><Alert severity="success" icon={false} sx={{ mt: 1 }}><strong>1〜3年：</strong>{roadmap.longTerm}</Alert></>}</Section>
    <Alert severity="info" icon={false} sx={{ mt: 4, whiteSpace: "pre-wrap" }}>{result.message}</Alert>
    <Stack className="diagnosis-result-actions" direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
      <Button component={Link} href="/diagnosis/history" variant="outlined">診断履歴</Button>
      <Button className="diagnosis-retry-action" component={Link} href="/diagnosis" variant="contained">もう一度診断</Button>
      {paid && <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => window.print()}>PDFとして保存</Button>}
    </Stack>
  </CardContent></Card>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) { return <Box sx={{ mt: 4 }}><Typography variant="h6" color="primary.dark" sx={{ mb: 1.5 }}>{title}</Typography>{children}</Box>; }
function BulletList({ values = [], ordered = false }: { values?: string[]; ordered?: boolean }) { return <Box component={ordered ? "ol" : "ul"} sx={{ mt: 1, mb: 0, pl: 3 }}>{values.map((value) => <Typography component="li" key={value} sx={{ mb: 1, lineHeight: 1.75 }}>{value}</Typography>)}</Box>; }
function Confidence({ title, values = [] }: { title: string; values?: string[] }) { return <Box sx={{ mb: 2 }}><Typography fontWeight={800}>{title}</Typography><BulletList values={values} /></Box>; }
