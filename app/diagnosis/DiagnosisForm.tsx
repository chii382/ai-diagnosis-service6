"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Alert, Box, Button, Collapse, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { diagnosisQuestions } from "@/lib/diagnosis-questions";
import { setGlobalBusy } from "@/app/components/GlobalBusyIndicator";

const ANALYSIS_STAGES = [
  { until: 14, label: "回答内容を整理しています" },
  { until: 34, label: "回答から傾向を読み解いています" },
  { until: 59, label: "強みと価値観を分析しています" },
  { until: 78, label: "あなたらしさを言葉にしています" },
  { until: 92, label: "行動につながるヒントをまとめています" },
  { until: 100, label: "分析結果を仕上げています" },
] as const;

function estimateAnalysisProgress(elapsedSeconds: number) {
  if (elapsedSeconds < 5) return 4 + elapsedSeconds * 2;
  if (elapsedSeconds < 15) return 14 + (elapsedSeconds - 5) * 2;
  if (elapsedSeconds < 30) return 34 + (elapsedSeconds - 15) * (25 / 15);
  if (elapsedSeconds < 45) return 59 + (elapsedSeconds - 30) * (19 / 15);
  if (elapsedSeconds < 65) return 78 + (elapsedSeconds - 45) * 0.7;
  if (elapsedSeconds < 90) return 92 + (elapsedSeconds - 65) * 0.2;
  return 98;
}

export function DiagnosisForm() {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [supplements, setSupplements] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisElapsedSeconds, setAnalysisElapsedSeconds] = useState(0);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const answeredCount = useMemo(() => diagnosisQuestions.filter((question) => selections[question.id]).length, [selections]);
  const analysisStage = ANALYSIS_STAGES.find((stage) => analysisProgress < stage.until) ?? ANALYSIS_STAGES[ANALYSIS_STAGES.length - 1];

  useEffect(() => {
    // AI分析中の待ち時間と重ねて結果画面を準備し、完了後の画面遷移を速くする。
    router.prefetch("/diagnosis/result");
  }, [router]);

  useEffect(() => {
    if (!loading) return;

    const startedAt = Date.now();
    setAnalysisProgress(4);
    setAnalysisElapsedSeconds(0);
    const timer = window.setInterval(() => {
      const elapsedSeconds = (Date.now() - startedAt) / 1000;
      setAnalysisElapsedSeconds(Math.floor(elapsedSeconds));
      setAnalysisProgress(Math.round(estimateAnalysisProgress(elapsedSeconds)));
    }, 500);

    return () => window.clearInterval(timer);
  }, [loading]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (answeredCount !== diagnosisQuestions.length) { setError("5問すべてに回答してください。"); return; }
    setLoading(true); setGlobalBusy(true); setError("");
    try {
      const response = await fetch("/api/diagnosis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selections, supplements }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAnalysisProgress(100);
      sessionStorage.setItem("latestDiagnosis", JSON.stringify(data));
      router.push("/diagnosis/result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "診断に失敗しました。");
      setLoading(false); setGlobalBusy(false);
    }
  }

  return <Box component="form" onSubmit={submit} aria-busy={loading}>
    <Stack spacing={2}>
      <Box>
        <Typography textAlign="center" fontWeight={800} color="primary.dark">回答状況 {answeredCount} / {diagnosisQuestions.length}</Typography>
        <LinearProgress variant="determinate" value={(answeredCount / diagnosisQuestions.length) * 100} sx={{ mt: 1, height: 8, borderRadius: 999 }} />
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {diagnosisQuestions.map((question, questionIndex) => {
        const open = openQuestion === question.id;
        const selectedOption = question.options.find((option) => option.id === selections[question.id]);
        return <Box component="section" className={`diagnosis-question${open ? " is-open" : ""}${selectedOption ? " is-answered" : ""}`} key={question.id}>
        <button type="button" id={`question-${question.id}-heading`} className="diagnosis-question-toggle" aria-expanded={open} aria-controls={`question-${question.id}-panel`} onClick={() => setOpenQuestion(open ? null : question.id)}>
          <span className="diagnosis-question-number">Q{questionIndex + 1}.</span>
          <span className="diagnosis-question-heading"><strong>{question.title}</strong>{selectedOption && <small>回答：{selectedOption.id}. {selectedOption.label}</small>}</span>
          <ExpandMoreIcon />
        </button>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box id={`question-${question.id}-panel`} role="region" aria-labelledby={`question-${question.id}-heading`} className="diagnosis-question-panel">
        <Typography color="text.secondary" sx={{ mb: 2 }}>考えすぎず、最初に心が動いたものを1つ選んでください。</Typography>
        <Box className="diagnosis-option-grid">
          {question.options.map((option, optionIndex) => {
            const selected = selections[question.id] === option.id;
            return <button type="button" className={`diagnosis-option${selected ? " is-selected" : ""}`} aria-pressed={selected} key={option.id} onClick={() => { setSelections((current) => ({ ...current, [question.id]: option.id })); setOpenQuestion(null); }}>
              <span className="diagnosis-option-image" role="img" aria-label={option.label} style={{ backgroundImage: `url(${question.image})`, backgroundPosition: `${(optionIndex % 3) * 50}% ${optionIndex < 3 ? 13.636 : 86.364}%` }} />
              <span className="diagnosis-option-copy"><strong>{option.id}</strong><span>{option.label}</span>{selected && <CheckCircleIcon aria-label="選択中" />}</span>
            </button>;
          })}
        </Box>
          </Box>
        </Collapse>
        {question.supplementLabel && selectedOption && <Box className="diagnosis-supplement"><TextField fullWidth multiline minRows={2} label={question.supplementLabel} placeholder={question.supplementPlaceholder} value={supplements[question.id] ?? ""} onChange={(event) => setSupplements((current) => ({ ...current, [question.id]: event.target.value }))} helperText={`${(supplements[question.id] ?? "").length}/500文字`} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 500 } }} /></Box>}
      </Box>})}
      {loading && <Alert severity="info" icon={false} role="status" aria-live="polite" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
        <Stack spacing={1.25}>
          <Stack direction="row" alignItems="baseline" justifyContent="space-between" gap={2}>
            <Typography fontWeight={800} color="primary.dark">{analysisStage.label}</Typography>
            <Typography component="span" fontWeight={800} color="primary.main" sx={{ whiteSpace: "nowrap" }}>{analysisProgress}%</Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={analysisProgress}
            aria-label="AI分析の進捗（目安）"
            sx={{
              height: 10,
              borderRadius: 999,
              bgcolor: "rgba(39, 77, 151, 0.12)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                background: "linear-gradient(90deg, #284f9f 0%, #7551b8 58%, #d8a92f 100%)",
              },
            }}
          />
          <Typography variant="body2" textAlign="center" color="text.secondary">
            {analysisElapsedSeconds >= 90
              ? "分析を継続しています。回答内容は保持されていますので、このままお待ちください。"
              : analysisElapsedSeconds >= 45
                ? "詳しい結果を丁寧にまとめています。画面を閉じずにお待ちください。"
                : "回答とプロフィールをもとに分析しています。進捗率は目安です。"}
          </Typography>
        </Stack>
      </Alert>}
      <Button className="diagnosis-submit-action" size="large" type="submit" variant="contained" disabled={loading || answeredCount !== diagnosisQuestions.length} startIcon={<AutoAwesomeIcon />}>AI自分探しを始める</Button>
    </Stack>
  </Box>;
}
