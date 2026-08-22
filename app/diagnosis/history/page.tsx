import { redirect } from "next/navigation";
import { InteriorShell } from "@/app/components/InteriorShell";
import { requirePaidDiagnosisUser } from "@/lib/diagnosis";
import { HistoryList } from "./HistoryList";

export default async function HistoryPage() {
  const access = await requirePaidDiagnosisUser();
  if (!access.authenticated) redirect("/auth/signin?callbackUrl=/diagnosis/history");
  if (!access.paid) redirect("/dashboard?upgrade=history");
  return <InteriorShell variant="diagnosis-history" dashboardLink eyebrow="JOURNEY RECORDS" title="自分探しの履歴" description="その時々の自分から見つけた、気づきの軌跡です。"><HistoryList /></InteriorShell>;
}
