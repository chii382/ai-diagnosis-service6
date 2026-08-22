import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/admin";
import { reportAdminError } from "@/lib/admin-errors";

type Period = "daily" | "weekly" | "monthly";
type CountItem = { label: string; count: number };

export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.ok) return NextResponse.json({ error: access.error }, { status: access.status });
  try {
    const { searchParams } = new URL(request.url);
    const period = (["daily", "weekly", "monthly"].includes(searchParams.get("period") ?? "") ? searchParams.get("period") : "daily") as Period;
    const db = (await clientPromise).db();
    const [users, diagnoses] = await Promise.all([
      db.collection("users").find({}, { projection: { name: 1, email: 1, gender: 1, ageGroup: 1, currentStatus: 1, occupation: 1, repeatedRoles: 1, naturalStrengths: 1, stressfulSituations: 1, selfDiscoveryGoal: 1, lastLoginAt: 1, createdAt: 1 } }).toArray(),
      db.collection("diagnoses").find({}, { projection: { userId: 1, result: 1, answers: 1, plan: 1, createdAt: 1 } }).sort({ createdAt: -1 }).toArray(),
    ]);
    const now = new Date();
    const today = localDay(now);
    const activeSince = new Date(now.getTime() - 30 * 86400000);
    const diagnosedUsers = new Set(diagnoses.map((item) => String(item.userId)));
    const userMap = new Map(users.map((user) => [String(user._id), user]));
    const timelineMap = new Map<string, number>();
    for (const diagnosis of diagnoses) {
      const key = bucket(new Date(diagnosis.createdAt), period);
      timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1);
    }
    const timeline = [...timelineMap].sort(([a], [b]) => a.localeCompare(b)).slice(period === "daily" ? -30 : period === "weekly" ? -26 : -12).map(([label, count]) => ({ label, count }));
    if (searchParams.get("format") === "csv") return csvResponse(period, timeline);

    const profile = {
      naturalStrengths: top(users.flatMap((user) => Array.isArray(user.naturalStrengths) ? user.naturalStrengths : [])),
      repeatedRoles: top(users.flatMap((user) => Array.isArray(user.repeatedRoles) ? user.repeatedRoles : [])),
      stressfulSituations: top(users.flatMap((user) => Array.isArray(user.stressfulSituations) ? user.stressfulSituations : [])),
      selfDiscoveryGoals: top(users.flatMap((user) => [user.selfDiscoveryGoal])),
    };
    const attributes = {
      ageGroup: top(users.map((user) => user.ageGroup)),
      gender: top(users.map((user) => user.gender)),
      currentStatus: top(users.map((user) => user.currentStatus || user.occupation)),
    };
    const recent = diagnoses.slice(0, 5).map((diagnosis) => {
      const user = userMap.get(String(diagnosis.userId));
      return { id: String(diagnosis._id), title: diagnosis.result?.title || "分析結果", userName: user?.name || "名前未設定", email: user?.email || "", plan: diagnosis.plan === "paid" ? "paid" : "free", createdAt: diagnosis.createdAt };
    });
    return NextResponse.json({
      metrics: {
        todayAnalyses: diagnoses.filter((item) => localDay(new Date(item.createdAt)) === today).length,
        totalAnalyses: diagnoses.length,
        activeUsers: users.filter((user) => user.lastLoginAt && new Date(user.lastLoginAt) >= activeSince).length,
        totalUsers: users.length,
        completionRate: users.length ? Math.round(diagnosedUsers.size / users.length * 1000) / 10 : 0,
      },
      timeline, profile, attributes, recent,
      system: { database: "connected", checkedAt: now.toISOString() },
    });
  } catch (error) {
    await reportAdminError(error, "分析レポート取得");
    return NextResponse.json({ error: "分析レポートを取得できませんでした。" }, { status: 500 });
  }
}

function top(values: unknown[]): CountItem[] {
  const counts = new Map<string, number>();
  const unanswered = new Set(["未回答", "未設定", "不明", "回答なし"]);
  values.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter((value) => value && !unanswered.has(value)).forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "ja")).slice(0, 10);
}

function localDay(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function bucket(date: Date, period: Period) {
  if (period === "daily") return localDay(date);
  if (period === "monthly") return localDay(date).slice(0, 7);
  const jst = new Date(`${localDay(date)}T00:00:00+09:00`);
  const day = (jst.getUTCDay() + 6) % 7;
  jst.setUTCDate(jst.getUTCDate() - day);
  return `${localDay(jst)}週`;
}

function csvResponse(period: Period, timeline: CountItem[]) {
  const labels = { daily: "日", weekly: "週", monthly: "月" };
  const csv = `\uFEFF${labels[period]},分析数\r\n${timeline.map((row) => `"${row.label.replaceAll('"', '""')}",${row.count}`).join("\r\n")}`;
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="analytics-${period}.csv"` } });
}
