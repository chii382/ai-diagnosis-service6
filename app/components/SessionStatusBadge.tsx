"use client";

import { useSession } from "next-auth/react";

export function SessionStatusBadge({ compact = false }: { compact?: boolean }) {
  const { data: session, status } = useSession();
  if (status !== "authenticated" || !session?.user) return null;

  const name = session.user.name?.trim() || "ユーザー";
  return (
    <span className={`session-status-badge${compact ? " is-compact" : ""}`} title={`${name}さん ログイン中`}>
      <strong className="session-status-name"><span>{name}</span></strong>
      <span className="session-status-label">さん　ログイン中</span>
    </span>
  );
}
