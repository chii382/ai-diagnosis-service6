"use client";
import { Alert, Button, Card, CardContent, Stack, TextField } from "@mui/material";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function EditDiagnosisForm({ id, initialEssence, initialMessage }: { id: string; initialEssence: string; initialMessage: string }) {
  const router = useRouter();
  const [essence, setEssence] = useState(initialEssence);
  const [message, setMessage] = useState(initialMessage);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const response = await fetch(`/api/diagnosis/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ essence, message }) });
    const data = await response.json();
    if (response.ok) router.push(`/diagnosis/${id}`); else { setError(data.error || "更新に失敗しました。"); setSaving(false); }
  }
  return <Card className="sanctuary-card"><CardContent sx={{ p: { xs: 3, md: 5 } }}><Stack component="form" onSubmit={save} spacing={3}>{error && <Alert severity="error">{error}</Alert>}<TextField label="あなたの本質" multiline minRows={6} required value={essence} onChange={(event) => setEssence(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 3000 } }} helperText={`${essence.length}/3000文字`} /><TextField label="最後のメッセージ" multiline minRows={5} required value={message} onChange={(event) => setMessage(event.target.value)} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 3000 } }} helperText={`${message.length}/3000文字`} /><Stack direction={{ xs: "column", sm: "row" }} spacing={2}><Button type="submit" variant="contained" disabled={saving}>変更を保存</Button><Button type="button" variant="outlined" onClick={() => router.back()}>キャンセル</Button></Stack></Stack></CardContent></Card>;
}
