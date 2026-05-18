"use client";

import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { courseList } from "@/lib/courseConfig";

interface UserInfo {
  displayName: string;
}

export default function CourseHomeClient({ user }: { user: UserInfo }) {
  const router = useRouter();

  const handleLogout = async () => {
    await api.logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#fbf6ee] p-6 text-stone-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <BrandMark size="md" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">印刻奇旅 · 版画创意智造工坊</h1>
              <p className="mt-1 text-lg text-stone-600">
                {user.displayName}，请选择本节课的创作工具
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-stone-200 bg-[#f4eadc]" onClick={() => router.push("/history")}>
              生成记录
            </Button>
            <Button variant="outline" className="border-stone-200 bg-[#f4eadc] text-stone-600" onClick={handleLogout}>
              退出
            </Button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {courseList.map((course) => (
            <Card key={course.key} className="border-[#eadcc8] bg-white/90 shadow-sm">
              <CardContent className="flex min-h-64 flex-col p-5">
                <div className="text-sm font-semibold text-[#8a6a43]">{course.stage}</div>
                <h2 className="mt-3 text-2xl font-bold leading-tight text-stone-900">{course.title}</h2>
                <p className="mt-2 text-sm text-stone-500">{course.subtitle}</p>
                <p className="mt-5 flex-1 text-sm leading-6 text-stone-600">
                  固定课堂提示词，学生通过点选、上传和下载完成对应阶段的版画创作辅助。
                </p>
                <Button className="mt-6 bg-[#27221c] text-[#f6e2b8] hover:bg-[#3b3025]" onClick={() => router.push(course.href)}>
                  进入工具
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <footer className="text-sm text-stone-500">
          提示：生成结果仅供课堂学习参考，请结合教师指导完成手绘、转印、刻制与印制。
        </footer>
      </div>
    </main>
  );
}
