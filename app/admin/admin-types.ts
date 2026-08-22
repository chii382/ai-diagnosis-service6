export type CountItem = { label: string; count: number };
export type AnalyticsData = {
  metrics: { todayAnalyses: number; totalAnalyses: number; activeUsers: number; totalUsers: number; completionRate: number };
  timeline: CountItem[];
  profile: { naturalStrengths: CountItem[]; repeatedRoles: CountItem[]; stressfulSituations: CountItem[]; selfDiscoveryGoals: CountItem[] };
  attributes: { ageGroup: CountItem[]; gender: CountItem[]; currentStatus: CountItem[] };
  recent: Array<{ id: string; title: string; userName: string; email: string; plan: "free" | "paid"; createdAt: string }>;
  system: { database: string; checkedAt: string };
};

export async function fetchAdminJson<T>(url: string): Promise<T> {
  const started = performance.now();
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "データを取得できませんでした。");
  return { ...data, responseTime: Math.round(performance.now() - started) } as T;
}
