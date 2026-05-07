"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { readFilesFromInput, parseTreeText, type AnalysisData } from "@/lib/analyzer";

interface Props {
  onScan: (data: AnalysisData) => void;
}

type InputMode = "folder" | "text";

const DEMO_PACKAGE_JSON = {
  name: "my-saas-app",
  dependencies: {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.45.0",
    "stripe": "^16.0.0",
    "lucide-react": "^0.441.0",
  },
  devDependencies: {
    "vite": "^5.4.8",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.13",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
  },
};

const DEMO_CORE_FILES = {
  "vite.config.js": `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })`,
  "src/App.jsx": `import React from 'react'
import { createClient } from '@supabase/supabase-js'
import { loadStripe } from '@stripe/stripe-js'
import { Home, Settings } from 'lucide-react'`,
  "tailwind.config.js": `module.exports = { content: ['./src/**/*.{js,jsx}'], theme: {} }`,
};

export default function FolderScanner({ onScan }: Props) {
  const [mode, setMode] = useState<InputMode>("folder");
  const [isDragging, setIsDragging] = useState(false);
  const [treeText, setTreeText] = useState("");
  const [packageJsonText, setPackageJsonText] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fileCount, setFileCount] = useState(0);
  const [coreFilesFound, setCoreFilesFound] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [pendingData, setPendingData] = useState<AnalysisData | null>(null);
  const [treeCopied, setTreeCopied] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const folderInputRef = useRef<HTMLInputElement>(null);

  const triggerScan = useCallback((data: AnalysisData) => {
    onScan(data);
  }, [onScan]);

  const handleFolderChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsReading(true);
    try {
      const data = await readFilesFromInput(files);
      setPendingData(data);
      const cores = Object.keys(data.coreFileContents || {}).slice(0, 8);
      setCoreFilesFound(cores);
      setReady(true);
    } finally {
      setIsReading(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const items = e.dataTransfer.items;
    if (!items) return;

    const files: File[] = [];

    const collectFiles = async (entry: FileSystemEntry, path = ""): Promise<void> => {
      if (entry.isFile) {
        await new Promise<void>((resolve) => {
          (entry as FileSystemFileEntry).file((file) => {
            Object.defineProperty(file, "webkitRelativePath", {
              value: path + file.name,
              configurable: true,
            });
            files.push(file);
            resolve();
          });
        });
      } else if (entry.isDirectory) {
        await new Promise<void>((resolve) => {
          const reader = (entry as FileSystemDirectoryEntry).createReader();
          const readAll = (acc: FileSystemEntry[] = []) => {
            reader.readEntries((entries) => {
              if (entries.length === 0) {
                Promise.all(acc.map(e => collectFiles(e, path + entry.name + "/"))).then(() => resolve());
              } else {
                readAll([...acc, ...entries]);
              }
            });
          };
          readAll();
        });
      }
    };

    for (let i = 0; i < items.length; i++) {
      const entry = items[i].webkitGetAsEntry();
      if (entry) await collectFiles(entry);
    }

    if (files.length === 0) return;
    setFileCount(files.length);
    setIsReading(true);

    try {
      const dt = new DataTransfer();
      files.forEach(f => dt.items.add(f));
      const data = await readFilesFromInput(dt.files);
      setPendingData(data);
      const cores = Object.keys(data.coreFileContents || {}).slice(0, 8);
      setCoreFilesFound(cores);
      setReady(true);
    } finally {
      setIsReading(false);
    }
  };

  const handleTextScan = () => {
    if (!treeText.trim()) return;
    const data = parseTreeText(treeText);
    if (packageJsonText.trim()) {
      try { data.packageJson = JSON.parse(packageJsonText); } catch {}
    }
    if (requirementsText.trim()) {
      data.requirementsTxt = requirementsText;
    }
    triggerScan(data);
  };

  const handleDemo = () => {
    const data: AnalysisData = {
      projectName: "my-saas-app",
      fileTree: "my-saas-app/\n├── vite.config.js\n├── tailwind.config.js\n├── src/\n│   ├── App.jsx\n│   └── lib/supabase.js\n└── index.html",
      packageJson: DEMO_PACKAGE_JSON,
      fileList: ["my-saas-app/vite.config.js", "my-saas-app/tailwind.config.js", "my-saas-app/src/App.jsx"],
      rawDeps: [],
      coreFileContents: DEMO_CORE_FILES,
    };
    triggerScan(data);
  };

  const copyTree = () => {
    if (!pendingData?.fileTree) return;
    navigator.clipboard.writeText(pendingData.fileTree);
    setTreeCopied(true);
    setTimeout(() => setTreeCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-[#0f172a] border border-slate-800 rounded-lg p-1 mb-4">
        {(["folder", "text"] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setReady(false); setPendingData(null); setCoreFilesFound([]); }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === m ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            {m === "folder" ? "📁 フォルダを参照" : "📋 テキストをペースト"}
          </button>
        ))}
      </div>

      {mode === "folder" ? (
        <div className="space-y-3">
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => !ready && folderInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? "border-blue-500 bg-blue-500/10 scale-[1.01] cursor-copy"
                : isReading
                ? "border-blue-400 bg-blue-500/5 cursor-wait"
                : ready
                ? "border-green-500/50 bg-green-500/5"
                : "border-slate-700 bg-[#0f172a] hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer"
            }`}
          >
            {isReading ? (
              <div className="py-4">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-blue-400 font-semibold">フォルダを読み込み中...</p>
                <p className="text-slate-500 text-xs mt-1">数千件のファイルをスキャンしています</p>
              </div>
            ) : ready && pendingData ? (
              <div>
                <div className="text-3xl mb-2">✅</div>
                <p className="text-green-400 font-semibold">{fileCount} ファイルを読み込みました</p>
                <p className="text-slate-500 text-sm mt-1">{pendingData.projectName}</p>
              </div>
            ) : (
              <div>
                <p className="text-slate-300 font-semibold mb-1">プロジェクトフォルダを選択</p>
                <p className="text-slate-500 text-sm mt-1">フォルダ内の構造をブラウザが参照します</p>
                <p className="text-slate-600 text-[10px] mt-2">
                  node_modules / .git / dist / 画像ファイルは自動除外
                </p>
                <p className="text-slate-700 text-[9px] mt-2 italic leading-tight">
                  ※システム上の「アップロード」ボタンが表示されますが、<br />
                  実際のファイルアップロードは行われませんのでご安心ください。
                </p>
              </div>
            )}
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error non-standard attribute
              webkitdirectory="true"
              multiple
              className="hidden"
              onChange={handleFolderChange}
            />
          </div>

          {/* 読み込み結果サマリー */}
          {ready && pendingData && (
            <div className="space-y-3">
              {/* コアファイル検出リスト */}
              {coreFilesFound.length > 0 && (
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    🔍 解析対象のコアファイル ({coreFilesFound.length}件)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {coreFilesFound.map((f) => (
                      <span key={f} className="text-xs bg-blue-500/10 text-blue-400 border border-blue-800/50 rounded px-2 py-0.5 font-mono">
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    importやfrom文から依存パッケージを自動検出します
                  </p>
                </div>
              )}

              {/* ファイルツリー + コピーボタン */}
              {pendingData.fileTree && (
                <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
                    <span className="text-xs text-slate-400 font-mono">📋 ファイルツリー</span>
                    <button
                      onClick={copyTree}
                      className={`text-xs px-3 py-1 rounded transition-all ${
                        treeCopied
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-700 hover:border-blue-500/50"
                      }`}
                    >
                      {treeCopied ? "✅ コピー済み" : "📋 コピー"}
                    </button>
                  </div>
                  <pre className="p-4 text-xs font-mono text-slate-400 overflow-x-auto max-h-40 leading-relaxed">
                    {pendingData.fileTree}
                  </pre>
                </div>
              )}

              <button
                onClick={() => triggerScan(pendingData)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all glow-blue hover:scale-[1.01] active:scale-[0.99]"
              >
                アーキテクチャを解析する →
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">
              ファイルツリー
              <span className="text-slate-600 text-xs ml-2">（`tree` コマンドの出力 や フォルダ構造をペースト）</span>
            </label>
            <textarea
              value={treeText}
              onChange={(e) => setTreeText(e.target.value)}
              placeholder={"my-app/\n├── vite.config.js\n├── tailwind.config.js\n├── src/\n│   ├── App.jsx\n│   └── lib/supabase.js\n└── index.html"}
              rows={8}
              className="w-full bg-[#0f172a] border border-slate-700 rounded-lg p-3 text-sm font-mono text-slate-300 placeholder-slate-700 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-slate-500 hover:text-blue-400 transition-colors flex items-center gap-1"
          >
            <span className={`transition-transform inline-block ${showAdvanced ? "rotate-90" : ""}`}>▶</span>
            依存関係ファイルを追加（精度向上）
          </button>

          {showAdvanced && (
            <div className="space-y-3 border border-slate-800 rounded-lg p-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">package.json の中身</label>
                <textarea
                  value={packageJsonText}
                  onChange={(e) => setPackageJsonText(e.target.value)}
                  placeholder={'{"dependencies": {"react": "^18.0.0", ...}}'}
                  rows={4}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-400 placeholder-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">requirements.txt の中身</label>
                <textarea
                  value={requirementsText}
                  onChange={(e) => setRequirementsText(e.target.value)}
                  placeholder={"streamlit\nsupabase\nstripe"}
                  rows={3}
                  className="w-full bg-[#0f172a] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-400 placeholder-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          <button
            onClick={handleTextScan}
            disabled={!treeText.trim()}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all glow-blue hover:scale-[1.01] active:scale-[0.99]"
          >
            アーキテクチャを解析する →
          </button>
        </div>
      )}

      {/* Demo */}
      <div className="mt-4 text-center">
        <button
          onClick={handleDemo}
          className="text-sm text-slate-500 hover:text-blue-400 transition-colors underline underline-offset-2"
        >
          デモデータで試してみる
        </button>
      </div>
    </div>
  );
}
