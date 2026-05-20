import { redirect } from "next/navigation";
import CourseHomeClient from "@/components/course/CourseHomeClient";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildUploadViews, portfolioCourseKeys } from "@/lib/portfolio";

export default async function CourseHomePage() {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  const [uploads, report] = await Promise.all([
    prisma.portfolioUpload.findMany({ where: { userId: session.userId }, orderBy: { updatedAt: "desc" } }),
    prisma.learningReport.findUnique({ where: { userId: session.userId } }),
  ]);
  const uploadViews = buildUploadViews(uploads);
  const completedCount = uploadViews.filter((item) => item.imageUrl).length;

  return (
    <CourseHomeClient
      user={{ displayName: session.displayName || "同学" }}
      initialPortfolio={{
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
      }}
    />
  );
}
