import { DiagnosisCta } from "./DiagnosisCta";

export function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="moon" aria-hidden="true" />
      <div className="crystal crystal-left" aria-hidden="true" />
      <div className="crystal crystal-right" aria-hidden="true" />
      <div className="portal" aria-hidden="true"><span /></div>
      <div className="sparkle-field" aria-hidden="true">
        {Array.from({ length: 36 }, (_, index) => <i key={index} />)}
      </div>
      <div className="hero-content shell">
        <p className="eyebrow">AI SELF DISCOVERY</p>
        <h1><span>AI自分探し</span><span className="mobile-title-line">サービス</span></h1>
        <div className="gold-divider"><span>✦</span></div>
        <p className="hero-catch">AIからの5問に答えるだけ。<br />本当の自分、知ってみませんか？</p>
        <p className="hero-copy">わずか3分。あなたの性格、価値観、才能、迷いをAIが分析し、<br className="desktop-only" />「今、本当に進むべき道」と「明日から踏み出せる一歩」を提案します。</p>
        <div className="hero-actions">
          <DiagnosisCta variant="light">無料で少しずつ始めてみる</DiagnosisCta>
          <DiagnosisCta variant="primary" paid>思い切って本当の自分と向き合ってみる</DiagnosisCta>
        </div>
      </div>
    </section>
  );
}
