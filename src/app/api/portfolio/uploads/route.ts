import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { parseCourseKey, savePortfolioImage } from "@/lib/portfolio";

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const body = await request.json();
    const courseKey = parseCourseKey(body.courseKey);
    const imageData = typeof body.imageData === "string" ? body.imageData : "";
    const note = typeof body.note === "string" ? body.note.trim().slice(0, 120) : "";
    const existing = await prisma.portfolioUpload.findUnique({
      where: { userId_courseKey: { userId: session.userId, courseKey } },
    });

    const imageUrl = imageData ? await savePortfolioImage(session.userId, courseKey, imageData) : existing?.imageUrl;
    if (!imageUrl) throw new Error("请先上传作品照片");
    const upload = await prisma.portfolioUpload.upsert({
      where: { userId_courseKey: { userId: session.userId, courseKey } },
      update: { imageUrl, note },
      create: { userId: session.userId, courseKey, imageUrl, note },
    });
    await prisma.learningReport.updateMany({ where: { userId: session.userId }, data: { status: "stale" } });

    return NextResponse.json({
      courseKey,
      imageUrl: upload.imageUrl,
      note: upload.note,
      uploadedAt: upload.updatedAt.toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "上传失败，请重试";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
