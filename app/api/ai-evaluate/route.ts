import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult } from "@/lib/analyzer";
import type { PatternMatch } from "@/lib/patterns";

interface EvaluateRequest {
  analysis: AnalysisResult;
  pattern: PatternMatch;
  projectName: string;
  fileTree: string;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-Gemini-Api-Key") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini APIキーが設定されていません。ヘッダーの🔑ボタンからキーを設定してください。" },
      { status: 401 }
    );
  }

  try {
    const body: EvaluateRequest = await req.json();
    const { analysis, pattern, projectName, fileTree } = body;

    const stackSummary = analysis.stack
      .map(n => `${n.name} (${n.category})`)
      .join(", ");

    const prompt = `あなたはシニアソフトウェアアーキテクトです。以下のプロジェクト構成を分析して、プロフェッショナルな評価レポートを作成してください。

## プロジェクト情報
- プロジェクト名: ${projectName}
- プロジェクトタイプ: ${analysis.projectTypeLabel}
- 技術スタック: ${stackSummary}
- パターン分類: ${pattern.patternName}
- スケーラビリティスコア: ${pattern.scalabilityScore}/10

## ファイル構造（抜粋）
\`\`\`
${fileTree.slice(0, 2000)}
\`\`\`

【⚠️ 構成変更時の重要ルール（厳守すること）】
・安易にファイルを統合しないでください。特にファイル名が似ていても機能が異なる場合は（例: en版, pro版など）、別々のファイルとして維持することを推奨してください。
・ディレクトリ移動を伴う整理案（src/フォルダへの移動など）を出す場合は、必ず「コード内のインポートパスや設定ファイル内のパス修正が必要になる」というリスクを明記してください。
・リファクタリング（ロジックの抽出）が必要な整理と、単なる不要ファイル削除（ゴミ掃除）を明確に分けて提案してください。
・実ロジックが書かれているファイルを「空ファイル（サービス層）」に移動させるような、中身が伴わない提案は禁止します。

【⚠️ 構成変更時の重要ルール（厳守すること）】
・整理案は必ず以下の2つのフェーズに分けて提示してください：
  - Phase 1（今すぐ安全にできること）: 設定ファイルの作成、ドキュメントの移動、単純な定数修正など、コードの実行に影響を与えない範囲。
  - Phase 2（コーディングを伴うリファクタリング）: ロジックの抽出、共通クラスの作成、ディレクトリ構造の大幅変更、ビルドスクリプト(.spec等)の修正が必要なもの。
・ディレクトリ移動（src/への整理など）を提案する場合は、必ず「importパスの全面書き換え」や「Jinja2/FastAPIのテンプレートパス修正」が必要であることを警告してください。
・「なぜリスクがあるのか」を技術的背景（例：PyInstallerのパス解決、相対インポートの仕組み）を含めて具体的に説明してください。

【🕵️ アーキテクトの思考プロセス（自己批判）】
回答を作成する前に、以下の項目を自分の頭の中でコードレビューしてください：
1. 「空ファイル問題」: services/ 等のフォルダにあるファイルの中身は本当にあるか？（1行しかない空ファイルなら「ロジックなし」と正直に書く）
2. 「ビルドの急所」: .spec ファイルや Dockerfile, CI設定ファイルはないか？それらに書かれたパス（Analysis, datas等）を壊さないか？
3. 「パスの二重性」: 実行時(SCRIPT_DIR)と開発時のパス解決の仕組みが考慮されているか？

## 評価レポートを以下の形式で日本語で作成してください：

### ✅ 構成の安全性評価（アーキテクチャ・レビュー）
提案内容の妥当性を、エンジニア視点で厳しく評価してください：
- 正しい判断（高く評価できる点）
- 具体的リスク（.spec のパス、インポートパス、特定のコード行への影響など）
- 未解決の懸念点（ロジックが空である、依存関係が不明など）

### 📊 実施順序・リスク管理テーブル
以下の項目を網羅したテーブル（表）を作成してください：
| 優先度 | 作業内容 | 難易度 | リスク | 理由・注意点 |
| :--- | :--- | :--- | :--- | :--- |
| 1 | ... | 低/中/高 | 低/中/高 | ... |

### 🛠️ 推奨アクション：2フェーズ・ロードマップ

#### Phase 1：今すぐ安全にできる（リスク低）
環境設定、ドキュメント、不要ファイルのクリーンアップなど。

#### Phase 2：コーディングとビルド確認が必要（リスク中〜高）
ロジック抽出、パス書き換え、ビルド設定(.spec)の修正を伴うもの。

### 🔮 未来の構成案（詳細解説付き）
理想的なツリー形式。各行に「（要パス修正）」「（ロジック実装が必要）」等の注釈を付記。

### 📚 技術の深掘り解説
使用技術を初心者向けに解説。

---
回答は常に「壊さないこと（Safety First）」を最優先とし、提示された検証結果のように『何が安全で何が危ないか』を具体的・技術的に解説してください。`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: "あなたは経験豊富なソフトウェアアーキテクトです。プロジェクトの技術構成を分析し、実践的で具体的なアドバイスを提供します。回答は常に日本語で、Markdownフォーマットを使用してください。",
    });

    console.log("Generating AI evaluation (with retry logic)...");
    
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

    if (!result) throw new Error("AI評価の取得に失敗しました");
    
    const response = await result.response;
    const report = response.text();
    console.log("AI evaluation generated successfully.");

    return NextResponse.json({ report });
  } catch (e) {
    console.error("AI evaluate error:", e);
    const message = e instanceof Error ? e.message : "AI評価でエラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
