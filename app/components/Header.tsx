"use client";

import { useState } from "react";
import Image from "next/image";

const links = [
  ["特徴", "#features"],
  ["ご利用の流れ", "#flow"],
  ["料金プラン", "#pricing"],
  ["よくある質問", "#faq"],
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="AI自分探しサービス トップへ">
        <Image className="brand-emblem" src="/images/brand-emblem-gold.png" alt="" width={1024} height={1024} priority aria-hidden="true" />
        <span><strong>AI自分探し</strong><small>サービス</small></span>
      </a>
      <nav className={open ? "nav is-open" : "nav"} aria-label="メインナビゲーション">
        {links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
        <a className="nav-login" href="#pricing" onClick={() => setOpen(false)}>診断を始める</a>
      </nav>
      <button className="menu-button" type="button" aria-label="メニューを開閉" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>
    </header>
  );
}
