"use client";

import { useMemo, useState } from "react";
import type { AnalysisResult, TechNode } from "@/lib/analyzer";

interface Props {
  result: AnalysisResult;
}

const CATEGORY_CONFIG = {
  frontend: {
    label: "フロントエンド",
    icon: "🖥️",
    color: "#3b82f6",
    bg: "bg-blue-950/60",
    border: "border-blue-800/60",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
    textColor: "text-blue-400",
  },
  mobile: {
    label: "モバイル",
    icon: "📱",
    color: "#06b6d4",
    bg: "bg-cyan-950/60",
    border: "border-cyan-800/60",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]",
    textColor: "text-cyan-400",
  },
  backend: {
    label: "バックエンド",
    icon: "⚙️",
    color: "#f59e0b",
    bg: "bg-amber-950/60",
    border: "border-amber-800/60",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
    textColor: "text-amber-400",
  },
  infra: {
    label: "インフラ",
    icon: "🏗️",
    color: "#8b5cf6",
    bg: "bg-violet-950/60",
    border: "border-violet-800/60",
    glow: "shadow-[0_0_15px_rgba(139,92,246,0.2)]",
    textColor: "text-violet-400",
  },
  database: {
    label: "データベース / 外部サービス",
    icon: "🗄️",
    color: "#10b981",
    bg: "bg-emerald-950/60",
    border: "border-emerald-800/60",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
    textColor: "text-emerald-400",
  },
};

function TechBadge({ node, onClick }: { node: TechNode; onClick?: (node: TechNode) => void }) {
  const config = CATEGORY_CONFIG[node.category] || CATEGORY_CONFIG.backend;
  return (
    <div
      onClick={() => onClick?.(node)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bg} ${config.border} ${config.glow} transition-all hover:scale-105 cursor-help`}
      title={`${node.name}: クリックして詳細を表示`}
    >
      <span className="text-base leading-none">{node.icon}</span>
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${config.textColor} truncate`}>{node.name}</div>
        <div className="text-[10px] text-slate-500 truncate max-w-[100px]">{node.description}</div>
      </div>
    </div>
  );
}

function LayerColumn({
  title,
  icon,
  nodes,
  color,
  textColor,
  borderColor,
  isEmpty,
  onNodeClick,
}: {
  title: string;
  icon: string;
  nodes: TechNode[];
  color: string;
  textColor: string;
  borderColor: string;
  isEmpty?: boolean;
  onNodeClick?: (node: TechNode) => void;
}) {
  return (
    <div className={`flex-1 min-w-[180px] border rounded-xl p-4 bg-[#0a0f1e]/80 ${borderColor} transition-all`}>
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <span className="text-lg">{icon}</span>
        <span className={`font-semibold text-sm ${textColor}`}>{title}</span>
        {nodes.length > 0 && (
          <span className="ml-auto text-xs text-slate-600 bg-slate-800/50 rounded-full px-2 py-0.5">
            {nodes.length}
          </span>
        )}
      </div>
      {isEmpty || nodes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-slate-700 text-xs">未検出</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {nodes.map((node) => (
            <TechBadge key={node.id} node={node} onClick={onNodeClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-2 py-4 shrink-0">
      <div className="h-12 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-500">
            <path
              d="M5 12h14M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {label && <span className="text-xs text-slate-600 mt-1 whitespace-nowrap">{label}</span>}
    </div>
  );
}

interface Props {
  result: AnalysisResult;
}

export default function ArchDiagram({ result }: Props) {
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null);
  const grouped = useMemo(() => {
    const g: Record<string, TechNode[]> = {
      frontend: [],
      mobile: [],
      backend: [],
      infra: [],
      database: [],
    };
    for (const node of result.stack) {
      g[node.category]?.push(node);
    }
    return g;
  }, [result.stack]);

  const hasFrontend = grouped.frontend.length > 0 || grouped.mobile.length > 0;
  const hasBackend = grouped.backend.length > 0 || grouped.infra.length > 0;
  const hasDB = grouped.database.length > 0;

  const allFrontend = [...grouped.frontend, ...grouped.mobile];
  const allBackend = [...grouped.backend, ...grouped.infra];

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <span className="text-blue-400">🗺️</span>
          アーキテクチャ構成図
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">検出された技術スタック:</span>
          <span className="text-xs font-semibold text-blue-400">{result.stack.length} 件</span>
        </div>
      </div>

      {result.stack.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <p className="text-4xl mb-3">🔍</p>
          <p>技術スタックを検出できませんでした</p>
          <p className="text-sm mt-1">package.json や requirements.txt を含めると精度が向上します</p>
        </div>
      ) : (
        <>
          {/* Main flow diagram */}
          <div className="flex items-start gap-0 overflow-x-auto pb-2">
            {/* Frontend/Mobile column */}
            <LayerColumn
              title={allFrontend.some(n => n.category === "mobile") ? "フロントエンド / モバイル" : "フロントエンド"}
              icon={allFrontend.some(n => n.category === "mobile") ? "📱" : "🖥️"}
              nodes={allFrontend}
              color="#3b82f6"
              textColor="text-blue-400"
              borderColor="border-blue-900/40"
              isEmpty={!hasFrontend}
              onNodeClick={setSelectedNode}
            />

            {/* Arrow FE → BE */}
            {(hasFrontend && (hasBackend || hasDB)) && (
              <FlowArrow label="HTTP / API" />
            )}

            {/* Backend column (only if exists) */}
            {hasBackend && (
              <LayerColumn
                title="バックエンド / インフラ"
                icon="⚙️"
                nodes={allBackend}
                color="#f59e0b"
                textColor="text-amber-400"
                borderColor="border-amber-900/40"
                onNodeClick={setSelectedNode}
              />
            )}

            {/* Arrow BE → DB */}
            {hasBackend && hasDB && <FlowArrow label="SQL / SDK" />}

            {/* Direct arrow FE → DB if no backend */}
            {!hasBackend && hasDB && hasFrontend && <FlowArrow label="SDK" />}

            {/* Database column */}
            {hasDB && (
              <LayerColumn
                title="データベース / 外部サービス"
                icon="🗄️"
                nodes={grouped.database}
                color="#10b981"
                textColor="text-emerald-400"
                borderColor="border-emerald-900/40"
                onNodeClick={setSelectedNode}
              />
            )}
          </div>

          {/* 解説ポップアップ */}
          {selectedNode && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl relative animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-3 right-3 text-slate-500 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedNode.icon}</span>
                <div>
                  <h4 className="font-bold text-blue-400">{selectedNode.name} って何？</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{CATEGORY_CONFIG[selectedNode.category].label}</p>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedNode.description}。
                このプロジェクトでは、主にシステム全体の「{CATEGORY_CONFIG[selectedNode.category].label}」を担当しています。
              </p>
            </div>
          )}

          {/* Layer legend */}
          <div className="mt-4 pt-4 border-t border-slate-800/50 flex flex-wrap gap-3">
            {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
              const count = grouped[cat as keyof typeof grouped]?.length || 0;
              if (count === 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span className="text-slate-500">{cfg.label}</span>
                  <span className="text-slate-700">({count})</span>
                </div>
              );
            })}
          </div>

          {/* Stack detail chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {result.stack.map((node) => (
              <span
                key={node.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-xs text-slate-300"
              >
                <span>{node.icon}</span>
                {node.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
