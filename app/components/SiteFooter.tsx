import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="brand footer-brand"><Image className="brand-emblem" src="/images/brand-emblem-gold.png" alt="" width={1024} height={1024} /><span><strong>AI自分探し</strong><small>サービス</small></span></div>
        <nav aria-label="フッターナビゲーション"><a href="#features">特徴</a><a href="#flow">ご利用の流れ</a><a href="#pricing">料金プラン</a><a href="#faq">よくある質問</a></nav>
        <div className="legal-links"><a href="/legal">特定商取引法に基づく表記</a><a href="#">プライバシーポリシー</a><a href="#">利用規約</a></div>
        <small>© 2026 AI自分探しサービス All Rights Reserved.</small>
      </div>
    </footer>
  );
}
