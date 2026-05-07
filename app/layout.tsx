import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeMap — アーキテクチャ可視化ツール",
  description: "プロジェクトのフォルダ構造と依存関係を解析して、システム全体のアーキテクチャ図を自動生成します。",
  keywords: ["architecture", "visualization", "tech stack", "diagram", "vibe coding"],
  openGraph: {
    title: "VibeMap",
    description: "コードを読み込むだけでアーキテクチャ図を自動生成",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[#0a0f1e] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
