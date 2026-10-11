import { DiagnosisCta } from "./DiagnosisCta";
import { HeroPurchaseCta } from "./HeroPurchaseCta";

export function BottomCtaSection() {
  return (
    <section id="final-cta" className="bottom-cta">
      <div className="lotus" aria-hidden="true">◇</div>
      <div><h2><span>たった3分で、</span><span>未来が変わる</span><span>きっかけを。</span></h2><p>あなたの本当の自分と、出会ってみませんか？</p>
        <div className="bottom-actions"><DiagnosisCta variant="light">無料で少しずつ始めてみる</DiagnosisCta><HeroPurchaseCta /></div>
      </div>
    </section>
  );
}
