"use client";

import { useSession } from "next-auth/react";

export function SessionStatusBadge({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session?.user) return null;

  const name = session.user.name?.trim() || "ユーザー";
  return (
    <span className={`session-status-badge${compact ? " is-compact" : ""}`} title={`${name}（${session.user.email ?? "メール未設定"}）でログイン中`}>
      <small className="session-status-label">ログイン中</small>
      <span className="session-status-avatar" aria-hidden="true">
        {session.user.image ? <img src={session.user.image} alt="" referrerPolicy="no-referrer" /> : name.slice(0, 1).toUpperCase()}
        <span className="session-status-dot" />
      </span>
      <strong className="session-status-name">{name}</strong>
      {!compact && session.user.email && <span className="session-status-email">{session.user.email}</span>}
    </span>
  );
}
