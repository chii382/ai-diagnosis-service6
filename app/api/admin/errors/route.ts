import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { reportAdminError } from "@/lib/admin-errors";

export async function GET() {
  const access = await requireAdmin();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  const token = process.env.SENTRY_AUTH_TOKEN;
  if (!org || !project || !token) {
    return NextResponse.json({ rows: [], configured: false, message: "SENTRY_ORG、SENTRY_PROJECT、SENTRY_AUTH_TOKENを設定するとエラー一覧を表示できます。" });
  }
  try {
    const response = await fetch(`https://sentry.io/api/0/projects/${encodeURIComponent(org)}/${encodeURIComponent(project)}/issues/?query=is%3Aunresolved&limit=50`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`Sentry API returned ${response.status}`);
    const issues = await response.json() as Array<Record<string, unknown>>;
    const rows = issues.map((issue) => ({ id: String(issue.id), title: issue.title, culprit: issue.culprit, level: issue.level, count: Number(issue.count || 0), users: Number(issue.userCount || 0), firstSeen: issue.firstSeen, lastSeen: issue.lastSeen, status: issue.status, permalink: issue.permalink }));
    return NextResponse.json({ rows, configured: true });
  } catch (error) {
    await reportAdminError(error, "Sentryエラー一覧取得");
    return NextResponse.json({ error: "Sentryからエラー一覧を取得できませんでした。" }, { status: 502 });
  }
}
