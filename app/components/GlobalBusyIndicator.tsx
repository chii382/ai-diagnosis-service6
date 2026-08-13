"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const BUSY_START_EVENT = "sanctuary:busy-start";
export const BUSY_END_EVENT = "sanctuary:busy-end";

export function setGlobalBusy(busy: boolean) {
  window.dispatchEvent(new Event(busy ? BUSY_START_EVENT : BUSY_END_EVENT));
}

export function GlobalBusyIndicator() {
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      setBusy(true);
      document.documentElement.dataset.busy = "true";
      clearTimeout(safetyTimer);
      safetyTimer = setTimeout(end, 20000);
    };
    const end = () => {
      setBusy(false);
      delete document.documentElement.dataset.busy;
      clearTimeout(safetyTimer);
    };
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const target = new URL(anchor.href, window.location.href);
      const sameDocumentAnchor = target.pathname === location.pathname && target.search === location.search && target.hash;
      const sameLocation = target.href === window.location.href;
      if (target.origin === location.origin && !sameDocumentAnchor && !sameLocation) start();
    };
    const onSubmit = () => start();
    const onPointerMove = (event: PointerEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };

    window.addEventListener(BUSY_START_EVENT, start);
    window.addEventListener(BUSY_END_EVENT, end);
    document.addEventListener("click", onClick, true);
    document.addEventListener("submit", onSubmit, true);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pageshow", end);
    return () => {
      clearTimeout(safetyTimer);
      delete document.documentElement.dataset.busy;
      window.removeEventListener(BUSY_START_EVENT, start);
      window.removeEventListener(BUSY_END_EVENT, end);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("submit", onSubmit, true);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pageshow", end);
    };
  }, []);

  useEffect(() => {
    setBusy(false);
    delete document.documentElement.dataset.busy;
  }, [pathname]);

  return (
    <>
      <div ref={cursorRef} className={`crystal-wait-cursor${busy ? " is-visible" : ""}`} aria-hidden="true">
        <span className="crystal-wait-gem" />
        <span className="crystal-wait-orbit" />
      </div>
      <div className="sr-only" role="status" aria-live="polite">{busy ? "処理中です。しばらくお待ちください。" : ""}</div>
    </>
  );
}
