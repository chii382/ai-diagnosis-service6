import { InteriorShell } from "@/app/components/InteriorShell";

export default function LegalPage() {
  return (
    <InteriorShell wide eyebrow="LEGAL INFORMATION" title="特定商取引法に基づく表記" description="サービスの提供条件と事業者情報をご案内します。">
      <article className="legal-card sanctuary-card">
        <p className="legal-note">本ページは雛形です。公開前に事業者情報をご記入ください。</p>
        <dl><dt>販売事業者</dt><dd>準備中</dd><dt>運営責任者</dt><dd>準備中</dd><dt>所在地</dt><dd>準備中</dd><dt>連絡先</dt><dd>準備中</dd><dt>販売価格</dt><dd>有料プラン 980円（税込）</dd><dt>支払方法</dt><dd>クレジットカード</dd></dl>
      </article>
    </InteriorShell>
  );
}
