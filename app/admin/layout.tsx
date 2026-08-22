import { requireAdmin } from "@/lib/admin";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const access = await requireAdmin();
  if (!access.ok) redirect(access.status === 401 ? "/auth/signin?callbackUrl=/admin" : "/dashboard?error=forbidden");
  return <AdminShell user={access.session.user}>{children}</AdminShell>;
}
