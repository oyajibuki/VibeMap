"use client";

import { useState } from "react";
import type { ScanResult } from "@/app/page";
import type { FileAnalysis } from "@/app/api/code-analyze/route";

interface Props {
  result: ScanResult;
  aiReport: string | null;
  aiLoading: boolean;
  aiError: string | null;
  onAiEvaluate: () => void;
  hasCoreFiles: boolean;
  codeAnalysis: FileAnalysis[] | null;
  codeAnalysisLoading: boolean;
  codeAnalysisError: string | null;
  onCodeAnalyze: () => void;
}

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-emerald-500" :
    score >= 6 ? "bg-blue-500" :
    score >= 4 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${score * 10}%` }} />
      </div>
      <span className="text-sm font-bold text-slate-300 w-8 text-right">{score}/10</span>
    </div>
  );
}

function MarkdownReport({ text }: { text: string }) {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];
  let currentTable: string[][] = [];

  const renderTable = (rows: string[][], key: number) => (
    <div key={key} className="my-4 overflow-x-auto border border-slate-700 rounded-lg">
      <table className="w-full text-xs text-left border-collapse">
        <thead className="bg-slate-800 text-slate-300">
          <tr>
            {rows[0].map((cell, i) => (
              <th key={i} className="p-2 border-b border-slate-700 font-bold">{cell.trim()}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.slice(1).filter(r => !r.every(c => c.trim().match(/^[:\s-]+$/))).map((row, i) => (
            <tr key={i} className="hover:bg-slate-900/50">
              {row.map((cell, j) => (
                <td key={j} className="p-2 text-slate-400 leading-normal">{cell.trim()}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Table detection
    if (line.startsWith("|") && line.endsWith("|")) {
      const cells = line.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1);
      currentTable.push(cells);
      if (i === lines.length - 1 || !lines[i+1].trim().startsWith("|")) {
        elements.push(renderTable(currentTable, i));
        currentTable = [];
      }
      continue;
    }

    if (line.startsWith("#### ")) {
      elements.push(<h4 key={i} className="text-sm font-bold text-blue-400 mt-4 mb-2">{line.replace("#### ", "")}</h4>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-bold text-slate-200 mt-5 mb-2">{line.replace("### ", "")}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold text-white mt-6 mb-3">{line.replace("## ", "")}</h2>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <div key={i} className="flex gap-2 my-1">
          <span className="text-blue-500 mt-0.5 shrink-0">•</span>
          <p className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line.replace(/^[-*]\s/, "")) }} />
        </div>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-slate-700 my-4" />);
    } else if (!line) {
      elements.push(<div key={i} className="h-1" />);
    } else {
      elements.push(<p key={i} className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />);
    }
  }

  return <div className="space-y-1">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="bg-slate-800 text-blue-300 px-1 rounded text-xs font-mono">$1</code>');
}

function CopyableCode({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <span className="text-xs text-slate-400 font-mono">{label}</span>
        <button
          onClick={copy}
          className={`text-xs px-3 py-1 rounded transition-all ${
            copied
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-500/50"
          }`}
        >
          {copied ? "✅ コピー済み" : "📋 コピー"}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-64 leading-relaxed bg-[#0a0f1e]">
        {code}
      </pre>
    </div>
  );
}

function ActionPrompts({ report }: { report: string }) {
  const [copied, setCopied] = useState<number | null>(null);
  
  const actionSection = report.split("### 🎯 次のアクション")[1] || "";
  const actions = actionSection
    .split("\n")
    .filter(line => line.match(/^(\d+\.|-|\*)/))
    .slice(0, 3);

  if (actions.length === 0) return null;

  const generatePrompt = (action: string) => {
    return `あなたはシニアエンジニアです。以下の指示を実行してください：
「${action.replace(/^(\d+\.|-|\*)\s*/, "")}」

【制約事項】
・絶対に不要なコードのみを慎重に削除してください。
・既存の機能を壊さないよう、差分を最小限に留めてください。
・修正後、何か問題があった場合に切り戻し（ロールバック）ができるよう、変更箇所を明確に記録してください。
・バイブコーダー向けに、どのファイルをどう変えたか分かりやすく説明してください。
・最後に、VibeDiffで変更内容が意図通りかチェックすることを推奨してください。`;
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mt-8 pt-6 border-t border-slate-800">
      <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
        <span className="text-purple-400">🚀</span> AIに次の指示を出す（プロンプト生成）
      </h4>
      <div className="space-y-3">
        {actions.map((action, i) => (
          <div key={i} className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-purple-300 font-semibold mb-1">アクション {i + 1}</p>
              <p className="text-sm text-slate-300">{action.replace(/^(\d+\.|-|\*)\s*/, "")}</p>
            </div>
            <button
              onClick={() => handleCopy(generatePrompt(action), i)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                copied === i
                  ? "bg-green-500 text-white"
                  : "bg-purple-600/20 text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white"
              }`}
            >
              {copied === i ? "✅ コピー完了" : "🤖 指示文をコピー"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FutureTree({ report, currentTree = "" }: { report: string; currentTree?: string }) {
  // パースロジックの強化: 正規表現で複数のキーワードに対応
  const extractSection = (text: string, keywords: string[]) => {
    for (const keyword of keywords) {
      const regex = new RegExp(`${keyword}[\\s\\S]*?(?=###|---|$|##)`, "i");
      const match = text.match(regex);
      if (match) {
        return match[0].replace(new RegExp(`^${keyword}`, "i"), "").trim();
      }
    }
    return "";
  };

  const futureTreeRaw = extractSection(report, [
    "### 🔮 未来のファイル構成",
    "### 未来のファイル構成",
    "### 🔮 理想的な構成",
    "### 理想的な構成",
    "### 🔮 未来のファイル構造",
    "### 未来のファイル構造",
    "未来の構成案"
  ]);

  const optimizationList = extractSection(report, [
    "### ✂️ 削除・最適化リスト",
    "### 削除・最適化リスト",
    "### ✂️ 最適化リスト",
    "### 最適化リスト",
    "### ✂️ 削除・整理リスト",
    "### 削除・整理リスト"
  ]);

  const [copied, setCopied] = useState(false);

  const handleCopyVibeDiff = () => {
    navigator.clipboard.writeText(optimizationList.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-4">
        <span className="text-2xl mt-1">⚠️</span>
        <div>
          <h4 className="text-sm font-bold text-amber-400">破壊的変更に関する注意</h4>
          <p className="text-xs text-slate-300 leading-relaxed mt-1">
            AIが提案する理想的な構成を適用するには、単なるファイル移動だけでなく、<strong>コード内のパス（import文やJinja2/FastAPIの設定など）の修正</strong>が必要です。<br />
            まずは VibeDiff で内容を1つずつ確認し、安全なものから段階的に実施することを強く推奨します。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 現状のツリー */}
        <div className="bg-[#050a14] border border-slate-800 rounded-xl overflow-hidden opacity-60 grayscale-[0.5] hover:grayscale-0 transition-all">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">📁 現状のファイル構成</span>
            <span className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">BEFORE</span>
          </div>
          <pre className="p-4 text-[10px] font-mono text-slate-500 overflow-x-auto leading-tight max-h-[400px]">
            {currentTree?.trim() || "ツリーデータがありません"}
          </pre>
        </div>

        {/* 未来のツリー */}
        <div className="bg-[#050a14] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="px-4 py-2 border-b border-cyan-500/20 bg-cyan-500/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">🔮 未来の構成（AI提案）</span>
            <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">AFTER</span>
          </div>
          <pre className="p-4 text-[10px] font-mono text-cyan-400 overflow-x-auto leading-tight max-h-[400px]">
            {futureTreeRaw || "AI解析結果から構成案が見つかりませんでした。もう一度実行してみてください。"}
          </pre>
        </div>
      </div>

      {optimizationList && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <span className="text-lg">✂️</span> 削除・最適化リスト
            </h4>
            <button
              onClick={handleCopyVibeDiff}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all font-medium ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600 hover:text-white"
              }`}
            >
              {copied ? "✅ コピー完了" : "📋 このリストで整理する"}
            </button>
          </div>
          <div className="text-xs text-slate-400 space-y-2">
            <MarkdownReport text={optimizationList} />
          </div>
          <p className="mt-4 text-[9px] text-slate-600 text-center italic">
            ※「このリストで整理する」ボタンを押してコピーし、AI（CursorやChatGPT）に渡すとスムーズに作業できます
          </p>
        </div>
      )}
    </div>
  );
}

function FileCard({ file }: { file: FileAnalysis }) {
  const [open, setOpen] = useState(true);
  const baseName = file.filename.split("/").pop() ?? file.filename;

  return (
    <div className="border border-slate-700/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/60 hover:bg-slate-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 text-base">📄</span>
          <div>
            <span className="font-mono text-sm font-semibold text-slate-200">{baseName}</span>
            {baseName !== file.filename && (
              <span className="text-xs text-slate-600 ml-2">{file.filename}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://oyajibuki.github.io/diff/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-700 px-2 py-0.5 rounded transition-colors"
          >
            VibeDiffでチェック
          </a>
          <span className={`text-slate-500 text-xs transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
        </div>
      </button>

      {open && (
        <div className="px-4 py-4 space-y-3 bg-[#0a0f1e]/50">
          <div>
            <span className="text-xs font-semibold text-cyan-500 uppercase tracking-wider">役割</span>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{file.role}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">主な処理</span>
            <ul className="mt-1 space-y-1">
              {file.keyPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-400">
                  <span className="text-blue-500 mt-0.5 shrink-0">→</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

type TabId = "similar" | "generated" | "code" | "ai";

export default function ResultsPanel({
  result,
  aiReport,
  aiLoading,
  aiError,
  onAiEvaluate,
  hasCoreFiles,
  codeAnalysis,
  codeAnalysisLoading,
  codeAnalysisError,
  onCodeAnalyze,
}: Props) {
  const { analysis, pattern } = result;
  const [activeTab, setActiveTab] = useState<TabId>("similar");
  const [aiTab, setAiTab] = useState<"report" | "future">("report");

  const hasGenerated = !!(analysis.generatedPackageJson || analysis.generatedRequirements || analysis.generatedSetupNotes);
  const isIos = !!(analysis.generatedSetupNotes);

  const tabs: Array<{ id: TabId; label: string; show: boolean }> = [
    { id: "similar", label: "🔗 類似サービス", show: true },
    { id: "generated", label: isIos ? "🍎 セットアップメモ" : "📦 自動生成ファイル", show: hasGenerated },
    { id: "code", label: "🔍 コード解析", show: hasCoreFiles },
    { id: "ai", label: "🤖 AI深層評価", show: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-blue-400">📋</span> 構成パターン
          </h3>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
            <p className="text-blue-300 font-semibold text-sm">{pattern.patternName}</p>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-1">スケーラビリティ</span>
            <ScoreBar score={pattern.scalabilityScore} />
          </div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <span className="text-green-400">✅</span> この構成の強み
          </h3>
          <ul className="space-y-2">
            {pattern.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-green-500 mt-0.5 shrink-0">•</span>{s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
          <h3 className="font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <span className="text-amber-400">⚠️</span> 注意点
          </h3>
          <ul className="space-y-2">
            {pattern.considerations.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-amber-500 mt-0.5 shrink-0">•</span>{c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="lg:col-span-2 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex border-b border-slate-800 overflow-x-auto">
          {tabs.filter(t => t.show).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 py-3 px-3 text-xs sm:text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? tab.id === "ai"
                    ? "text-purple-400 border-b-2 border-purple-500 bg-purple-500/5"
                    : tab.id === "code"
                    ? "text-cyan-400 border-b-2 border-cyan-500 bg-cyan-500/5"
                    : tab.id === "generated"
                    ? "text-green-400 border-b-2 border-green-500 bg-green-500/5"
                    : "text-blue-400 border-b-2 border-blue-500 bg-blue-500/5"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "similar" && (
            <div className="space-y-3 animate-fade-in-up">
              <p className="text-xs text-slate-500 mb-4">
                あなたの構成と類似したアーキテクチャを持つサービス・アプリ一覧です。
              </p>
              {pattern.similarServices.map((service, i) => (
                <div
                  key={i}
                  className={`border rounded-xl p-4 transition-all hover:scale-[1.01] ${
                    service.isYourApp
                      ? "border-blue-700/60 bg-blue-500/5 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-200 text-sm">{service.name}</span>
                        {service.isYourApp && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs border border-blue-500/30">
                            ✨ あなたのアプリ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "generated" && (
            <div className="space-y-4 animate-fade-in-up">
              {analysis.generatedSetupNotes && (
                <CopyableCode code={analysis.generatedSetupNotes} label="SETUP.md" />
              )}
              {analysis.generatedPackageJson && (
                <CopyableCode code={analysis.generatedPackageJson} label="package.json" />
              )}
              {analysis.generatedRequirements && (
                <CopyableCode code={analysis.generatedRequirements} label="requirements.txt" />
              )}
            </div>
          )}

          {activeTab === "code" && (
            <div className="animate-fade-in-up">
              {!codeAnalysis && !codeAnalysisLoading && (
                <div className="text-center py-8">
                  <button
                    onClick={onCodeAnalyze}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl"
                  >
                    🔍 コード解析を実行する
                  </button>
                </div>
              )}
              {codeAnalysisLoading && (
                <div className="flex flex-col items-center py-12">
                  <p className="text-cyan-400 font-semibold mb-2">コード解析中...</p>
                  <p className="text-slate-500 text-sm">ファイルの内容をAIが読み込んでいます</p>
                </div>
              )}
              {codeAnalysisError && (
                <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl text-sm text-blue-400 text-left max-w-sm mx-auto shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <p className="font-bold">AIが少し混み合っています</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {codeAnalysisError.includes("429") || codeAnalysisError.includes("quota")
                      ? "無料枠のリクエスト上限に達しました。数分〜数時間待ってから再度お試しください。AI Studioでプランを確認することもできます。"
                      : "リクエストが集中しているため、処理を完了できませんでした。再度ボタンを押してください。"}
                  </p>
                </div>
              )}
              {codeAnalysis && (
                <div className="space-y-3">
                  {codeAnalysis.map((file, i) => (
                    <FileCard key={i} file={file} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "ai" && (
            <div className="animate-fade-in-up">
              {!aiReport && !aiLoading && (
                <div className="text-center py-8">
                  <button
                    onClick={onAiEvaluate}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl"
                  >
                    🤖 AI評価を実行する
                  </button>
                </div>
              )}
              {aiLoading && (
                <div className="flex flex-col items-center py-12">
                  <p className="text-purple-400 font-semibold mb-2">AI診断中...</p>
                  <p className="text-slate-500 text-sm">シニアアーキテクト視点で解析しています</p>
                </div>
              )}
              {aiError && (
                <div className="mb-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl text-sm text-purple-400 text-left shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🤖</span>
                    <p className="font-bold">AI評価でエラーが発生しました</p>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    {aiError.includes("429") || aiError.includes("quota")
                      ? "Gemini API のクォータ制限（回数制限）にかかっています。無料枠の上限に達した可能性があるため、しばらく待ってから再度お試しください。"
                      : aiError}
                  </p>
                </div>
              )}
              {aiReport && (
                <div>
                  <div className="flex gap-4 mb-6 border-b border-slate-800">
                    <button
                      onClick={() => setAiTab("report")}
                      className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                        aiTab === "report" ? "border-purple-500 text-purple-400" : "border-transparent text-slate-500"
                      }`}
                    >
                      📄 診断レポート
                    </button>
                    <button
                      onClick={() => setAiTab("future")}
                      className={`pb-2 text-sm font-bold transition-all border-b-2 ${
                        aiTab === "future" ? "border-cyan-500 text-cyan-400" : "border-transparent text-slate-500"
                      }`}
                    >
                      🔮 未来の構成案
                    </button>
                  </div>
                  {aiTab === "report" ? (
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800/50">
                      <MarkdownReport text={aiReport} />
                      <ActionPrompts report={aiReport} />
                    </div>
                  ) : (
                    <FutureTree report={aiReport} currentTree={result.fileTree} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
