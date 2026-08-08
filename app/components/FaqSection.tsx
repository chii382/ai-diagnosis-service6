"use client";

import { useEffect, useRef, useState } from "react";

const faqs = [
  ["診断にはどれくらい時間がかかりますか？", "プロフィール入力とAIからの5つの質問への回答で、約3分で完了します。スマートフォンからでも手軽にご利用いただけます。"],
  ["AI診断はどのように分析するのですか？", "プロフィール情報と回答をもとに、AIが性格・価値観・思考傾向・強みなどを総合的に分析します。"],
  ["無料プランだけでも利用できますか？", "はい。無料プランではAIによる簡易診断や基本的な分析結果をご利用いただけます。"],
  ["有料プランでは何が追加されますか？", "より詳細な診断、性格・価値観分析、具体的な行動プラン、診断結果のPDF保存をご利用いただけます。"],
  ["このサービスはどんな人におすすめですか？", "自分に向いていることが分からない方、将来に不安がある方、新しい一歩を踏み出したい方におすすめです。"],
];

export function FaqSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`content-section faq-section${visible ? " is-visible" : ""}`} id="faq" aria-labelledby="faq-title">
      <div className="shell faq-shell">
        <h2 className="section-title" id="faq-title"><span />よくある質問<span /></h2>
        {faqs.map(([q, a]) => <details className="faq-item" key={q}><summary><b>Q.</b>{q}<span>＋</span></summary><p>{a}</p></details>)}
      </div>
    </section>
  );
}
