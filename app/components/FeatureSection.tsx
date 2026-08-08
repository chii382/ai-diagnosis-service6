"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const features = [
  { icon: "/images/medallion-clock.png", title: "たった5問・3分で完了", text: "短時間で完了するから、忙しいあなたでも気軽に始められます。" },
  { icon: "/images/medallion-ai-profile.png", title: "AIが本当のあなたを分析", text: "性格・価値観・才能・迷いを多角的に分析し、あなたらしさを可視化します。" },
  { icon: "/images/medallion-action-steps.png", title: "明日から踏み出す行動プラン", text: "今できることを、あなたに最適な具体的な一歩としてお届けします。" },
];

export function FeatureSection() {
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
    }, { threshold: 0.22 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`content-section features-section${visible ? " is-visible" : ""}`} id="features" aria-labelledby="features-title">
      <div className="shell features-inner">
        <h2 className="section-title features-title" id="features-title"><span />特徴<span /></h2>
        <div className="feature-grid">
          {features.map((item) => (
            <article className="glass-card feature-card" key={item.title}>
              <Image className="medallion-image" src={item.icon} alt="" width={512} height={512} aria-hidden="true" />
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
