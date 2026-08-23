"use client";

import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

function formatEndDate(value?: string) {
  if (!value) return "契約期間の終了日";
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric", timeZone: "Asia/Tokyo" }).format(new Date(value));
}

export function CancelSubscriptionButton({
  initiallyScheduled = false,
  initialPeriodEnd,
}: {
  initiallyScheduled?: boolean;
  initialPeriodEnd?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scheduled, setScheduled] = useState(initiallyScheduled);
  const [periodEnd, setPeriodEnd] = useState(initialPeriodEnd);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function cancelSubscription() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/stripe/subscription/cancel", { method: "POST" });
      const data = await response.json() as { error?: string; periodEnd?: string };
      if (!response.ok) throw new Error(data.error || "解約手続きを完了できませんでした。");
      setScheduled(true);
      setPeriodEnd(data.periodEnd || periodEnd);
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "解約手続きを完了できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  async function resumeSubscription() {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/stripe/subscription/resume", { method: "POST" });
      const data = await response.json() as { error?: string; periodEnd?: string };
      if (!response.ok) throw new Error(data.error || "継続手続きを完了できませんでした。");
      setScheduled(false);
      setPeriodEnd(data.periodEnd || periodEnd);
      setNotice("解約予約を取り消しました。有料プランは継続されます。");
      setOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "継続手続きを完了できませんでした。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Stack className="subscription-cancel-area" spacing={1} alignItems="flex-end">
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}
      {scheduled ? (
        <Stack spacing={1} alignItems="flex-end">
          <Alert severity="info">有料プランは{formatEndDate(periodEnd)}まで利用できます。その後、自動的に解約されます。</Alert>
          <Button
            className="subscription-resume-button"
            variant="contained"
            startIcon={<AutorenewIcon />}
            onClick={() => setOpen(true)}
          >
            解約を取り消して継続する
          </Button>
        </Stack>
      ) : (
        <Button
          className="subscription-cancel-button"
          variant="outlined"
          startIcon={<CreditCardOffIcon />}
          onClick={() => setOpen(true)}
        >
          有料プランを解約
        </Button>
      )}
      <Dialog open={open} onClose={() => !loading && setOpen(false)} aria-labelledby="cancel-subscription-title">
        <DialogTitle id="cancel-subscription-title">{scheduled ? "有料プランを継続しますか？" : "有料プランを解約しますか？"}</DialogTitle>
        <DialogContent>
          <Typography>{scheduled
            ? "解約予約を取り消すと有料プランが継続され、次回の更新日に通常どおり料金が請求されます。"
            : `解約後も${formatEndDate(periodEnd)}までは、有料機能をご利用いただけます。`}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>キャンセル</Button>
          <Button color={scheduled ? "primary" : "error"} variant="contained" onClick={() => void (scheduled ? resumeSubscription() : cancelSubscription())} disabled={loading}>
            {loading ? "手続き中…" : scheduled ? "継続する" : "解約する"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
