import { redirect } from "next/navigation";

// 料金ページへのリンクを、トップページ内の料金セクションへつなぎます。
export default function PricingPage() {
  redirect("/?skipOpening=1#pricing");
}
