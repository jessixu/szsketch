import PortfolioUploadClient from "@/components/portfolio/PortfolioUploadClient";
import { portfolioCourseKeys } from "@/lib/portfolio";
import type { CourseKey } from "@/lib/courseConfig";

export default async function PortfolioUploadPage({ params }: { params: Promise<{ courseKey: string }> }) {
  const { courseKey } = await params;
  const key = portfolioCourseKeys.includes(courseKey as CourseKey) ? (courseKey as CourseKey) : "black-white";
  return <PortfolioUploadClient courseKey={key} />;
}
