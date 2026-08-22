"use client";

import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import InsightsIcon from "@mui/icons-material/Insights";
import BugReportIcon from "@mui/icons-material/BugReport";
import HomeIcon from "@mui/icons-material/Home";
import { Avatar, Box, Button, Chip, Container, Paper, Stack, Tab, Tabs, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { href: "/admin", label: "概要", icon: <DashboardIcon /> },
  { href: "/admin/users", label: "ユーザー", icon: <GroupIcon /> },
  { href: "/admin/analytics", label: "分析", icon: <InsightsIcon /> },
  { href: "/admin/errors", label: "エラー", icon: <BugReportIcon /> },
];

export function AdminShell({ children, user }: { children: ReactNode; user: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname();
  const selected = navigation.findIndex((item) => item.href === pathname);
  return <Box className="admin-shell">
    <Paper className="admin-header" square elevation={0}>
      <Container maxWidth="xl">
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between" gap={2} py={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar src={user.image ?? undefined} alt={user.name ?? "管理者"} />
            <Box><Typography fontWeight={800}>AI自分探し 管理画面</Typography><Typography className="admin-header-email" variant="caption">{user.email}</Typography></Box>
            <Chip label="ADMIN" color="primary" size="small" />
          </Stack>
          <Button component={Link} href="/dashboard" startIcon={<HomeIcon />} variant="outlined" size="small">会員画面へ</Button>
        </Stack>
        <Tabs
          value={selected < 0 ? false : selected}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="管理画面ナビゲーション"
          sx={{
            minHeight: 56,
            px: 1,
            pt: 1,
            borderRadius: "14px 14px 0 0",
            "& .MuiTabs-flexContainer": { gap: { xs: .5, sm: 1 } },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          {navigation.map((item) => <Tab
            key={item.href}
            component={Link}
            href={item.href}
            icon={item.icon}
            iconPosition="start"
            label={item.label}
            sx={{
              minHeight: 48,
              minWidth: { xs: 112, sm: 140 },
              px: { xs: 1.5, sm: 2.5 },
              border: "1px solid transparent",
              borderBottom: 0,
              borderRadius: "12px 12px 0 0",
              transition: "background-color .2s, color .2s, box-shadow .2s",
            }}
          />)}
        </Tabs>
      </Container>
    </Paper>
    <Container className="admin-main" id="main-content" component="main" maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>{children}</Container>
  </Box>;
}
