"use client";

import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "vibemap_gemini_api_key";

export function useGeminiApiKey() {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    setApiKey(localStorage.getItem(STORAGE_KEY) ?? "");
  }, []);

  const saveKey = (key: string) => {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setApiKey(key);
  };

  return { apiKey, saveKey };
}

export default function ApiKeySettings() {
  const { apiKey, saveKey } = useGeminiApiKey();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setInput(apiKey);
  }, [open, apiKey]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSave = () => {
    saveKey(input.trim());
    setOpen(false);
  };

  const handleClear = () => {
    saveKey("");
    setInput("");
    setOpen(false);
  };

  const hasKey = !!apiKey;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${
          hasKey
            ? "border-green-500/50 text-green-400 hover:border-green-400"
            : "border-amber-500/50 text-amber-400 hover:border-amber-400 animate-pulse"
        }`}
        title={hasKey ? "APIキー設定済み" : "APIキーを設定してください"}
      >
        <span>{hasKey ? "🔑" : "⚠️"}</span>
        <span className="hidden sm:inline">{hasKey ? "APIキー設定済み" : "APIキーを設定"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-80 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">Gemini APIキー</h3>
          <p className="text-xs text-slate-500 mb-3">
            キーはブラウザのlocalStorageにのみ保存されます。サーバーには保存されません。
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-blue-400 hover:underline"
            >
              キーを取得 →
            </a>
          </p>

          <div className="relative mb-3">
            <input
              type={show ? "text" : "password"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="AIzaSy..."
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 pr-16"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
            >
              {show ? "隠す" : "表示"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={!input.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            >
              保存
            </button>
            {hasKey && (
              <button
                onClick={handleClear}
                className="px-3 py-2 text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 rounded-lg transition-colors"
              >
                削除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
