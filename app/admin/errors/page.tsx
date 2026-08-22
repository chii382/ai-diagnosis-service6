"use client";

import BugReportIcon from "@mui/icons-material/BugReport";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Alert, Box, Card, CardContent, Chip, CircularProgress, Link, Stack, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";

type ErrorRow = { id: string; title: string; culprit: string; level: string; count: number; users: number; firstSeen: string; lastSeen: string; status: string; permalink: string };

export default function AdminErrorsPage() {
  const [rows, setRows] = useState<ErrorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ severity: "info" | "error"; text: string } | null>(null);
  useEffect(() => { fetch("/api/admin/errors", { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setRows(data.rows); if (!data.configured) setNotice({ severity: "info", text: data.message }); }).catch((error) => setNotice({ severity: "error", text: error.message })).finally(() => setLoading(false)); }, []);
  const columns = useMemo<GridColDef<ErrorRow>[]>(() => [
    { field: "title", headerName: "エラー", flex: 1.5, minWidth: 280, renderCell: ({ row }) => <Box py={1}><Link href={row.permalink} target="_blank" rel="noopener noreferrer" fontWeight={700}>{row.title} <OpenInNewIcon sx={{ fontSize: 14 }} /></Link><Typography variant="caption" display="block" color="text.secondary">{row.culprit || "発生箇所不明"}</Typography></Box> },
    { field: "level", headerName: "レベル", width: 100, renderCell: ({ value }) => <Chip size="small" color={value === "fatal" || value === "error" ? "error" : "warning"} label={String(value)} /> },
    { field: "count", headerName: "発生数", width: 90, type: "number" },
    { field: "users", headerName: "影響ユーザー", width: 120, type: "number" },
    { field: "firstSeen", headerName: "初回", width: 170, valueFormatter: (value) => new Date(String(value)).toLocaleString("ja-JP") },
    { field: "lastSeen", headerName: "最終", width: 170, valueFormatter: (value) => new Date(String(value)).toLocaleString("ja-JP") },
    { field: "status", headerName: "状態", width: 110 },
  ], []);
  return <Stack spacing={3}><Box><Typography className="admin-eyebrow">SYSTEM WATCH</Typography><Stack direction="row" gap={1} alignItems="center"><BugReportIcon color="primary" /><Typography variant="h4" component="h1">エラーログ監視</Typography></Stack><Typography color="text.secondary">Sentryで検知した未解決エラーを確認できます。</Typography></Box>{notice && <Alert severity={notice.severity}>{notice.text}</Alert>}<Card><CardContent sx={{ p: 3 }}>{loading ? <Box textAlign="center" py={8}><CircularProgress /></Box> : <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick rowHeight={68} pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }} sx={{ border: 0, minHeight: 420 }} />}</CardContent></Card></Stack>;
}
