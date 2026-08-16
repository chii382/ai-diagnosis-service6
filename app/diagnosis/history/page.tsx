import { InteriorShell } from "@/app/components/InteriorShell"; import { HistoryList } from "./HistoryList";
export default function HistoryPage() { return <InteriorShell variant="diagnosis-history" eyebrow="JOURNEY RECORDS" title="自分探しの履歴" description="その時々の自分から見つけた、気づきの軌跡です。"><HistoryList /></InteriorShell>; }
