import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { GlobalBusyIndicator } from "./components/GlobalBusyIndicator";

export const metadata: Metadata = {
  title: "AI自分探しサービス | 5問で見つかる、本当の自分",
  description: "AIからの5問に答えるだけ。性格・価値観・才能を分析し、明日から踏み出せる一歩を提案します。",
  openGraph: {
    title: "AI自分探しサービス",
    description: "わずか3分。AIが本当のあなたと、明日からの一歩を提案します。",
    type: "website",
    locale: "ja_JP",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#102c68" };

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <a href="#main-content" className="skip-link">本文へ移動</a>
        <Providers><GlobalBusyIndicator />{children}</Providers>
      </body>
    </html>
  );
}
