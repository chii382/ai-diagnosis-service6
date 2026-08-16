"use client";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Alert, Box, Button, Collapse, LinearProgress, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { diagnosisQuestions } from "@/lib/diagnosis-questions";
import { setGlobalBusy } from "@/app/components/GlobalBusyIndicator";

export function DiagnosisForm() {
  const router = useRouter();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [supplements, setSupplements] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const answeredCount = useMemo(() => diagnosisQuestions.filter((question) => selections[question.id]).length, [selections]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (answeredCount !== diagnosisQuestions.length) { setError("5問すべてに回答してください。"); return; }
    setLoading(true); setGlobalBusy(true); setError("");
    try {
      const response = await fetch("/api/diagnosis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ selections, supplements }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      sessionStorage.setItem("latestDiagnosis", JSON.stringify(data));
      router.push("/diagnosis/result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "診断に失敗しました。");
      setLoading(false); setGlobalBusy(false);
    }
  }

  return <Box component="form" onSubmit={submit}>
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
              <span className="diagnosis-option-image" role="img" aria-label={option.label} style={{ backgroundImage: `url(${question.image})`, backgroundPosition: `${(optionIndex % 3) * 50}% ${Math.floor(optionIndex / 3) * 100}%` }} />
              <span className="diagnosis-option-copy"><strong>{option.id}</strong><span>{option.label}</span>{selected && <CheckCircleIcon aria-label="選択中" />}</span>
            </button>;
          })}
        </Box>
          </Box>
        </Collapse>
        {question.supplementLabel && selectedOption && <Box className="diagnosis-supplement"><TextField fullWidth multiline minRows={2} label={question.supplementLabel} placeholder={question.supplementPlaceholder} value={supplements[question.id] ?? ""} onChange={(event) => setSupplements((current) => ({ ...current, [question.id]: event.target.value }))} helperText={`${(supplements[question.id] ?? "").length}/500文字`} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 500 } }} /></Box>}
      </Box>})}
      {loading && <Alert severity="info" icon={false}><LinearProgress sx={{ mb: 1.5 }} /><Typography textAlign="center">AIが回答とプロフィールの共通点を読み解いています…</Typography></Alert>}
      <Button className="diagnosis-submit-action" size="large" type="submit" variant="contained" disabled={loading || answeredCount !== diagnosisQuestions.length} startIcon={<AutoAwesomeIcon />}>AI自分探しを始める</Button>
    </Stack>
  </Box>;
}
