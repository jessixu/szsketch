import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildUploadViews, portfolioCourseKeys } from "@/lib/portfolio";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const [uploads, report] = await Promise.all([
    prisma.portfolioUpload.findMany({ where: { userId: session.userId }, orderBy: { updatedAt: "desc" } }),
    prisma.learningReport.findUnique({ where: { userId: session.userId } }),
  ]);
  const uploadViews = buildUploadViews(uploads);
  const completedCount = uploadViews.filter((item) => item.imageUrl).length;

  return NextResponse.json({
    uploads: uploadViews,
    completedCount,
    requiredCount: portfolioCourseKeys.length,
    ready: completedCount === portfolioCourseKeys.length,
    report: report
      ? {
          id: report.id,
          shareToken: report.shareToken,
          status: report.status,
          updatedAt: report.updatedAt.toISOString(),
        }
      : null,
  });
}
