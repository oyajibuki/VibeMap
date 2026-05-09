import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface FollowUpRequest {
  question: string;
  projectName: string;
  techStack: string;
  originalReport: string;
  history: Array<{ q: string; a: string }>;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("X-Gemini-Api-Key") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。ヘッダーの🔑ボタンから設定してください。" },
      { status: 401 }
    );
  }

  try {
    const body: FollowUpRequest = await req.json();
    const { question, projectName, techStack, originalReport, history } = body;

    const historyText = history.length > 0
      ? "\n## これまでのやり取り:\n" + history.map(h => `Q: ${h.q}\nA: ${h.a}`).join("\n\n")
      : "";

    const prompt = `あなたはシニアソフトウェアアーキテクトです。以下のプロジェクトについて事前の診断を行いました。その内容を踏まえて、ユーザーの追加質問に具体的かつ実践的に答えてください。

## プロジェクト: ${projectName}
## 技術スタック: ${techStack}

## 事前の診断レポート（要約）:
${originalReport.slice(0, 2000)}
${historyText}

---

## ユーザーの追加質問:
${question}

日本語でMarkdownフォーマットを使って回答してください。具体的なコード例やファイル名を含めると親切です。`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: "あなたは経験豊富なソフトウェアアーキテクトです。ユーザーのプロジェクトに対して実践的で具体的なアドバイスを提供します。回答は常に日本語で、Markdownフォーマットを使用してください。",
    });

    let result;
    let retries = 3;
    while (retries > 0) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (e: any) {
        if ((e.status === 503 || e.status === 429) && retries > 1) {
          const delay = e.status === 429 ? 5000 : 3000;
          await new Promise(resolve => setTimeout(resolve, delay));
          retries--;
          continue;
        }
        throw e;
      }
    }

    if (!result) throw new Error("回答の取得に失敗しました");
    const answer = result.response.text();

    return NextResponse.json({ answer });
  } catch (e) {
    console.error("AI follow-up error:", e);
    const message = e instanceof Error ? e.message : "エラーが発生しました";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
