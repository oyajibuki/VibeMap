import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export interface FileAnalysis {
  filename: string;
  role: string;
  keyPoints: string[];
  highlight: string;
}

function fileScore(filename: string): number {
  const lower = filename.toLowerCase();
  const base = lower.split("/").pop() ?? lower;

  if (base.endsWith("app.swift")) return 100;
  if (base === "contentview.swift") return 95;
  if (base.includes("viewmodel") && base.endsWith(".swift")) return 90;
  if (base.includes("model") && base.endsWith(".swift")) return 85;
  if (base.endsWith(".swift")) return 70;
  if (base === "app.tsx" || base === "app.jsx") return 80;
  if (base === "app.ts" || base === "app.js") return 75;
  if (base === "main.py" || base === "app.py") return 75;
  if (base === "index.html") return 60;
  if (base.endsWith(".tsx") || base.endsWith(".jsx")) return 55;
  if (base.endsWith(".ts") || base.endsWith(".js")) return 50;
  if (base.endsWith(".py")) return 50;
  if (base.includes("vite.config") || base.includes("next.config")) return 40;
  return 20;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-Gemini-Api-Key") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini APIキーが設定されていません。ヘッダーの🔑ボタンからキーを設定してください。" },
      { status: 401 }
    );
  }

  const { coreFileContents, projectName } = await req.json();

  if (!coreFileContents || Object.keys(coreFileContents).length === 0) {
    return NextResponse.json({ error: "解析するファイルがありません" }, { status: 400 });
  }

  const sorted = (Object.entries(coreFileContents as Record<string, string>))
    .sort((a, b) => fileScore(b[0]) - fileScore(a[0]))
    .slice(0, 5);

  const filesSection = sorted
    .map(([path, content]) => {
      const truncated = content.length > 3000 ? content.slice(0, 3000) + "\n...(省略)" : content;
      return `### ${path}\n\`\`\`\n${truncated}\n\`\`\``;
    })
    .join("\n\n");

  const prompt = `プロジェクト「${projectName || "不明"}」の主要なソースファイルをシニアエンジニアとして解析してください。

各ファイルについて、以下を日本語で簡潔に説明してください：
1. **役割・目的**: このファイルが果たす役割（1〜2文）
2. **主な処理**: 重要な関数・クラス・処理の流れ（3〜5点の箇条書き）
3. **ハイライト**: 技術的に注目すべき実装・設計パターン（1〜2文）

以下のJSON形式のみで返答してください（JSONの外側に文字を入れないこと）：
[
  {
    "filename": "ファイルのパス",
    "role": "役割の説明",
    "keyPoints": ["処理1", "処理2", "処理3"],
    "highlight": "注目ポイントの説明"
  }
]

---

${filesSection}`;

  try {
    console.log("Generating code analysis (with retry logic)...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (e: any) {
        if ((e.status === 503 || e.status === 429) && retries > 1) {
          const delay = e.status === 429 ? 5000 : 3000;
          console.log(`Model busy or rate limited (${e.status}), retrying in ${delay}ms... (${retries - 1} left)`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          continue;
        }
        throw e;
      }
    }

    if (!result) throw new Error("コード解析の取得に失敗しました");

    const response = await result.response;
    const text = response.text();
    console.log("AI response received for code analysis.");

    let analyses: FileAnalysis[];
    try {
      // Markdownのコードブロック記法があれば中身を抽出
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : text;
      analyses = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Raw text:", text);
      return NextResponse.json({ error: "AIレスポンスの形式が正しくありません" }, { status: 500 });
    }

    return NextResponse.json({
      analyses,
      selectedFiles: sorted.map(([path]) => path),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "不明なエラー";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
