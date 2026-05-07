export interface TechNode {
  id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "infra" | "mobile";
  icon: string;
  color: string;
  description: string;
}

export interface AnalysisData {
  projectName: string;
  fileTree: string;
  packageJson?: Record<string, unknown>;
  requirementsTxt?: string;
  fileList: string[];
  rawDeps: string[];
  // コアファイルの内容 (import文などから検出するため)
  coreFileContents?: Record<string, string>;
}

export interface AnalysisResult {
  stack: TechNode[];
  projectType: string;
  projectTypeLabel: string;
  confidence: number;
  connections: Array<{ from: string; to: string }>;
  // 自動生成したpackage.json / requirements.txt
  generatedPackageJson?: string;
  generatedRequirements?: string;
  // iOS/Apple プロジェクト用セットアップメモ
  generatedSetupNotes?: string;
}

// ==================== 技術マスター ====================
const TECH_MAP: Record<string, TechNode> = {
  react: {
    id: "react", name: "React", category: "frontend", icon: "⚛️",
    color: "#61DAFB", description: "UIコンポーネントライブラリ",
  },
  nextjs: {
    id: "nextjs", name: "Next.js", category: "frontend", icon: "▲",
    color: "#ffffff", description: "Reactフルスタックフレームワーク",
  },
  vite: {
    id: "vite", name: "Vite", category: "frontend", icon: "⚡",
    color: "#646CFF", description: "高速ビルドツール",
  },
  tailwind: {
    id: "tailwind", name: "Tailwind CSS", category: "frontend", icon: "🎨",
    color: "#06B6D4", description: "デザイン（色や形）を簡単に整えるためのツール",
  },
  typescript: {
    id: "typescript", name: "TypeScript", category: "frontend", icon: "🔷",
    color: "#3178C6", description: "型付きJavaScript",
  },
  vue: {
    id: "vue", name: "Vue.js", category: "frontend", icon: "💚",
    color: "#42B883", description: "プログレッシブUIフレームワーク",
  },
  svelte: {
    id: "svelte", name: "Svelte", category: "frontend", icon: "🔴",
    color: "#FF3E00", description: "コンパイル型UIフレームワーク",
  },
  streamlit: {
    id: "streamlit", name: "Streamlit", category: "frontend", icon: "🎈",
    color: "#FF4B4B", description: "Pythonだけでリッチな画面を作れるツール",
  },
  gradio: {
    id: "gradio", name: "Gradio", category: "frontend", icon: "🎛️",
    color: "#FF7C00", description: "AI/ML向けPython UI",
  },
  fastapi: {
    id: "fastapi", name: "FastAPI", category: "backend", icon: "🚀",
    color: "#009688", description: "高速Python APIフレームワーク",
  },
  flask: {
    id: "flask", name: "Flask", category: "backend", icon: "🍶",
    color: "#555555", description: "軽量Pythonウェブフレームワーク",
  },
  django: {
    id: "django", name: "Django", category: "backend", icon: "🦄",
    color: "#092E20", description: "フルスタックPythonフレームワーク",
  },
  express: {
    id: "express", name: "Express", category: "backend", icon: "🟩",
    color: "#68A063", description: "Node.js HTTPサーバー",
  },
  python: {
    id: "python", name: "Python", category: "backend", icon: "🐍",
    color: "#3776AB", description: "汎用スクリプト言語",
  },
  stripe: {
    id: "stripe", name: "Stripe", category: "backend", icon: "💳",
    color: "#6772E5", description: "決済インフラ",
  },
  openai: {
    id: "openai", name: "OpenAI API", category: "backend", icon: "🧠",
    color: "#10A37F", description: "GPT / DALL-E API",
  },
  anthropic: {
    id: "anthropic", name: "Anthropic / Claude", category: "backend", icon: "🤖",
    color: "#D4A27A", description: "Claude API",
  },
  githubactions: {
    id: "githubactions", name: "GitHub Actions", category: "infra", icon: "🔄",
    color: "#2088FF", description: "CI/CDオートメーション",
  },
  vercel: {
    id: "vercel", name: "Vercel", category: "infra", icon: "▲",
    color: "#ffffff", description: "アプリをWeb上に公開するための場所",
  },
  githubcron: {
    id: "githubcron", name: "GitHub Cron", category: "infra", icon: "⏰",
    color: "#2088FF", description: "決まった時間に自動で処理を実行する仕組み",
  },
  BATCH: { id: "BATCH", name: "Windows Batch", category: "infra", icon: "⚙️", color: "#C0C0C0", description: "Windowsの処理を自動化するスクリプトです。ビルドや実行のショートカットとして使われます。" },
  SHELL: { id: "SHELL", name: "Shell Script", category: "infra", icon: "🐚", color: "#4E4E4E", description: "LinuxやMacの処理を自動化するスクリプトです。" },
  PYINSTALLER: { id: "PYINSTALLER", name: "PyInstaller", category: "backend", icon: "📦", color: "#3776AB", description: "Pythonスクリプトを、Pythonが入っていないパソコンでも動く『エグゼファイル』に変換するツールです。" },
  EXE: { id: "EXE", name: "Windows App (EXE)", category: "frontend", icon: "🖥️", color: "#0078D4", description: "Windowsでそのまま動くプログラム本体です。ユーザーがダブルクリックして起動するものです。" },
  INSTALLER: { id: "INSTALLER", name: "Installer (Setup)", category: "infra", icon: "💿", color: "#A0A0A0", description: "アプリをパソコンにインストールするためのファイルです（Setup.exeなど）。" },
  TOOL: { id: "TOOL", name: "Utility Tool", category: "infra", icon: "🛠️", color: "#7F7F7F", description: "開発や運用を補助するための小さなプログラムです。" },
  domain: {
    id: "domain", name: "Domain/DNS", category: "infra", icon: "🌐",
    color: "#F97316", description: "サイトの住所（URL）を設定する場所",
  },
  html: {
    id: "html", name: "HTML", category: "frontend", icon: "📄",
    color: "#E34F26", description: "Webサイトの骨組みを作る標準的な言語",
  },
  hosting: {
    id: "hosting", name: "Web Hosting", category: "infra", icon: "☁️",
    color: "#3B82F6", description: "ファイルをインターネットに置くためのサーバー",
  },
  supabase: {
    id: "supabase", name: "Supabase", category: "database", icon: "⚡",
    color: "#3ECF8E", description: "オープンソースFirebase代替 (PostgreSQL)",
  },
  firebase: {
    id: "firebase", name: "Firebase", category: "database", icon: "🔥",
    color: "#FFCA28", description: "Googleのリアルタイムデータベース",
  },
  sqlite: {
    id: "sqlite", name: "SQLite", category: "database", icon: "🗄️",
    color: "#003B57", description: "軽量組み込みRDB",
  },
  mongodb: {
    id: "mongodb", name: "MongoDB", category: "database", icon: "🍃",
    color: "#47A248", description: "ドキュメント指向NoSQL",
  },
  postgresql: {
    id: "postgresql", name: "PostgreSQL", category: "database", icon: "🐘",
    color: "#336791", description: "高機能オープンソースRDB",
  },
  mysql: {
    id: "mysql", name: "MySQL", category: "database", icon: "🐬",
    color: "#4479A1", description: "広く使われるRDB",
  },
  redis: {
    id: "redis", name: "Redis", category: "database", icon: "🔴",
    color: "#DC382D", description: "インメモリキャッシュDB",
  },
  prisma: {
    id: "prisma", name: "Prisma", category: "database", icon: "💎",
    color: "#2D3748", description: "TypeScript ORM",
  },
  capacitor: {
    id: "capacitor", name: "Capacitor", category: "mobile", icon: "📱",
    color: "#119EFF", description: "ネイティブモバイルアプリ変換",
  },
  pwa: {
    id: "pwa", name: "PWA", category: "mobile", icon: "📲",
    color: "#5A0FC8", description: "プログレッシブウェブアプリ",
  },
  // ==================== iOS / Apple ====================
  swiftui: {
    id: "swiftui", name: "SwiftUI", category: "frontend", icon: "🍎",
    color: "#FA7343", description: "Apple製宣言型UIフレームワーク",
  },
  uikit: {
    id: "uikit", name: "UIKit", category: "frontend", icon: "📐",
    color: "#0075C2", description: "Apple製命令型UIフレームワーク",
  },
  swift: {
    id: "swift", name: "Swift", category: "frontend", icon: "🦅",
    color: "#FA7343", description: "Apple製プログラミング言語",
  },
  storekit: {
    id: "storekit", name: "StoreKit (IAP)", category: "backend", icon: "💰",
    color: "#34C759", description: "App内課金・サブスクリプション",
  },
  usernotifications: {
    id: "usernotifications", name: "UserNotifications", category: "backend", icon: "🔔",
    color: "#FF9500", description: "ローカル・プッシュ通知",
  },
  cloudkit: {
    id: "cloudkit", name: "CloudKit", category: "database", icon: "☁️",
    color: "#147EFB", description: "Appleのクラウドデータ同期",
  },
  icloudkv: {
    id: "icloudkv", name: "iCloud KV Store", category: "database", icon: "🔑",
    color: "#147EFB", description: "iCloudキーバリューストレージ",
  },
  userdefaults: {
    id: "userdefaults", name: "UserDefaults", category: "database", icon: "💾",
    color: "#636366", description: "端末ローカル設定ストレージ",
  },
  coredata: {
    id: "coredata", name: "CoreData", category: "database", icon: "🗃️",
    color: "#5856D6", description: "Apple製ローカルDB/ORM",
  },
  photosui: {
    id: "photosui", name: "PhotosUI", category: "mobile", icon: "🖼️",
    color: "#30B0C7", description: "写真・カメラアクセス",
  },
  combine: {
    id: "combine", name: "Combine", category: "backend", icon: "🔄",
    color: "#5856D6", description: "Apple製リアクティブフレームワーク",
  },
  xcodeproj: {
    id: "xcodeproj", name: "Xcode", category: "infra", icon: "🔨",
    color: "#1575F9", description: "Apple製IDE・ビルドツール",
  },
  spm: {
    id: "spm", name: "Swift Package Manager", category: "infra", icon: "📦",
    color: "#FA7343", description: "Swiftパッケージ管理ツール",
  },
  cocoapods: {
    id: "cocoapods", name: "CocoaPods", category: "infra", icon: "🦕",
    color: "#EE3322", description: "iOS依存関係管理ツール",
  },
};

// ==================== 依存パッケージ → 技術マッピング ====================
const PACKAGE_TO_TECH: Array<[RegExp, string]> = [
  [/^react$|^react-dom$/, "react"],
  [/^next$/, "nextjs"],
  [/^vite$|^@vitejs\//, "vite"],
  [/^tailwindcss$/, "tailwind"],
  [/^typescript$/, "typescript"],
  [/^vue$|^@vue\//, "vue"],
  [/^svelte$|^@sveltejs\//, "svelte"],
  [/^express$/, "express"],
  [/^stripe$/, "stripe"],
  [/^@supabase\//, "supabase"],
  [/^firebase$|^@firebase\//, "firebase"],
  [/^mongoose$|^mongodb$/, "mongodb"],
  [/^@prisma\/|^prisma$/, "prisma"],
  [/^redis$|^ioredis$/, "redis"],
  [/^pg$|^postgres$/, "postgresql"],
  [/^@capacitor\//, "capacitor"],
  [/^vite-plugin-pwa$|^workbox-/, "pwa"],
  [/^openai$/, "openai"],
  [/^@anthropic-ai\//, "anthropic"],
];

// ==================== Pythonパッケージ → 技術マッピング ====================
const PY_IMPORT_TO_TECH: Array<[RegExp, string]> = [
  [/^streamlit/, "streamlit"],
  [/^gradio/, "gradio"],
  [/^fastapi|^uvicorn/, "fastapi"],
  [/^flask/, "flask"],
  [/^django/, "django"],
  [/^stripe/, "stripe"],
  [/^supabase/, "supabase"],
  [/^sqlalchemy|^sqlite/, "sqlite"],
  [/^psycopg|^asyncpg/, "postgresql"],
  [/^pymongo/, "mongodb"],
  [/^redis/, "redis"],
  [/^openai/, "openai"],
  [/^anthropic/, "anthropic"],
];

// ==================== ファイル名パターン → 技術マッピング ====================
const FILENAME_TO_TECH: Array<[RegExp, string]> = [
  [/tailwind\.config\.(js|ts|cjs)$/, "tailwind"],
  [/vite\.config\.(js|ts)$/, "vite"],
  [/next\.config\.(js|ts|mjs)$/, "nextjs"],
  [/svelte\.config\.(js|ts)$/, "svelte"],
  [/capacitor\.config\.(ts|js|json)$/, "capacitor"],
  [/\.github\/workflows\/.+\.ya?ml$/, "githubactions"],
  [/\.git(\/|$)/, "githubactions"], // .git フォルダ自体を検知
  [/\.gitignore$/, "githubactions"], // .gitignore も Git 利用の証拠
  [/tailwind\.config\.(js|ts|cjs)$/, "tailwind"],
  [/streamlit_app\.py$|streamlit\.py$|\.streamlit\//, "streamlit"],
  [/index\.html$/, "html"],
  [/CNAME$/, "domain"],
  [/firebase\.json$/, "hosting"],
  [/vercel\.json$/, "vercel"],
  [/supabase\/functions\//, "supabase"],
  [/supabase.*\.sql$/, "supabase"],
  [/\.ts$|\.tsx$/, "typescript"],
  [/requirements.*\.txt$/, "python"],
  [/app\.py$|main\.py$|server\.py$|api\.py$/, "python"],
  [/\.(db|sqlite3?)$/, "sqlite"],
  [/prisma\/schema\.prisma$/, "prisma"],
  // iOS / Apple
  [/\.xcodeproj(\/|$)|\.xcworkspace(\/|$)/, "xcodeproj"],
  [/\.swift$/, "swift"],
  [/Package\.swift$/, "spm"],
  [/Podfile$|\.podspec$/, "cocoapods"],
  // Windows Desktop
  [/\.bat$/, "BATCH"],
  [/\.sh$/, "SHELL"],
  [/\.spec$|PyInstaller/, "PYINSTALLER"],
];

// ==================== JSソースファイルのimport解析 ====================
function extractImportsFromJsContent(content: string): string[] {
  const packages: string[] = [];
  // ESM: import ... from 'pkg' / import('pkg')
  const staticImports = content.matchAll(/from\s+['"]([^'"./][^'"]*)['"]/g);
  for (const m of staticImports) packages.push(m[1]);
  // require('pkg')
  const requires = content.matchAll(/require\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g);
  for (const m of requires) packages.push(m[1]);
  // import('pkg')
  const dynamicImports = content.matchAll(/import\s*\(\s*['"]([^'"./][^'"]*)['"]\s*\)/g);
  for (const m of dynamicImports) packages.push(m[1]);
  // Strip subpath: 'react-dom/client' → 'react-dom'
  return packages.map(p => p.split("/").slice(0, p.startsWith("@") ? 2 : 1).join("/"));
}

// ==================== Pythonソースファイルのimport解析 ====================
function extractImportsFromPyContent(content: string): string[] {
  const packages: string[] = [];
  const imports = content.matchAll(/^(?:import|from)\s+([a-zA-Z0-9_]+)/gm);
  for (const m of imports) {
    const pkg = m[1].toLowerCase();
    // 標準ライブラリは除外
    const stdlib = new Set(["os", "sys", "re", "json", "math", "time", "datetime", "pathlib",
      "typing", "collections", "itertools", "functools", "io", "abc", "copy", "random",
      "hashlib", "base64", "uuid", "logging", "threading", "subprocess", "shutil",
      "glob", "csv", "string", "textwrap", "urllib", "http", "email", "html"]);
    if (!stdlib.has(pkg)) packages.push(pkg);
  }
  return packages;
}

// ==================== HTMLのscriptタグ/CDN解析 ====================
function extractFromHtmlContent(content: string): string[] {
  const techs: string[] = [];
  const lower = content.toLowerCase();
  if (lower.includes("react") || lower.includes("react-dom")) techs.push("react");
  if (lower.includes("vue")) techs.push("vue");
  if (lower.includes("tailwind")) techs.push("tailwind");
  if (lower.includes("bootstrap")) techs.push("bootstrap");
  if (lower.includes("jquery")) techs.push("jquery");
  if (lower.includes("firebase")) techs.push("firebase");
  if (lower.includes("supabase")) techs.push("supabase");
  if (lower.includes("stripe")) techs.push("stripe");
  return techs;
}

// ==================== package.json解析 ====================
function extractDepsFromPackageJson(pkg: Record<string, unknown>): string[] {
  const deps = {
    ...(pkg.dependencies as Record<string, string> || {}),
    ...(pkg.devDependencies as Record<string, string> || {}),
  };
  return Object.keys(deps);
}

// ==================== パッケージ名リスト → TechNode変換 ====================
function packagesToTechNodes(packages: string[]): TechNode[] {
  const added = new Set<string>();
  const nodes: TechNode[] = [];

  for (const pkg of packages) {
    const lowerPkg = pkg.toLowerCase();
    for (const [pattern, techId] of PACKAGE_TO_TECH) {
      if (pattern.test(lowerPkg) && !added.has(techId) && TECH_MAP[techId]) {
        nodes.push(TECH_MAP[techId]);
        added.add(techId);
      }
    }
  }
  return nodes;
}

// ==================== Pythonパッケージリスト → TechNode変換 ====================
function pythonPackagesToTechNodes(packages: string[]): TechNode[] {
  const added = new Set<string>();
  const nodes: TechNode[] = [];

  if (packages.length > 0 && !added.has("python")) {
    nodes.push(TECH_MAP["python"]);
    added.add("python");
  }

  for (const pkg of packages) {
    const lower = pkg.toLowerCase();
    for (const [pattern, techId] of PY_IMPORT_TO_TECH) {
      if (pattern.test(lower) && !added.has(techId) && TECH_MAP[techId]) {
        nodes.push(TECH_MAP[techId]);
        added.add(techId);
      }
    }
  }
  return nodes;
}

// ==================== ファイルリスト → TechNode変換 ====================
function fileListToTechNodes(files: string[]): TechNode[] {
  const added = new Set<string>();
  const nodes: TechNode[] = [];

  for (const f of files) {
    const lower = f.toLowerCase();
    
    // 特別なEXE分類ロジック
    if (lower.endsWith(".exe")) {
      let type = "EXE"; // デフォルトはアプリ本体
      if (lower.includes("setup") || lower.includes("install")) type = "INSTALLER";
      else if (lower.includes("tool") || lower.includes("util") || lower.includes("patch")) type = "TOOL";
      
      if (!added.has(type)) {
        nodes.push(TECH_MAP[type]);
        added.add(type);
      }
      continue;
    }

    for (const [pattern, techId] of FILENAME_TO_TECH) {
      if (pattern.test(f) && !added.has(techId) && TECH_MAP[techId]) {
        nodes.push(TECH_MAP[techId]);
        added.add(techId);
      }
    }
  }
  return nodes;
}

// ==================== Swiftファイルのimport解析 ====================
const SWIFT_IMPORT_TO_TECH: Array<[RegExp, string]> = [
  [/^SwiftUI$/, "swiftui"],
  [/^UIKit$/, "uikit"],
  [/^StoreKit$/, "storekit"],
  [/^UserNotifications$/, "usernotifications"],
  [/^CloudKit$/, "cloudkit"],
  [/^CoreData$/, "coredata"],
  [/^PhotosUI$|^Photos$/, "photosui"],
  [/^Combine$/, "combine"],
  [/^AVFoundation$|^AVKit$/, "photosui"],   // 動画/音声もphotosui枠で
];

function extractImportsFromSwiftContent(content: string): TechNode[] {
  const added = new Set<string>();
  const nodes: TechNode[] = [];

  const addNode = (id: string) => {
    if (!added.has(id) && TECH_MAP[id]) { nodes.push(TECH_MAP[id]); added.add(id); }
  };

  // always add swift for any .swift file
  addNode("swift");

  const importLines = content.matchAll(/^import\s+(\w+)/gm);
  for (const m of importLines) {
    const fw = m[1];
    for (const [pattern, techId] of SWIFT_IMPORT_TO_TECH) {
      if (pattern.test(fw)) { addNode(techId); break; }
    }
  }

  // entitlements / NSUserDefaults usage → iCloud KV
  if (content.includes("ubiquity-kvstore") || content.includes("NSUbiquitousKeyValueStore")) addNode("icloudkv");
  if (content.includes("UserDefaults.standard")) addNode("userdefaults");

  return nodes;
}

// ==================== コアファイル内容からTechNode抽出 ====================
function coreFileContentsToTechNodes(
  contents: Record<string, string>
): { nodes: TechNode[]; jsPackages: string[]; pyPackages: string[] } {
  const added = new Set<string>();
  const nodes: TechNode[] = [];
  const jsPackages: string[] = [];
  const pyPackages: string[] = [];

  const addNode = (id: string) => {
    if (!added.has(id) && TECH_MAP[id]) {
      nodes.push(TECH_MAP[id]);
      added.add(id);
    }
  };

  for (const [filename, content] of Object.entries(contents)) {
    const lower = filename.toLowerCase();

    // Swift ファイル → import解析
    if (/\.swift$/.test(lower)) {
      extractImportsFromSwiftContent(content).forEach(n => addNode(n.id));
      if (content.includes("ubiquity-kvstore-identifier")) addNode("icloudkv");
    }

    // .entitlements → Apple capabilities
    if (/\.entitlements$/.test(lower)) {
      if (content.includes("ubiquity-kvstore-identifier") || content.includes("icloud-container")) addNode("icloudkv");
      if (content.includes("aps-environment")) addNode("usernotifications");
      if (content.includes("com.apple.developer.icloud-services")) addNode("cloudkit");
    }

    // JS/TS/JSX/TSX ファイル → import解析
    if (/\.(jsx?|tsx?)$/.test(lower)) {
      const pkgs = extractImportsFromJsContent(content);
      jsPackages.push(...pkgs);
    }

    // Python ファイル → import解析
    if (/\.py$/.test(lower)) {
      const pkgs = extractImportsFromPyContent(content);
      pyPackages.push(...pkgs);
    }

    // HTML ファイル → CDN/script解析
    if (/\.html?$/.test(lower)) {
      const techs = extractFromHtmlContent(content);
      techs.forEach(addNode);
      // HTMLがあってReactがscriptタグなしなら静的HTMLの可能性
    }

    // vite.config.* → Vite確定
    if (/vite\.config\.(js|ts)$/.test(lower)) {
      addNode("vite");
      const pkgs = extractImportsFromJsContent(content);
      jsPackages.push(...pkgs);
    }

    // next.config.* → Next.js確定
    if (/next\.config\.(js|ts|mjs)$/.test(lower)) {
      addNode("nextjs");
    }

    // tailwind.config.* → Tailwind確定
    if (/tailwind\.config\.(js|ts|cjs)$/.test(lower)) {
      addNode("tailwind");
    }

    // capacitor.config.* → Capacitor確定
    if (/capacitor\.config\.(ts|js|json)$/.test(lower)) {
      addNode("capacitor");
    }

    // requirements.txt → Python + pip packages
    if (/requirements.*\.txt$/.test(lower)) {
      pyPackages.push(...content.split("\n").map(l => l.trim().split(/[>=<!\[]/)[0].toLowerCase()).filter(Boolean));
    }

    // .github/workflows/*.yml → GitHub Actions
    if (/\.github\/workflows\//.test(lower)) {
      addNode("githubactions");
    }
  }

  return { nodes, jsPackages, pyPackages };
}

// ==================== アーキテクチャ接続線生成 ====================
function buildConnections(nodes: TechNode[]): Array<{ from: string; to: string }> {
  const connections: Array<{ from: string; to: string }> = [];
  const frontend = nodes.filter(n => n.category === "frontend" || n.category === "mobile");
  const backend = nodes.filter(n => n.category === "backend" || n.category === "infra");
  const database = nodes.filter(n => n.category === "database");

  for (const fe of frontend) {
    for (const be of backend) {
      connections.push({ from: fe.id, to: be.id });
    }
    if (backend.length === 0) {
      for (const db of database) {
        connections.push({ from: fe.id, to: db.id });
      }
    }
  }
  for (const be of backend) {
    for (const db of database) {
      connections.push({ from: be.id, to: db.id });
    }
  }

  // --- Build & Desktop Flow (Special Connections) ---
  const ids = new Set(nodes.map(n => n.id));
  if (ids.has("python") && ids.has("PYINSTALLER")) connections.push({ from: "python", to: "PYINSTALLER" });
  if (ids.has("PYINSTALLER") && ids.has("EXE")) connections.push({ from: "PYINSTALLER", to: "EXE" });
  if (ids.has("BATCH") && ids.has("PYINSTALLER")) connections.push({ from: "BATCH", to: "PYINSTALLER" });
  if (ids.has("BATCH") && ids.has("EXE")) connections.push({ from: "BATCH", to: "EXE" });

  return connections;
}

// ==================== プロジェクトタイプ分類 ====================
function classifyProjectType(nodes: TechNode[]): { type: string; label: string } {
  const ids = new Set(nodes.map(n => n.id));

  // iOS ネイティブ判定（最優先）
  if (ids.has("swiftui") || ids.has("swift") || ids.has("uikit")) {
    const hasIAP = ids.has("storekit");
    const hasCloud = ids.has("cloudkit") || ids.has("icloudkv");
    if (ids.has("swiftui") && hasIAP && hasCloud) return { type: "ios-swiftui-premium", label: "🍎 SwiftUI iOSアプリ (課金+iCloud同期)" };
    if (ids.has("swiftui") && hasIAP) return { type: "ios-swiftui-iap", label: "🍎 SwiftUI iOSアプリ (IAP課金あり)" };
    if (ids.has("swiftui")) return { type: "ios-swiftui", label: "🍎 SwiftUI iOSアプリ" };
    if (ids.has("uikit")) return { type: "ios-uikit", label: "📐 UIKit iOSアプリ" };
    return { type: "ios-swift", label: "🦅 Swift iOSアプリ" };
  }

  if (ids.has("capacitor")) return { type: "hybrid-mobile", label: "📱 ハイブリッドモバイルアプリ" };
  if (ids.has("pwa") && (ids.has("react") || ids.has("vue"))) return { type: "pwa", label: "📲 プログレッシブウェブアプリ (PWA)" };
  if (ids.has("streamlit") && ids.has("stripe") && ids.has("supabase")) return { type: "python-saas", label: "🐍 Python SaaS (決済付き)" };
  if (ids.has("streamlit") && ids.has("supabase")) return { type: "python-data-app", label: "🐍 Pythonデータアプリ (BaaS付き)" };
  if (ids.has("streamlit")) return { type: "python-ui", label: "🐍 Python UIアプリ" };
  if (ids.has("fastapi") && (ids.has("react") || ids.has("nextjs"))) return { type: "react-python", label: "⚛️ React + FastAPI フルスタック" };
  if ((ids.has("react") || ids.has("nextjs")) && ids.has("supabase") && ids.has("stripe")) return { type: "react-saas", label: "⚛️ React SaaS (決済付き)" };
  if ((ids.has("react") || ids.has("nextjs")) && ids.has("supabase")) return { type: "react-baas", label: "⚛️ React + Supabase アプリ" };
  if (ids.has("nextjs")) return { type: "nextjs-app", label: "▲ Next.js アプリ" };
  if (ids.has("react") && (ids.has("python") || ids.has("fastapi") || ids.has("flask"))) return { type: "react-python", label: "⚛️ React + Python フルスタック" };
  if (ids.has("react") || ids.has("vue") || ids.has("svelte")) return { type: "spa", label: "⚛️ シングルページアプリ (SPA)" };
  if (ids.has("PYINSTALLER") || ids.has("EXE")) return { type: "windows-desktop-app", label: "🖥️ Windows デスクトップアプリ (ビルド環境付き)" };
  if (ids.has("python") && ids.has("stripe")) return { type: "python-payment", label: "🐍 Python 決済アプリ" };
  if (ids.has("python")) return { type: "python-script", label: "🐍 Python スクリプト / ツール" };
  return { type: "unknown", label: "📦 汎用ウェブアプリ" };
}

// ==================== iOS セットアップノート 自動生成 ====================
function generateIosSetupNotes(nodes: TechNode[], projectName: string): string {
  const ids = new Set(nodes.map(n => n.id));
  const lines: string[] = [
    `# ${projectName} — iOS アプリ セットアップメモ`,
    `# VibeMap が自動生成しました`,
    ``,
    `## 必要環境`,
    `- Xcode 16以上 (最新推奨)`,
    `- Apple Developer アカウント (App Store配布時)`,
    `- macOS Sequoia / Sonoma`,
    ``,
    `## 検出されたフレームワーク`,
  ];

  if (ids.has("swiftui")) lines.push(`- SwiftUI          # Apple製宣言型UIフレームワーク (iOS 13+)`);
  if (ids.has("uikit"))   lines.push(`- UIKit            # Apple製命令型UIフレームワーク`);
  if (ids.has("combine")) lines.push(`- Combine          # リアクティブ状態管理 (iOS 13+)`);
  if (ids.has("storekit")) lines.push(`- StoreKit         # App内課金 / サブスクリプション`);
  if (ids.has("usernotifications")) lines.push(`- UserNotifications  # ローカル・プッシュ通知`);
  if (ids.has("photosui")) lines.push(`- PhotosUI / Photos  # 写真・カメラアクセス`);
  if (ids.has("cloudkit")) lines.push(`- CloudKit         # iCloudデータ同期`);
  if (ids.has("icloudkv")) lines.push(`- NSUbiquitousKeyValueStore  # iCloud KV同期`);
  if (ids.has("userdefaults")) lines.push(`- UserDefaults     # 端末ローカル設定保存`);
  if (ids.has("coredata")) lines.push(`- CoreData         # ローカルDB / ORM`);

  lines.push(``, `## 開発手順`, `1. UndoQuest.xcodeproj をXcodeで開く`);
  lines.push(`2. Signing & Capabilities でApple Developerアカウントを設定`);
  if (ids.has("storekit")) {
    lines.push(`3. App Store Connect で課金商品を作成 (月額/年額/買い切り)`);
    lines.push(`   - Product IDをコード内の PRODUCT_IDs と一致させる`);
  }
  if (ids.has("icloudkv") || ids.has("cloudkit")) {
    lines.push(`${ids.has("storekit") ? "4" : "3"}. Capabilities → iCloud を有効化`);
  }
  if (ids.has("usernotifications")) {
    lines.push(`- Capabilities → Push Notifications を有効化`);
  }
  lines.push(``, `## 依存関係管理`);
  if (ids.has("spm")) {
    lines.push(`- Swift Package Manager を使用`);
    lines.push(`- Xcode → File → Add Package Dependencies`);
  } else if (ids.has("cocoapods")) {
    lines.push(`- CocoaPods を使用`);
    lines.push(`- $ pod install  # Podfileから依存関係をインストール`);
  } else {
    lines.push(`- 外部ライブラリなし (Apple標準フレームワークのみ)`);
    lines.push(`- 追加したい場合: Swift Package Manager 推奨`);
  }

  lines.push(``, `## ビルド・実機テスト`);
  lines.push(`- シミュレータ: Xcode上で⌘+R`);
  lines.push(`- 実機テスト: TestFlight経由 or 開発者証明書で直接インストール`);
  lines.push(`- App Store提出: Product → Archive → Distribute`);

  return lines.join("\n");
}

// ==================== package.json 自動生成 ====================
const PACKAGE_VERSIONS: Record<string, string> = {
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.0",
  "next": "^15.0.0",
  "vue": "^3.5.0",
  "svelte": "^5.0.0",
  "@vitejs/plugin-react": "^4.3.1",
  "@vitejs/plugin-vue": "^5.1.0",
  "vite": "^5.4.8",
  "vite-plugin-pwa": "^0.20.5",
  "tailwindcss": "^3.4.13",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.4.47",
  "typescript": "^5.6.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "@supabase/supabase-js": "^2.45.0",
  "firebase": "^10.13.0",
  "stripe": "^16.0.0",
  "lucide-react": "^0.441.0",
  "express": "^4.21.0",
  "prisma": "^5.20.0",
  "@prisma/client": "^5.20.0",
  "mongodb": "^6.9.0",
  "mongoose": "^8.7.0",
  "redis": "^4.7.0",
  "openai": "^4.65.0",
  "@anthropic-ai/sdk": "^0.32.0",
  "@capacitor/core": "^6.1.0",
  "@capacitor/ios": "^6.1.0",
  "@capacitor/android": "^6.1.0",
};

const DEV_PACKAGES = new Set([
  "@vitejs/plugin-react", "@vitejs/plugin-vue", "vite", "vite-plugin-pwa",
  "tailwindcss", "autoprefixer", "postcss", "typescript",
  "@types/react", "@types/react-dom", "eslint", "prettier",
]);

function generatePackageJson(
  projectName: string,
  jsPackages: string[],
  detectedTechs: TechNode[]
): string {
  const techIds = new Set(detectedTechs.map(n => n.id));
  const uniquePkgs = [...new Set(jsPackages)].filter(p => PACKAGE_VERSIONS[p]);

  // techIds から追加パッケージを補完
  if (techIds.has("react") && !uniquePkgs.includes("react")) uniquePkgs.push("react", "react-dom");
  if (techIds.has("nextjs") && !uniquePkgs.includes("next")) uniquePkgs.push("next");
  if (techIds.has("vite") && !uniquePkgs.includes("vite")) uniquePkgs.push("vite");
  if (techIds.has("tailwind") && !uniquePkgs.includes("tailwindcss")) uniquePkgs.push("tailwindcss", "autoprefixer", "postcss");
  if (techIds.has("typescript") && !uniquePkgs.includes("typescript")) uniquePkgs.push("typescript");
  if (techIds.has("supabase") && !uniquePkgs.includes("@supabase/supabase-js")) uniquePkgs.push("@supabase/supabase-js");
  if (techIds.has("pwa") && !uniquePkgs.includes("vite-plugin-pwa")) uniquePkgs.push("vite-plugin-pwa");

  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};

  for (const pkg of uniquePkgs) {
    if (PACKAGE_VERSIONS[pkg]) {
      if (DEV_PACKAGES.has(pkg)) {
        devDeps[pkg] = PACKAGE_VERSIONS[pkg];
      } else {
        deps[pkg] = PACKAGE_VERSIONS[pkg];
      }
    }
  }

  const isNext = techIds.has("nextjs");
  const scripts: Record<string, string> = isNext
    ? { dev: "next dev", build: "next build", start: "next start" }
    : { dev: "vite", build: "vite build", preview: "vite preview" };

  const pkg: Record<string, unknown> = {
    name: projectName.toLowerCase().replace(/\s+/g, "-"),
    version: "0.1.0",
    private: true,
    type: "module",
    scripts,
    ...(Object.keys(deps).length ? { dependencies: deps } : {}),
    ...(Object.keys(devDeps).length ? { devDependencies: devDeps } : {}),
  };

  return JSON.stringify(pkg, null, 2);
}

// ==================== requirements.txt 自動生成 ====================
const PY_PACKAGE_VERSIONS: Record<string, string> = {
  "streamlit": "streamlit>=1.38.0",
  "gradio": "gradio>=4.44.0",
  "fastapi": "fastapi>=0.115.0",
  "uvicorn": "uvicorn[standard]>=0.30.0",
  "flask": "flask>=3.0.0",
  "django": "django>=5.1.0",
  "stripe": "stripe>=10.11.0",
  "supabase": "supabase>=2.7.0",
  "sqlalchemy": "sqlalchemy>=2.0.0",
  "psycopg2": "psycopg2-binary>=2.9.0",
  "pymongo": "pymongo>=4.8.0",
  "redis": "redis>=5.1.0",
  "openai": "openai>=1.51.0",
  "anthropic": "anthropic>=0.35.0",
  "pillow": "Pillow>=10.4.0",
  "requests": "requests>=2.32.0",
  "httpx": "httpx>=0.27.0",
  "pydantic": "pydantic>=2.9.0",
  "python-dotenv": "python-dotenv>=1.0.0",
  "qrcode": "qrcode[pil]>=7.4.2",
};

function generateRequirementsTxt(pyPackages: string[]): string {
  const unique = [...new Set(pyPackages)];
  const lines: string[] = ["# requirements.txt — auto-generated by VibeMap"];

  for (const pkg of unique) {
    if (PY_PACKAGE_VERSIONS[pkg]) {
      lines.push(PY_PACKAGE_VERSIONS[pkg]);
    }
  }

  if (lines.length === 1) return ""; // 何も検出できなかった
  return lines.join("\n");
}

// ==================== メイン解析関数 ====================
export function analyzeStack(data: AnalysisData): AnalysisResult {
  const added = new Set<string>();
  const allNodes: TechNode[] = [];

  const addNode = (node: TechNode) => {
    if (!added.has(node.id)) {
      allNodes.push(node);
      added.add(node.id);
    }
  };

  let allJsPackages: string[] = [];
  let allPyPackages: string[] = [];

  // 1. package.json から検出
  if (data.packageJson) {
    const deps = extractDepsFromPackageJson(data.packageJson);
    packagesToTechNodes(deps).forEach(addNode);
    allJsPackages.push(...deps);
  }

  // 2. requirements.txt から検出
  if (data.requirementsTxt) {
    const pyPkgs = data.requirementsTxt
      .split("\n")
      .map(l => l.trim().split(/[>=<!\[]/)[0].toLowerCase())
      .filter(Boolean);
    allPyPackages.push(...pyPkgs);
    pythonPackagesToTechNodes(pyPkgs).forEach(addNode);
  }

  // 3. コアファイル内容から検出（★新機能）
  if (data.coreFileContents && Object.keys(data.coreFileContents).length > 0) {
    const { nodes, jsPackages, pyPackages } = coreFileContentsToTechNodes(data.coreFileContents);
    nodes.forEach(addNode);
    allJsPackages.push(...jsPackages);
    allPyPackages.push(...pyPackages);
    // importで検出したJSパッケージも変換
    packagesToTechNodes(jsPackages).forEach(addNode);
    pythonPackagesToTechNodes(pyPackages).forEach(addNode);
  }

  // 4. ファイルリストのパターンから検出
  if (data.fileList.length > 0) {
    fileListToTechNodes(data.fileList).forEach(addNode);
  }

  // 5. rawDeps （テキスト入力モード）
  if (data.rawDeps.length > 0) {
    packagesToTechNodes(data.rawDeps).forEach(addNode);
  }

  const connections = buildConnections(allNodes);
  const { type, label } = classifyProjectType(allNodes);
  const confidence = Math.min(95, 50 + allNodes.length * 7);

  // package.json / requirements.txt の自動生成
  const isIos = type.startsWith("ios-");

  const generatedPackageJson = !isIos && allJsPackages.length > 0
    ? generatePackageJson(data.projectName, [...new Set(allJsPackages)], allNodes)
    : undefined;

  const generatedRequirements = !isIos && allPyPackages.length > 0
    ? generateRequirementsTxt([...new Set(allPyPackages)])
    : undefined;

  const generatedSetupNotes = isIos
    ? generateIosSetupNotes(allNodes, data.projectName)
    : undefined;

  return {
    stack: allNodes,
    projectType: type,
    projectTypeLabel: label,
    confidence,
    connections,
    generatedPackageJson,
    generatedRequirements,
    generatedSetupNotes,
  };
}

// ==================== ファイルアップロードからAnalysisData生成 ====================
const NOISE_PATTERNS = [
  /\.DS_Store/, /[/\\]node_modules[/\\]/, /[/\\]\.git[/\\]/, 
  /[/\\]\.next[/\\]/, /[/\\]coverage[/\\]/, /[/\\]__pycache__[/\\]/,
  // 画像などは除外するが、exeやzipは成果物として残す場合があるため緩和
  /\.(png|jpe?g|gif|svg|ico|woff2?|ttf|eot|mp3|mp4|mov|webm|pdf|xlsx|docx)$/i,
  /package-lock\.json$/, /yarn\.lock$/, /pnpm-lock/,
];

// コアファイル — 内容を読み込む対象
const CORE_FILE_PATTERNS = [
  /package\.json$/,
  /requirements.*\.txt$/,
  /vite\.config\.(js|ts)$/,
  /next\.config\.(js|ts|mjs)$/,
  /tailwind\.config\.(js|ts|cjs)$/,
  /capacitor\.config\.(ts|js|json)$/,
  /index\.html?$/,
  /app\.(py|js|jsx|ts|tsx)$/,
  /main\.(py|js|jsx|ts|tsx)$/,
  /server\.(py|js|ts)$/,
  /src\/main\.(js|jsx|ts|tsx)$/,
  /src\/index\.(js|jsx|ts|tsx)$/,
  /src\/App\.(js|jsx|ts|tsx)$/,
  /\.github\/workflows\/.+\.ya?ml$/,
  /supabase\/.+\.sql$/,
  // iOS / Swift
  /\.swift$/,
  /\.entitlements$/,
  /Package\.swift$/,
  /Podfile$/,
  // Windows / Build
  /\.bat$/,
  /\.sh$/,
  /\.spec$/,
];

function isNoise(path: string): boolean {
  return NOISE_PATTERNS.some(p => p.test(path));
}

function isCoreFile(path: string): boolean {
  return CORE_FILE_PATTERNS.some(p => p.test(path));
}

export async function readFilesFromInput(fileList: FileList): Promise<AnalysisData> {
  const files = Array.from(fileList).filter(f => !isNoise(f.webkitRelativePath || f.name));

  let packageJson: Record<string, unknown> | undefined;
  let requirementsTxt: string | undefined;
  const fileNames: string[] = [];
  const coreFileContents: Record<string, string> = {};
  let projectName = "my-project";

  for (const file of files) {
    const path = (file.webkitRelativePath || file.name).replace(/\\/g, "/");
    fileNames.push(path);

    // コアファイルの内容を読み込む
    if (isCoreFile(path) && file.size < 200_000) {
      try {
        const text = await file.text();
        const shortPath = path.split("/").slice(1).join("/") || path; // 先頭のプロジェクト名フォルダを除去
        coreFileContents[shortPath] = text;

        if (/package\.json$/.test(path) && path.split("/").length <= 2) {
          try {
            packageJson = JSON.parse(text);
            projectName = (packageJson?.name as string) || projectName;
          } catch {}
        }
        if (/requirements.*\.txt$/i.test(path) && path.split("/").length <= 2) {
          requirementsTxt = text;
        }
      } catch {}
    }
  }

  // プロジェクト名をフォルダ名から取得
  if (projectName === "my-project" && fileNames.length > 0) {
    const topFolder = fileNames[0].split("/")[0];
    if (topFolder) projectName = topFolder;
  }

  const fileTree = buildTreeText(fileNames);

  return {
    projectName,
    fileTree,
    packageJson,
    requirementsTxt,
    fileList: fileNames,
    rawDeps: [],
    coreFileContents,
  };
}

// ==================== テキストツリーからAnalysisData生成 ====================
export function parseTreeText(text: string): AnalysisData {
  const lines = text.split("\n").filter(Boolean);
  const fileNames = lines.map(l => l.replace(/^[├└│─\s]+/, "").trim()).filter(Boolean);
  const rawDeps: string[] = [];

  for (const name of fileNames) {
    const lower = name.toLowerCase();
    if (lower.match(/react|next|vite|tailwind|supabase|stripe|vue|express|fastapi|streamlit|capacitor|prisma|firebase|openai|anthropic/)) {
      rawDeps.push(lower);
    }
  }

  return {
    projectName: "my-project",
    fileTree: text,
    fileList: fileNames,
    rawDeps,
    coreFileContents: {},
  };
}

// ==================== ツリー表示テキスト生成 ====================
function buildTreeText(files: string[]): string {
  // フォルダ構造をツリー形式で再構築
  const roots = new Map<string, Set<string>>();

  for (const file of files.slice(0, 200)) {
    const parts = file.split("/");
    if (parts.length < 2) continue;
    const root = parts[0];
    if (!roots.has(root)) roots.set(root, new Set());
    roots.get(root)!.add(parts.slice(1).join("/"));
  }

  const lines: string[] = [];
  for (const [root, children] of roots) {
    lines.push(`${root}/`);
    const sorted = [...children].sort();
    sorted.slice(0, 50).forEach((child, i) => {
      const isLast = i === Math.min(sorted.length, 50) - 1;
      lines.push(`${isLast ? "└" : "├"}── ${child}`);
    });
    if (sorted.length > 50) lines.push(`└── ... (${sorted.length - 50}件省略)`);
    break; // 最初のフォルダのみ
  }

  return lines.join("\n");
}
