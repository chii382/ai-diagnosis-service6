"use client";

import { useEffect, useRef, useState } from "react";
import { IntroGate } from "./IntroGate";

const prologue = `あなたは今の自分が、好きですか。
本当の自分、知っていますか。

今の自分に自信が持てない。
この先の自分に、なんとなく不安を感じる……

その気持ち、誰にも言えずに一人で抱えているのなら…

——その扉、そっと開けてみませんか。`;

export function OpeningSequence() {
  const [phase, setPhase] = useState<"checking" | "story" | "gate" | "done">("checking");
  const [characterCount, setCharacterCount] = useState(0);
  const openingDecisionMade = useRef(false);

  useEffect(() => {
    if (openingDecisionMade.current) return;
    openingDecisionMade.current = true;
    const url = new URL(window.location.href);
    if (url.searchParams.get("skipOpening") === "1") {
      url.searchParams.delete("skipOpening");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash || "#top"}`);
      setPhase("done");
      window.requestAnimationFrame(() => document.getElementById("top")?.scrollIntoView({ block: "start" }));
      return;
    }
    setPhase("story");
  }, []);

  useEffect(() => {
    if (phase !== "story") return;
    document.body.classList.add("gate-active");
    return () => document.body.classList.remove("gate-active");
  }, [phase]);

  useEffect(() => {
    if (phase !== "story") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setCharacterCount(prologue.length);
      const reducedTimer = window.setTimeout(() => setPhase("gate"), 2800);
      return () => window.clearTimeout(reducedTimer);
    }

    if (characterCount >= prologue.length) {
      const finishTimer = window.setTimeout(() => setPhase("gate"), 2200);
      return () => window.clearTimeout(finishTimer);
    }

    const nextCharacter = prologue[characterCount];
    const delay = nextCharacter === "\n" ? 210 : /[。？…]/.test(nextCharacter) ? 170 : 54;
    const typeTimer = window.setTimeout(() => setCharacterCount((count) => count + 1), delay);
    return () => window.clearTimeout(typeTimer);
  }, [characterCount, phase]);

  if (phase === "gate") return <IntroGate />;
  if (phase === "checking" || phase === "done") return null;

  return (
    <section className="opening-story" aria-label={prologue}>
      <div className="opening-story-vignette" aria-hidden="true" />
      <div className="opening-story-stars" aria-hidden="true" />
      <div className="opening-story-copy" aria-hidden="true">
        <p>{prologue.slice(0, characterCount)}<span className="typewriter-cursor" /></p>
      </div>
      <button type="button" className="opening-skip" onClick={() => setPhase("gate")}>扉へ進む</button>
    </section>
  );
}
