import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { analyzePortfolioImages } from "@/lib/deepseekVision";
import { generatePortfolioReport } from "@/lib/glm";
import { buildUploadViews, portfolioCourseKeys } from "@/lib/portfolio";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const report = await prisma.learningReport.findUnique({ where: { userId: session.userId } });
  if (!report) return NextResponse.json({ report: null });
  return NextResponse.json({
    report: {
      id: report.id,
      shareToken: report.shareToken,
      status: report.status,
      data: JSON.parse(report.reportJson),
      updatedAt: report.updatedAt.toISOString(),
    },
  });
}

export async function POST() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    const uploads = await prisma.portfolioUpload.findMany({ where: { userId: session.userId } });
    const uploadViews = buildUploadViews(uploads);
    const completed = uploadViews.filter((item) => item.imageUrl);
    if (completed.length !== portfolioCourseKeys.length) {
      return NextResponse.json({ error: "请先上传四个阶段的实体作品照片" }, { status: 400 });
    }

    const existing = await prisma.learningReport.findUnique({ where: { userId: session.userId } });
    const vision = await analyzePortfolioImages(uploadViews);
    const data = await generatePortfolioReport({
      studentName: user?.displayName || session.displayName || "同学",
      uploads: uploadViews,
      vision,
    });

    const report = await prisma.learningReport.upsert({
      where: { userId: session.userId },
      update: { reportJson: JSON.stringify(data), status: "ready" },
      create: {
        userId: session.userId,
        shareToken: existing?.shareToken || randomUUID().replace(/-/g, ""),
        status: "ready",
        reportJson: JSON.stringify(data),
      },
    });

    return NextResponse.json({
      report: {
        id: report.id,
        shareToken: report.shareToken,
        status: report.status,
        data,
        updatedAt: report.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Portfolio report generation failed:", err);
    const message = err instanceof Error ? err.message : "报告生成失败，请重试";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
