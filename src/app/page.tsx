import { redirect } from "next/navigation";
import CourseHomeClient from "@/components/course/CourseHomeClient";
import { getSession } from "@/lib/auth";

export default async function CourseHomePage() {
  const session = await getSession();

  if (!session.userId) {
    redirect("/login");
  }

  return <CourseHomeClient user={{ displayName: session.displayName || "同学" }} />;
}
