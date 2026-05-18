import CourseToolClient from "@/components/course/CourseToolClient";
import { courseList, type CourseKey } from "@/lib/courseConfig";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseKey: CourseKey }>;
}) {
  const { courseKey } = await params;
  const course = courseList.find((item) => item.key === courseKey);
  return <CourseToolClient courseKey={course?.key || "shanhaijing"} />;
}
