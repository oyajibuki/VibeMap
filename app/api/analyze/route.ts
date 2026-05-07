import { NextRequest, NextResponse } from "next/server";
import { analyzeStack, type AnalysisData } from "@/lib/analyzer";
import { matchPattern } from "@/lib/patterns";

export async function POST(req: NextRequest) {
  try {
    const data: AnalysisData = await req.json();

    if (!data.fileList && !data.rawDeps && !data.packageJson && !data.requirementsTxt) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    const analysis = analyzeStack(data);
    const pattern = matchPattern(analysis.projectType);

    return NextResponse.json({
      analysis,
      pattern,
      projectName: data.projectName || "my-project",
      fileTree: data.fileTree || "",
    });
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
