import { Card, CardContent } from "@mui/material";
import { InteriorShell } from "@/app/components/InteriorShell";
import { DiagnosisForm } from "./DiagnosisForm";
export default function DiagnosisPage() { return <InteriorShell variant="diagnosis" wide eyebrow="INNER COMPASS" title="AI自分探し" description="直感で選ぶ5つの問いから、まだ言葉になっていないあなたらしさを見つけます。"><Card className="sanctuary-card"><CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}><DiagnosisForm /></CardContent></Card></InteriorShell>; }
