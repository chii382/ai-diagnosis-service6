"use client";

import { useEffect, useState } from "react";

export function IntroGate() {
  const [visible, setVisible] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(false);
      return;
    }
    document.body.classList.add("gate-active");
    const openTimer = window.setTimeout(() => setOpening(true), 450);
    const closeTimer = window.setTimeout(() => setVisible(false), 3350);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(closeTimer);
      document.body.classList.remove("gate-active");
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.classList.remove("gate-active");
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={opening ? "intro-gate is-opening" : "intro-gate"} aria-label="扉が開いてサービス画面を表示しています">
      <div className="gate-stars" aria-hidden="true" />
      <div className="gate-radiance" aria-hidden="true" />
      <div className="gate-stage" aria-hidden="true">
        <div className="gate-door gate-door-left" />
        <div className="gate-door gate-door-right" />
        <div className="gate-seam" />
      </div>
      <p className="gate-message">本当の自分へ続く扉を、開きます。</p>
      <button type="button" className="gate-skip" onClick={() => setVisible(false)}>スキップ</button>
    </div>
  );
}
