"use client";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import { Alert, Box, Button } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { InteriorShell } from "@/app/components/InteriorShell";
import { DiagnosisResultView, type DiagnosisData } from "../DiagnosisResultView";

export default function ResultPage() {
  const [data, setData] = useState<DiagnosisData | null>(null);

  useEffect(() => {
    const value = sessionStorage.getItem("latestDiagnosis");
    if (value) setData(JSON.parse(value));
  }, []);

  return (
    <InteriorShell
      variant="diagnosis"
      wide
      eyebrow="YOUR INNER COMPASS"
      title="自分探しの結果"
      description="回答の共通点から、まだ言葉になっていなかったあなたらしさを映し出しました。"
      actions={
        <Button component={Link} href="/dashboard" variant="contained" startIcon={<DashboardRoundedIcon />}>
          ダッシュボードへ
        </Button>
      }
    >
      {data ? (
        <DiagnosisResultView data={data} />
      ) : (
        <Box><Alert severity="info">表示できる直近の診断結果がありません。ダッシュボードから新しい診断を実行してください。</Alert></Box>
      )}
    </InteriorShell>
  );
}
