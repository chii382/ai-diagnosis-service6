"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <html lang="ja"><body><main style={{ maxWidth: 640, margin: "80px auto", padding: 24, fontFamily: "sans-serif" }}><h1>問題が発生しました</h1><p>エラーを記録しました。時間をおいてもう一度お試しください。</p><button onClick={() => location.reload()}>再読み込み</button></main></body></html>;
}
