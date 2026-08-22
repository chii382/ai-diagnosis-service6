"use client";

import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { Alert, Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, type GridColDef, type GridPaginationModel } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";

type UserRow = { id: string; name?: string; email?: string; image?: string; role: "admin" | "user"; plan?: string; gender?: string; ageGroup?: string; diagnosisCount: number; latestDiagnosisProgress?: number; lastDiagnosisAt?: string; lastLoginAt?: string; createdAt?: string };
type UserDetail = { user: UserRow };

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("all");
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [message, setMessage] = useState<{ severity: "success" | "error"; text: string } | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { const id = setTimeout(() => { setDebouncedSearch(search); setPagination((value) => ({ ...value, page: 0 })); }, 350); return () => clearTimeout(id); }, [search]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pagination.page), pageSize: String(pagination.pageSize), search: debouncedSearch, role });
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setRows(data.rows); setTotal(data.total);
    } catch (error) { setMessage({ severity: "error", text: error instanceof Error ? error.message : "取得に失敗しました。" }); }
    finally { setLoading(false); }
  }, [pagination, debouncedSearch, role]);
  useEffect(() => { void load(); }, [load]);

  const changeRole = useCallback(async (userId: string, nextRole: "admin" | "user") => {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, role: nextRole }) });
    const data = await response.json();
    if (!response.ok) { setMessage({ severity: "error", text: data.error }); return; }
    setMessage({ severity: "success", text: "ロールを変更しました。対象ユーザーの画面更新後に反映されます。" });
    void load();
  }, [load]);
  const showDetail = useCallback(async (userId: string) => {
    try { const response = await fetch(`/api/admin/users?userId=${userId}`); const data = await response.json(); if (!response.ok) throw new Error(data.error); setDetail(data); }
    catch (error) { setMessage({ severity: "error", text: error instanceof Error ? error.message : "詳細を取得できませんでした。" }); }
  }, []);
  const deleteUser = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: deleteTarget.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDeleteTarget(null);
      setMessage({ severity: "success", text: "ユーザーを削除しました。" });
      await load();
    } catch (error) {
      setMessage({ severity: "error", text: error instanceof Error ? error.message : "ユーザーを削除できませんでした。" });
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, load]);

  const columns = useMemo<GridColDef<UserRow>[]>(() => [
    { field: "user", headerName: "ユーザー", flex: 1.4, minWidth: 240, sortable: false, renderCell: ({ row }) => <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: "100%", height: "100%", minWidth: 0 }}><Avatar src={row.image} alt={row.name || "ユーザー"} sx={{ flexShrink: 0 }} /><Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}><Typography fontWeight={700} variant="body2" noWrap sx={{ lineHeight: 1.35 }}>{row.name || "名前未設定"}</Typography><Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1.35, mt: .4 }}>{row.email || "メール未設定"}</Typography></Box></Stack> },
    { field: "role", headerName: "ロール", width: 150, renderCell: ({ row }) => <Select size="small" value={row.role} onChange={(event) => void changeRole(row.id, event.target.value as "admin" | "user")} aria-label={`${row.name || row.email}のロール`}><MenuItem value="user">user</MenuItem><MenuItem value="admin">admin</MenuItem></Select> },
    { field: "plan", headerName: "プラン", width: 100, renderCell: ({ value }) => <Chip size="small" label={value === "paid" ? "有料" : "無料"} color={value === "paid" ? "secondary" : "default"} /> },
    { field: "actions", headerName: "詳細", width: 158, sortable: false, renderCell: ({ row }) => <Button className="admin-detail-button" size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => void showDetail(row.id)} aria-label={`${row.name || row.email || "ユーザー"}の詳細を表示`}>詳細表示</Button> },
    { field: "delete", headerName: "削除", width: 158, sortable: false, renderCell: ({ row }) => <Button className="admin-delete-button" size="small" variant="contained" startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteTarget(row)} aria-label={`${row.name || row.email || "ユーザー"}を削除`}>削除</Button> },
  ], [changeRole, showDetail]);

  return <Stack spacing={3}>
    <Box><Typography className="admin-eyebrow">MEMBER DIRECTORY</Typography><Stack direction="row" gap={1} alignItems="center"><ManageAccountsIcon color="primary" /><Typography variant="h4" component="h1">ユーザー管理</Typography></Stack><Typography color="text.secondary">登録ユーザーの検索、利用状況確認、ロール変更ができます。</Typography></Box>
    <Card><CardContent sx={{ p: 3 }}><Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}><TextField placeholder="名前・メールで検索" value={search} onChange={(event) => setSearch(event.target.value)} fullWidth slotProps={{ htmlInput: { "aria-label": "名前・メールで検索" } }} sx={{ "& .MuiOutlinedInput-root": { height: 56 }, "& .MuiOutlinedInput-input": { py: 0, height: "100%", lineHeight: "23px" } }} /><FormControl sx={{ minWidth: 180 }}><InputLabel>ロール</InputLabel><Select value={role} label="ロール" onChange={(event) => { setRole(event.target.value); setPagination((value) => ({ ...value, page: 0 })); }}><MenuItem value="all">すべて</MenuItem><MenuItem value="admin">admin</MenuItem><MenuItem value="user">user</MenuItem></Select></FormControl></Stack>
      <DataGrid autoHeight rows={rows} columns={columns} loading={loading} rowCount={total} paginationMode="server" paginationModel={pagination} onPaginationModelChange={setPagination} pageSizeOptions={[10, 25, 50]} disableRowSelectionOnClick rowHeight={72} sx={{ border: 0, minHeight: 420, "& .MuiDataGrid-cell": { display: "flex", alignItems: "center", py: 0 }, "& .MuiDataGrid-columnHeader": { display: "flex", alignItems: "center" } }} />
    </CardContent></Card>
    <Snackbar open={Boolean(message)} autoHideDuration={5000} onClose={() => setMessage(null)}><Alert severity={message?.severity}>{message?.text}</Alert></Snackbar>
    <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="md" slotProps={{ paper: { sx: { bgcolor: "#f7faff", backgroundImage: "linear-gradient(145deg, rgba(255,255,255,.96), rgba(232,241,252,.96))" } } }}><DialogTitle sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2.25, fontWeight: 800, borderBottom: "1px solid", borderColor: "divider" }}>ユーザー詳細</DialogTitle><DialogContent sx={{ px: { xs: 2, sm: 3.5 }, py: "20px !important" }}>{detail && <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }} gap={1.25}>{[
      ["名前", detail.user.name || "未設定"],
      ["メールアドレス", detail.user.email || "未設定"],
      ["性別", detail.user.gender || "未回答"],
      ["年代", detail.user.ageGroup || "未回答"],
      ["初回登録日時", formatDate(detail.user.createdAt)],
      ["最終ログイン日時", formatDate(detail.user.lastLoginAt)],
      ["診断回数", `${detail.user.diagnosisCount ?? 0}回`],
      ["診断最終到達率", `${detail.user.latestDiagnosisProgress ?? 0}%`],
    ].map(([label, value]) => <Box key={label} sx={{ position: "relative", minWidth: 0, minHeight: 72, py: 1.25, pr: 1.75, pl: 2.25, overflow: "hidden", border: "1px solid rgba(94,128,180,.24)", borderRadius: 2.5, bgcolor: "rgba(255,255,255,.7)", boxShadow: "0 5px 14px rgba(16,44,104,.045)", "&::before": { content: '""', position: "absolute", inset: "10px auto 10px 0", width: 4, borderRadius: "0 4px 4px 0", bgcolor: "secondary.main" } }}><Typography variant="caption" color="text.secondary" fontWeight={800} letterSpacing=".04em">{label}</Typography><Typography title={String(value)} noWrap sx={{ mt: .25, minWidth: 0, fontSize: { xs: 15, sm: 16 }, lineHeight: 1.4, textOverflow: "ellipsis" }} fontWeight={800}>{value}</Typography></Box>)}</Box>}</DialogContent><DialogActions sx={{ px: 3.5, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}><Button onClick={() => setDetail(null)}>閉じる</Button></DialogActions></Dialog>
    <Dialog open={Boolean(deleteTarget)} onClose={deleting ? undefined : () => setDeleteTarget(null)} maxWidth="xs" fullWidth><DialogTitle fontWeight={800}>ユーザー削除の確認</DialogTitle><DialogContent><Typography>このユーザーを削除します。よろしいですか？</Typography>{deleteTarget && <Typography variant="body2" color="text.secondary" mt={1}>{deleteTarget.name || "名前未設定"}（{deleteTarget.email || "メール未設定"}）</Typography>}</DialogContent><DialogActions sx={{ px: 3, pb: 2.5 }}><Button onClick={() => setDeleteTarget(null)} disabled={deleting}>キャンセル</Button><Button className="admin-delete-confirm-button" variant="contained" onClick={() => void deleteUser()} disabled={deleting}>{deleting ? "削除中…" : "OK"}</Button></DialogActions></Dialog>
  </Stack>;
}

function formatDate(value: unknown, dateOnly = false) {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("ja-JP", dateOnly ? { year: "numeric", month: "2-digit", day: "2-digit" } : undefined);
}
