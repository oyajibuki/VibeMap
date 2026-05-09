"use client";

import { useState } from "react";
import FolderScanner from "@/components/FolderScanner";
import ArchDiagram from "@/components/ArchDiagram";
import ResultsPanel from "@/components/ResultsPanel";
import ApiKeySettings, { getGeminiApiKey } from "@/components/ApiKeySettings";
import type { AnalysisResult, AnalysisData } from "@/lib/analyzer";
import type { PatternMatch } from "@/lib/patterns";
import type { FileAnalysis } from "@/app/api/code-analyze/route";

const DEMO_CODE_ANALYSIS: FileAnalysis[] = [
  {
    filename: "src/App.jsx",
    role: "アプリケーションのメインコンポーネント。画面の状態管理とルーティングを担う中心的なファイルです。",
    keyPoints: [
      "useStateでユーザー認証状態・ページ遷移を管理",
      "Supabaseクライアントを初期化してデータを取得",
      "Stripeの課金フローをトリガーするCTAを実装",
      "lucide-reactでアイコンを配置したナビゲーションを構成",
    ],
  },
  {
    filename: "vite.config.js",
    role: "Viteビルドツールの設定ファイル。Reactプラグインを有効化し、開発サーバーと本番ビルドを制御します。",
    keyPoints: [
      "@vitejs/plugin-reactでJSX変換を設定",
      "Hot Module Replacement（HMR）を自動で有効化",
      "本番ビルド時のコード最適化を定義",
    ],
  },
  {
    filename: "tailwind.config.js",
    role: "Tailwind CSSのカスタマイズ設定。スキャン対象パスとテーマ拡張を定義します。",
    keyPoints: [
      "content: ['./src/**/*.{js,jsx}'] でスキャン範囲を限定",
      "テーマ拡張でカスタムカラー・フォントを追加可能",
    ],
  },
];

const DEMO_AI_REPORT = `## ✅ 構成の安全性評価（アーキテクチャ・レビュー）

### 正しい判断（高く評価できる点）
- **モダンな技術選定**: Vite + React + Tailwind CSS + Supabase + Stripe の組み合わせは現在のSaaS開発のベストプラクティスです。
- **ミニマリズムの維持**: 不要な抽象化レイヤーが導入されておらず、コードの追いやすさが担保されています。

### 具体的リスク
- **単一ファイル集中**: src/ 直下にすべてのロジックが集中しています。機能追加とともに App.jsx が肥大化するリスクがあります。
- **環境変数の管理**: Supabase・Stripeのキーを .env.local で管理しているか確認が必要です。

---

## 📊 実施順序・リスク管理テーブル

| 優先度 | 作業内容 | 難易度 | リスク | 理由・注意点 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | .env.local の作成と環境変数整理 | 低 | 低 | APIキーのハードコードを防ぐ |
| 2 | src/hooks/ にカスタムフックを分離 | 中 | 低 | App.jsx の肥大化を防ぐ |
| 3 | src/components/ にUI分割 | 中 | 中 | importパスの修正が発生 |

---

## 🛠️ 推奨アクション：2フェーズ・ロードマップ

#### Phase 1：今すぐ安全にできる（リスク低）
- .env.local ファイルを作成し、Supabase URL / Stripe Key を移行
- README.md にセットアップ手順を記載
- 不要ファイルの削除

#### Phase 2：コーディングとビルド確認が必要（リスク中〜高）
- src/hooks/useAuth.js を作成し認証ロジックを分離
- src/components/ フォルダを作成しUIを分割
- Vite の path alias（@/）を設定してimportパスを整理

---

## 🔮 未来の構成案（詳細解説付き）

\`\`\`
my-saas-app/
├── .env.local              （要作成: APIキー管理）
├── vite.config.js
├── tailwind.config.js
├── src/
│   ├── App.jsx             （ルーティングのみに簡素化）
│   ├── components/         （要作成: UIコンポーネント分割）
│   │   ├── Header.jsx
│   │   └── PricingCard.jsx
│   ├── hooks/              （要作成: カスタムフック分離）
│   │   └── useAuth.js
│   └── lib/
│       └── supabase.js     （要作成: クライアント初期化）
└── index.html
\`\`\`

---

## 📚 技術の深掘り解説

- **Vite**: 従来のwebpackより高速な開発サーバー。HMRで変更が即座に反映されます。
- **Supabase**: PostgreSQLベースのBaaSで、認証・DB・ストレージを提供。Firebase代替として人気。
- **Stripe**: 決済処理のデファクトスタンダード。Webhookでサーバーレスな課金フローを構築できます。`;

type Step = "input" | "analyzing" | "results";

export interface ScanResult {
  analysis: AnalysisResult;
  pattern: PatternMatch;
  projectName: string;
  fileTree: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [coreFileContents, setCoreFileContents] = useState<Record<string, string> | null>(null);
  const [codeAnalysis, setCodeAnalysis] = useState<FileAnalysis[] | null>(null);
  const [codeAnalysisLoading, setCodeAnalysisLoading] = useState(false);
  const [codeAnalysisError, setCodeAnalysisError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const handleScanStart = async (data: AnalysisData) => {
    setStep("analyzing");
    setResult(null);
    setAiReport(null);
    setCodeAnalysis(null);
    setCodeAnalysisError(null);
    setIsDemo(data.isDemo ?? false);

    if (data.coreFileContents && Object.keys(data.coreFileContents).length > 0) {
      setCoreFileContents(data.coreFileContents);
    } else {
      setCoreFileContents(null);
    }

    // デモモード: サンプルデータを自動セット
    if (data.isDemo) {
      setCodeAnalysis(DEMO_CODE_ANALYSIS);
      setAiReport(DEMO_AI_REPORT);
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const json = await res.json();
      setResult(json);
      setStep("results");
    } catch {
      setStep("input");
      alert("解析に失敗しました。もう一度お試しください。");
    }
  };

  const handleAiEvaluate = async () => {
    if (!result) return;
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      alert("AIレポートを使うにはGemini APIキーを設定してください（ヘッダーの🔑ボタン）");
      return;
    }
    setAiLoading(true);
    setAiError(null);

    try {
      const res = await fetch("/api/ai-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Gemini-Api-Key": apiKey },
        body: JSON.stringify({
          analysis: result.analysis,
          pattern: result.pattern,
          projectName: result.projectName,
          fileTree: result.fileTree,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "AI評価に失敗しました");
      }

      const json = await res.json();
      setAiReport(json.report);
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : "AI評価でエラーが発生しました");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCodeAnalyze = async () => {
    if (!coreFileContents || !result) return;
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      alert("コード解析を使うにはGemini APIキーを設定してください（ヘッダーの🔑ボタン）");
      return;
    }
    setCodeAnalysisLoading(true);
    setCodeAnalysisError(null);

    try {
      const res = await fetch("/api/code-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Gemini-Api-Key": apiKey },
        body: JSON.stringify({
          coreFileContents,
          projectName: result.projectName,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "コード解析に失敗しました");
      }

      const json = await res.json();
      setCodeAnalysis(json.analyses);
    } catch (e: unknown) {
      setCodeAnalysisError(e instanceof Error ? e.message : "コード解析でエラーが発生しました");
    } finally {
      setCodeAnalysisLoading(false);
    }
  };

  const handleReset = () => {
    setStep("input");
    setResult(null);
    setAiReport(null);
    setAiError(null);
    setCoreFileContents(null);
    setCodeAnalysis(null);
    setCodeAnalysisError(null);
    setIsDemo(false);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <header className="border-b border-blue-900/40 bg-[#0a0f1e]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" fill="currentColor" opacity="0.9"/>
                <circle cx="5" cy="19" r="2" fill="currentColor" opacity="0.75"/>
                <circle cx="19" cy="19" r="2" fill="currentColor" opacity="0.75"/>
                <circle cx="12" cy="13" r="1.5" fill="currentColor" opacity="0.6"/>
                <line x1="12" y1="7" x2="5.8" y2="17.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="12" y1="7" x2="18.2" y2="17.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="6.8" y1="19" x2="17.2" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="12" y1="7" x2="12" y2="11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-400 tracking-wider">VibeMap</h1>
              <p className="text-xs text-slate-500">Architecture Visualizer</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <StepDot active={step === "input"} done={step !== "input"} label="① スキャン" />
              <div className="w-8 h-px bg-slate-700" />
              <StepDot active={step === "analyzing"} done={step === "results"} label="② 解析" />
              <div className="w-8 h-px bg-slate-700" />
              <StepDot active={step === "results"} done={false} label="③ 結果" />
            </div>

            <ApiKeySettings />

            {step === "results" && (
              <button
                onClick={handleReset}
                className="text-xs text-slate-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded border border-slate-700 hover:border-blue-500"
              >
                ← 新しいスキャン
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* STEP 1: Input */}
        {step === "input" && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                バイブコーダー向けアーキテクチャ可視化ツール
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                コードを読み込むだけで<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  アーキテクチャ図を自動生成
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                フォルダを選択するか、ファイルツリーをペースト。
                技術スタックを自動検出して構成図を描画します。
              </p>
            </div>

            <FolderScanner onScan={handleScanStart} />

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  icon: (
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                  title: "自動スタック検出",
                  desc: "import文からSwift/JS/Pythonの依存関係を自動解析",
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="5" r="2" strokeWidth={1.5}/>
                      <circle cx="5" cy="19" r="2" strokeWidth={1.5}/>
                      <circle cx="19" cy="19" r="2" strokeWidth={1.5}/>
                      <line x1="12" y1="7" x2="6" y2="17" strokeWidth={1.5} strokeLinecap="round"/>
                      <line x1="12" y1="7" x2="18" y2="17" strokeWidth={1.5} strokeLinecap="round"/>
                      <line x1="7" y1="19" x2="17" y2="19" strokeWidth={1.5} strokeLinecap="round"/>
                    </svg>
                  ),
                  title: "アーキテクチャ図",
                  desc: "フロントエンド・バックエンド・DBの構成を視覚化",
                },
                {
                  icon: (
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                  title: "AIコード解析",
                  desc: "各ファイルの役割・処理をAIがわかりやすく解説",
                },
              ].map((f) => (
                <div key={f.title} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 hover:border-blue-900 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-slate-200 mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Analyzing */}
        {step === "analyzing" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
              <div className="absolute inset-4 rounded-full border-2 border-blue-500/40 animate-ping" style={{ animationDelay: "0.3s" }} />
              <div className="absolute inset-8 rounded-full border-2 border-blue-500/60 animate-ping" style={{ animationDelay: "0.6s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">解析中...</h3>
            <p className="text-slate-400 text-sm mb-6">ファイル構造をローカルで読み込んでいます</p>
            <div className="flex gap-2 dot-bounce">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            </div>
            <div className="mt-8 font-mono text-xs text-slate-600 space-y-1 text-left w-full max-w-sm">
              {["フォルダ構造を読み込み中...", "依存関係を検出中...", "パターンデータベースと照合中...", "アーキテクチャ図を生成中..."].map((msg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-blue-500">▶</span>
                  <span style={{ animationDelay: `${i * 0.5}s` }} className="animate-pulse">{msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Results */}
        {step === "results" && result && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-[#0f172a] border border-blue-900/50 rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-white">{result.projectName}</h2>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs border border-green-500/30">
                    解析完了
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{result.analysis.projectTypeLabel}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{result.analysis.confidence}%</div>
                <div className="text-xs text-slate-500">信頼度</div>
              </div>
            </div>

            <ArchDiagram result={result.analysis} />

            <ResultsPanel
              result={result}
              aiReport={aiReport}
              aiLoading={aiLoading}
              aiError={aiError}
              onAiEvaluate={handleAiEvaluate}
              hasCoreFiles={!!(coreFileContents && Object.keys(coreFileContents).length > 0) || isDemo}
              codeAnalysis={codeAnalysis}
              codeAnalysisLoading={codeAnalysisLoading}
              codeAnalysisError={codeAnalysisError}
              onCodeAnalyze={handleCodeAnalyze}
              coreFileContents={coreFileContents ?? undefined}
              isDemo={isDemo}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/50 mt-16 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-600">
          VibeMap — Built for Vibe Coders &nbsp;·&nbsp; アーキテクチャを理解して、より良いものを作ろう
        </div>
      </footer>
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full transition-colors ${
        active ? "bg-blue-400 animate-pulse" :
        done ? "bg-green-500" :
        "bg-slate-700"
      }`} />
      <span className={active ? "text-blue-400" : done ? "text-green-500" : "text-slate-600"}>
        {label}
      </span>
    </div>
  );
}
