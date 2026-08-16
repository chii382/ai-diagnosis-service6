import { DiagnosisCta } from "./DiagnosisCta";

export function BottomCtaSection() {
  return (
    <section id="final-cta" className="bottom-cta">
      <div className="lotus" aria-hidden="true">◇</div>
      <div><h2>たった3分で、未来が変わるきっかけを。</h2><p>あなたの本当の自分と、出会ってみませんか？</p>
        <div className="bottom-actions"><DiagnosisCta variant="light">無料で少しずつ始めてみる</DiagnosisCta><DiagnosisCta variant="primary" paid>思い切って本当の自分と向き合ってみる</DiagnosisCta></div>
      </div>
    </section>
  );
}
