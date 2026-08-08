import Link from "next/link";

export default function LegalPage() {
  return (
    <main style={{ maxWidth: 820, margin: "0 auto", padding: "80px 24px", minHeight: "100vh", background: "rgba(255,255,255,.8)" }}>
      <Link href="/">← トップへ戻る</Link>
      <h1>特定商取引法に基づく表記</h1>
      <p>本ページは雛形です。公開前に事業者情報をご記入ください。</p>
      <dl><dt>販売事業者</dt><dd>準備中</dd><dt>運営責任者</dt><dd>準備中</dd><dt>所在地</dt><dd>準備中</dd><dt>連絡先</dt><dd>準備中</dd><dt>販売価格</dt><dd>有料プラン 980円（税込）</dd><dt>支払方法</dt><dd>クレジットカード</dd></dl>
    </main>
  );
}
