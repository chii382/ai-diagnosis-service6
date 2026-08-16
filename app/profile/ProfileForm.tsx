"use client";

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SaveIcon from "@mui/icons-material/Save";
import { Alert, Avatar, Box, Button, Chip, CircularProgress, Divider, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { setGlobalBusy } from "@/app/components/GlobalBusyIndicator";
import { currentStatusOptions, naturalStrengthOptions, repeatedRoleOptions, selfDiscoveryGoalOptions, stressfulSituationOptions } from "@/lib/profile-options";

type Profile = { name: string; email: string; image: string; plan: "free" | "paid"; gender: string; ageGroup: string; currentStatus: string; currentActivity: string; repeatedRoles: string[]; naturalStrengths: string[]; stressfulSituations: string[]; selfDiscoveryGoal: string; currentConcern: string };
type EditableProfile = Pick<Profile, "name" | "image" | "gender" | "ageGroup" | "currentStatus" | "currentActivity" | "repeatedRoles" | "naturalStrengths" | "stressfulSituations" | "selfDiscoveryGoal" | "currentConcern">;
const emptyForm: EditableProfile = { name: "", image: "", gender: "未回答", ageGroup: "未回答", currentStatus: "未回答", currentActivity: "", repeatedRoles: [], naturalStrengths: [], stressfulSituations: [], selfDiscoveryGoal: "未回答", currentConcern: "" };
const genders = ["未回答", "女性", "男性", "ノンバイナリー", "その他"];
const ageGroups = ["未回答", "10代", "20代", "30代", "40代", "50代", "60代以上"];

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
      .then(async (response) => { const data = await readJson(response); if (!response.ok) throw new Error(data.error); const editable = { name: data.name, image: data.image, gender: data.gender, ageGroup: data.ageGroup, currentStatus: data.currentStatus, currentActivity: data.currentActivity, repeatedRoles: data.repeatedRoles, naturalStrengths: data.naturalStrengths, stressfulSituations: data.stressfulSituations, selfDiscoveryGoal: data.selfDiscoveryGoal, currentConcern: data.currentConcern }; setProfile(data); setForm(editable); setSavedForm(editable); })
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
        <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="center" spacing={{ xs: 1.5, sm: 3 }}>
          <Avatar src={form.image || undefined} alt={form.name || "ユーザー"} sx={{ width: 112, height: 112 }} />
          <Stack alignItems={{ xs: "center", sm: "flex-start" }} spacing={1}>
            <Button component="label" variant="outlined" size="small" startIcon={<PhotoCameraIcon />}>写真を変更<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={changeImage} /></Button>
            <Typography variant="caption" color="text.secondary" whiteSpace="nowrap">PNG・JPEG・WebP／1MB以下</Typography>
          </Stack>
        </Stack>
        {message && <Alert severity={message.type}>{message.text}</Alert>}
        <TextField fullWidth required label="名前" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} slotProps={{ htmlInput: { maxLength: 100 } }} />
        <TextField fullWidth disabled label="メールアドレス" value={profile?.email ?? ""} helperText="Googleアカウントから取得しています。" />
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <SelectField label="性別" value={form.gender} items={genders} onChange={(value) => setForm({ ...form, gender: value })} />
          <SelectField label="年代" value={form.ageGroup} items={ageGroups} onChange={(value) => setForm({ ...form, ageGroup: value })} />
        </Stack>
        <Divider><Typography color="text.secondary" fontWeight={700}>自己理解プロフィール</Typography></Divider>
        <Typography color="text.secondary" textAlign="center">プロフィールを充実させることで、より深い自分探しの旅ができます。</Typography>
        <Box>
          <Typography variant="h6" component="h3" fontWeight={700}>1．現在の状況</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>今のあなたに最も近い状況を選んでください。</Typography>
          <SelectField label="現在の状況" value={form.currentStatus} items={[...currentStatusOptions]} onChange={(value) => setForm({ ...form, currentStatus: value })} />
          <TextField fullWidth label="現在の仕事や主な活動（任意）" value={form.currentActivity} onChange={(event) => setForm({ ...form, currentActivity: event.target.value })} helperText={`${form.currentActivity.length}/200文字`} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 200 } }} sx={{ mt: 2 }} />
        </Box>
        <ChoiceGroup title="2．これまで繰り返し担当してきた役割" description="「得意だと思うこと」ではなく、実際に繰り返してきた役割を最大2つ選んでください。" options={[...repeatedRoleOptions]} values={form.repeatedRoles} onChange={(values) => setForm({ ...form, repeatedRoles: values })} />
        <ChoiceGroup title="3．自然にできること" description="頑張りすぎなくても自然にできることを、最大2つ選んでください。" options={[...naturalStrengthOptions]} values={form.naturalStrengths} onChange={(values) => setForm({ ...form, naturalStrengths: values })} />
        <ChoiceGroup title="4．負担を感じやすい状況" description="その裏側にある大切な価値観を知るため、最大2つ選んでください。" options={[...stressfulSituationOptions]} values={form.stressfulSituations} onChange={(values) => setForm({ ...form, stressfulSituations: values })} />
        <Box>
          <Typography variant="h6" component="h3" fontWeight={700}>5．今、自分について知りたいこと</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>今回最も知りたいことを1つ選んでください。</Typography>
          <SelectField label="知りたいこと" value={form.selfDiscoveryGoal} items={[...selfDiscoveryGoalOptions]} onChange={(value) => setForm({ ...form, selfDiscoveryGoal: value })} />
          <TextField fullWidth multiline minRows={3} label="最近気になること・言葉にできない違和感（任意）" placeholder="なぜか気になっていることや、うまく説明できない違和感など" value={form.currentConcern} onChange={(event) => setForm({ ...form, currentConcern: event.target.value })} helperText={`${form.currentConcern.length}/500文字`} slotProps={{ inputLabel: { shrink: true }, htmlInput: { maxLength: 500 } }} sx={{ mt: 2 }} />
        </Box>
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

function ChoiceGroup({ title, description, options, values, onChange }: { title: string; description: string; options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const toggle = (option: string) => {
    if (values.includes(option)) onChange(values.filter((value) => value !== option));
    else if (values.length < 2) onChange([...values, option]);
  };
  return <Box><Typography variant="h6" component="h3" fontWeight={700}>{title}</Typography><Typography color="text.secondary" variant="body2" sx={{ mb: 1.5 }}>{description}</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{options.map((option) => <Chip key={option} label={option} clickable color={values.includes(option) ? "primary" : "default"} variant={values.includes(option) ? "filled" : "outlined"} aria-pressed={values.includes(option)} onClick={() => toggle(option)} />)}</Stack><FormHelperText sx={{ mt: 1 }}>{values.length}/2個選択</FormHelperText></Box>;
}

async function readJson(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) throw new Error("サーバーから不正な応答が返されました。ページを再読み込みしてください。");
  return response.json();
}
