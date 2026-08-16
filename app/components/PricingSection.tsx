import { DiagnosisCta } from "./DiagnosisCta";

const free = ["AI簡易診断", "基本的な分析結果", "簡易行動プランの提案", "診断履歴の保存"];
const paid = ["AI詳細診断", "詳細な分析レポート", "性格・価値観分析", "あなただけの行動プラン提案", "診断履歴の保存", "診断結果のPDF出力"];

function List({ items, gold = false }: { items: string[]; gold?: boolean }) {
  return <ul className="plan-list">{items.map((item) => <li key={item}><span className={gold ? "check gold" : "check"}>✓</span>{item}</li>)}</ul>;
}

export function PricingSection() {
  return (
    <section className="content-section" id="pricing" aria-labelledby="pricing-title">
      <div className="shell">
        <h2 className="section-title" id="pricing-title"><span />料金プラン<span /></h2>
        <div className="pricing-grid">
          <article className="plan-card glass-card" id="free-plan">
            <h3>無料プラン</h3><p className="price"><small>¥</small>0</p><p className="plan-lead">少しずつ自分を知る</p>
            <List items={free} />
            <DiagnosisCta variant="light">無料で少しずつ始めてみる</DiagnosisCta>
          </article>
          <article className="plan-card paid-card" id="paid-plan">
            <span className="recommend">おすすめ</span>
            <h3>有料プラン</h3><p className="price"><small>¥</small>980</p><p className="plan-lead">本当の自分と向き合うため<br />行動プランを知る</p>
            <List items={paid} gold />
            <DiagnosisCta variant="gold" comingSoon>今すぐ有料プランに進む</DiagnosisCta>
          </article>
        </div>
      </div>
    </section>
  );
}
