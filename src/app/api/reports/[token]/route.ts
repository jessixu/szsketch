import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const report = await prisma.learningReport.findUnique({ where: { shareToken: token } });
  if (!report) return NextResponse.json({ error: "报告不存在" }, { status: 404 });
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
