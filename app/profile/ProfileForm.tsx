"use client";

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Avatar, Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { setGlobalBusy } from "@/app/components/GlobalBusyIndicator";

type Profile = { name: string; email: string; image: string; plan: "free" | "paid"; gender: string; ageGroup: string; occupation: string; bio: string };
type EditableProfile = Pick<Profile, "name" | "image" | "gender" | "ageGroup" | "occupation" | "bio">;
const emptyForm: EditableProfile = { name: "", image: "", gender: "未回答", ageGroup: "未回答", occupation: "未回答", bio: "" };
const genders = ["未回答", "女性", "男性", "ノンバイナリー", "その他"];
const ageGroups = ["未回答", "10代", "20代", "30代", "40代", "50代", "60代以上"];
const occupations = ["未回答", "会社員", "公務員", "経営者・役員", "自営業・フリーランス", "学生", "主婦・主夫", "パート・アルバイト", "求職中", "その他"];

export function ProfileForm() {
  const router = useRouter();
  const { update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<EditableProfile>(emptyForm);
  const [savedForm, setSavedForm] = useState<EditableProfile>(emptyForm);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGlobalBusy(true);
    fetch("/api/user/profile")
      .then(async (response) => { const data = await readJson(response); if (!response.ok) throw new Error(data.error); const editable = { name: data.name, image: data.image, gender: data.gender, ageGroup: data.ageGroup, occupation: data.occupation, bio: data.bio }; setProfile(data); setForm(editable); setSavedForm(editable); })
      .catch((error) => setMessage({ type: "error", text: error.message || "プロフィールを取得できませんでした。" }))
      .finally(() => setGlobalBusy(false));
  }, []);

  const changeImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setMessage({ type: "error", text: "PNG、JPEG、WebP画像を選択してください。" }); return; }
    if (file.size > 1024 * 1024) { setMessage({ type: "error", text: "画像は1MB以下にしてください。" }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault(); setSaving(true); setGlobalBusy(true); setMessage(null);
    try {
      const response = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await readJson(response); if (!response.ok) throw new Error(data.error);
      setProfile((current) => current ? { ...current, ...data } : current);
      await update({ name: data.name, image: data.image });
      setSavedForm(form);
      setGlobalBusy(true);
      if (window.history.length > 1) router.back();
      else router.replace("/dashboard");
    } catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "保存に失敗しました。" }); }
    finally { setSaving(false); setGlobalBusy(false); }
  };

  const hasUnsavedChanges = JSON.stringify(form) !== JSON.stringify(savedForm);
  const returnToDashboard = () => {
    if (hasUnsavedChanges && !window.confirm("入力内容は保存されていません。入力を破棄してダッシュボードに戻っても良いですか？")) return;
    setGlobalBusy(true);
    router.push("/dashboard");
  };

  if (!profile && !message) return <Box sx={{ py: 6, textAlign: "center" }}><CircularProgress aria-label="読み込み中" /></Box>;
  return (
    <Box component="form" onSubmit={save}>
      <Stack spacing={3}>
        <Stack alignItems="center" spacing={1.5}>
          <Avatar src={form.image || undefined} alt={form.name || "ユーザー"} sx={{ width: 112, height: 112 }} />
          <Button component="label" variant="outlined" size="small" startIcon={<PhotoCameraIcon />}>写真を変更<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={changeImage} /></Button>
          <Typography variant="caption" color="text.secondary">PNG・JPEG・WebP／1MB以下</Typography>
        </Stack>
        {message && <Alert severity={message.type}>{message.text}</Alert>}
        <TextField fullWidth required label="名前" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} slotProps={{ htmlInput: { maxLength: 100 } }} />
        <TextField fullWidth disabled label="メールアドレス" value={profile?.email ?? ""} helperText="Googleアカウントから取得しています。" />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <SelectField label="性別" value={form.gender} items={genders} onChange={(value) => setForm({ ...form, gender: value })} />
          <SelectField label="年代" value={form.ageGroup} items={ageGroups} onChange={(value) => setForm({ ...form, ageGroup: value })} />
        </Stack>
        <SelectField label="職業" value={form.occupation} items={occupations} onChange={(value) => setForm({ ...form, occupation: value })} />
        <TextField fullWidth multiline minRows={4} label="その他・自由入力" placeholder="今の悩み、興味のあること、これから挑戦したいことなど" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} helperText={`${form.bio.length}/500文字`} slotProps={{ htmlInput: { maxLength: 500 } }} />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button fullWidth type="submit" variant="contained" startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} disabled={saving || !form.name.trim()}>変更を保存</Button>
          <Button fullWidth type="button" variant="outlined" onClick={returnToDashboard}>ダッシュボードへ戻る</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function SelectField({ label, value, items, onChange }: { label: string; value: string; items: string[]; onChange: (value: string) => void }) {
  return <FormControl fullWidth><InputLabel>{label}</InputLabel><Select label={label} value={value} onChange={(event) => onChange(event.target.value)}>{items.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}</Select></FormControl>;
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) throw new Error("サーバーから不正な応答が返されました。ページを再読み込みしてください。");
  return response.json();
}
