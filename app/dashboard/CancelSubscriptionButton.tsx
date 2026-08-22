"use client";

import CreditCardOffIcon from "@mui/icons-material/CreditCardOff";
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

  async function cancelSubscription() {
    setLoading(true);
    setError("");
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

  return (
    <Stack className="subscription-cancel-area" spacing={1} alignItems="flex-end">
      {error && <Alert severity="error">{error}</Alert>}
      {scheduled ? (
        <Alert severity="info">有料プランは{formatEndDate(periodEnd)}まで利用できます。その後、自動的に解約されます。</Alert>
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
        <DialogTitle id="cancel-subscription-title">有料プランを解約しますか？</DialogTitle>
        <DialogContent>
          <Typography>解約後も{formatEndDate(periodEnd)}までは、有料機能をご利用いただけます。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>キャンセル</Button>
          <Button color="error" variant="contained" onClick={() => void cancelSubscription()} disabled={loading}>
            {loading ? "手続き中…" : "解約する"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
