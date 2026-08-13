import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type InteriorShellProps = {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description?: string;
  wide?: boolean;
  actions?: ReactNode;
  variant?: "default" | "login" | "dashboard";
};

export function InteriorShell({ children, eyebrow, title, description, wide = false, actions, variant = "default" }: InteriorShellProps) {
  return (
    <div className={`interior-page interior-page--${variant}`}>
      <header className="interior-header">
        <Link className="brand" href="/?skipOpening=1#top" prefetch={false} aria-label="AI自分探しサービス LPトップへ">
          <Image className="brand-emblem" src="/images/brand-emblem-gold.png" alt="" width={64} height={64} priority />
          <span><strong>AI自分探し</strong><small>サービス</small></span>
        </Link>
        <div className="interior-header-actions">{actions}<Link href="/?skipOpening=1#top" prefetch={false}>トップへ</Link></div>
      </header>
      <main id="main-content" className={`interior-main${wide ? " is-wide" : ""}`}>
        <div className="interior-heading">
          <p className="interior-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
      </main>
      <footer className="interior-footer"><small>© 2026 AI自分探しサービス</small></footer>
    </div>
  );
}
