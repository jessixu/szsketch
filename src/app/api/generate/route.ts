import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { config } from "@/lib/config";
import { buildPrompt } from "@/lib/promptBuilder";
import { getPatterns } from "@/data/moods";
import { generateDescription } from "@/lib/glm";
import axios from "axios";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { origin, mood, notes } = await request.json();
    if (!origin || !mood) {
      return NextResponse.json({ error: "请选择原形和气质" }, { status: 400 });
    }

    const patterns = getPatterns(mood);
    const { prompt, negativePrompt } = buildPrompt({ origin, mood, patterns, notes });

    let imageUrl: string | null = null;
    let imageError: string | null = null;

    if (config.aiAvailable) {
      try {
        const { generateImage } = await import("@/lib/seedream");
        const result = await generateImage(prompt, negativePrompt);
        imageUrl = result.imageUrl;
      } catch (err) {
        imageError = getGenerateImageErrorMessage(err);
        console.error("Seedream generation failed:", imageError);
      }
    }

    // Generate description with GLM
    const description = await generateDescription({ origin, mood, patterns });

    const history = await prisma.history.create({
      data: {
        userId: session.userId,
        origin,
        mood,
        patterns: JSON.stringify(patterns),
        notes: notes || "",
        prompt,
        imageUrl,
        description,
        aiAvailable: config.aiAvailable,
      },
    });

    return NextResponse.json({
      id: history.id,
      imageUrl,
      prompt,
      description,
      aiAvailable: config.aiAvailable,
      imageError,
    });
  } catch {
    return NextResponse.json({ error: "生成失败，请重试" }, { status: 500 });
  }
}

function getGenerateImageErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data
      ? JSON.stringify(err.response.data).slice(0, 240)
      : err.message;
    if (err.response?.status) return `生图服务返回 ${err.response.status}：${detail}`;
  }
  if (err instanceof Error) {
    const code = "code" in err ? String(err.code) : "";
    if (code === "ECONNRESET") return "生图服务网络连接被重置，请稍后重试";
    if (code === "ETIMEDOUT" || code === "ECONNABORTED") return "生图服务响应超时，请稍后重试";
    return err.message || "生图服务暂时不可用，请稍后重试";
  }
  return "生图服务暂时不可用，请稍后重试";
}
