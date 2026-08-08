"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const steps = [
  { number: "Step 1", icon: "/images/medallion-question.png", title: "質問に回答", text: "AIからの5つの質問に、直感で答えるだけ。所要時間は約3分です。" },
  { number: "Step 2", icon: "/images/medallion-ai-analysis.png", title: "AI分析", text: "性格・価値観・才能・迷いを多角的に分析し、特徴を明らかにします。" },
  { number: "Step 3", icon: "/images/medallion-result-report.png", title: "結果表示", text: "分析結果と、あなただけの行動プランを分かりやすくお届けします。" },
];

export function HowItWorksSection() {
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
    <section ref={sectionRef} className={`content-section flow-section${visible ? " is-visible" : ""}`} id="flow" aria-labelledby="flow-title">
      <div className="shell flow-inner">
        <h2 className="section-title" id="flow-title"><span />ご利用の流れ<span /></h2>
        <div className="step-grid">
          {steps.map((step, index) => (
            <article className="glass-card step-card" key={step.number}>
              <Image className="medallion-image" src={step.icon} alt="" width={512} height={512} aria-hidden="true" />
              <div><small>{step.number}</small><h3>{step.title}</h3><p>{step.text}</p></div>
              {index < 2 && <b className="step-arrow" aria-hidden="true">›</b>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
