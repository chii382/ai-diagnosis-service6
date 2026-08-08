"use client";

import { useEffect } from "react";

export function ClickRipple() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const createRipple = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      const ripple = document.createElement("span");
      ripple.className = "screen-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      ripple.setAttribute("aria-hidden", "true");
      document.body.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    };

    window.addEventListener("pointerdown", createRipple, { passive: true });
    return () => window.removeEventListener("pointerdown", createRipple);
  }, []);

  return null;
}
