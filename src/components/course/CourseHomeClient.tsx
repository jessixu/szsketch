"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, type PortfolioState } from "@/lib/api";
import { courseList } from "@/lib/courseConfig";
import { getCourseThemeStyle } from "@/lib/courseThemes";

interface UserInfo {
  displayName: string;
}

export default function CourseHomeClient({
  user,
  initialPortfolio,
}: {
  user: UserInfo;
  initialPortfolio: PortfolioState | null;
}) {
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(initialPortfolio);
  const [portfolioLoading, setPortfolioLoading] = useState(!initialPortfolio);
  const [portfolioError, setPortfolioError] = useState("");

  useEffect(() => {
    api.portfolio()
      .then((state) => {
        setPortfolio(state);
        setPortfolioError("");
      })
      .catch(() => {
        setPortfolio(null);
        setPortfolioError("暂时无法读取上传进度，可以先继续上传作品");
      })
      .finally(() => setPortfolioLoading(false));
  }, []);

  const openPortfolioEntry = () => {
    router.push(portfolioEntryHref);
  };

  const nextMissingUpload = portfolio?.uploads.find((upload) => !upload.imageUrl);
  const portfolioEntryHref = portfolio?.ready
    ? portfolio.report?.status === "ready" ? "/portfolio/report" : "/portfolio/report/generating"
    : `/portfolio/upload/${nextMissingUpload?.courseKey || "black-white"}`;
  const portfolioEntryLabel = portfolio?.ready
    ? portfolio.report?.status === "ready" ? "查看我的专属报告" : "生成我的专属报告"
    : portfolio?.completedCount ? "继续上传作品" : "开始上传作品";

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
            <Card
              key={course.key}
              className="border-[var(--course-border)] bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[var(--course-shadow)]"
              style={getCourseThemeStyle(course.key)}
            >
              <CardContent className="flex min-h-64 flex-col p-5">
                <div className="text-sm font-semibold text-[var(--course-primary)]">{course.stage}</div>
                <h2 className="mt-3 font-heading text-2xl font-bold leading-tight text-[var(--course-primary-text)]">{course.title}</h2>
                <p className="mt-2 text-sm text-stone-500">{course.subtitle}</p>
                <p className="mt-5 line-clamp-4 min-h-24 text-sm leading-6 text-stone-600">{course.description}</p>
                <Button className="mt-6 bg-[var(--course-primary)] text-[var(--course-button-text)] hover:bg-[var(--course-primary-hover)]" onClick={() => router.push(course.href)}>
                  进入工具
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-2xl border border-[#eadcc8] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-heading text-2xl font-bold text-[#6f4b28]">印迹留存 · 查看我的创作报告</div>
              <p className="mt-1 text-sm text-stone-500">
                {portfolio
                  ? `已完成 ${portfolio.completedCount}/${portfolio.requiredCount} 件作品上传`
                  : portfolioLoading
                    ? "正在读取作品上传进度"
                    : portfolioError}
              </p>
            </div>
            <a
              href={portfolioEntryHref}
              className={`inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-medium transition ${
                portfolio?.ready
                  ? "bg-[#6f4b28] text-[#fff3d7] hover:bg-[#7d5730]"
                  : "border border-[#eadcc8] bg-[#f4eadc] text-[#6f4b28] hover:bg-[#f6ecdc]"
              }`}
              onClick={(event) => {
                event.preventDefault();
                openPortfolioEntry();
                window.location.href = portfolioEntryHref;
              }}
            >
              {portfolioEntryLabel}
            </a>
          </div>
        </section>

        <footer className="text-sm text-stone-500">
          提示：生成结果仅供课堂学习参考，请结合教师指导完成手绘、转印、刻制与印制。
        </footer>
      </div>
    </main>
  );
}
