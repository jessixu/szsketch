"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, type HistoryItem } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BrandMark from "@/components/BrandMark";
import TextureBox from "@/components/printmaking/TextureBox";
import PrintSVG from "@/components/printmaking/PrintSVG";
import { getMainType } from "@/data/moods";
import { getCourseTitle } from "@/lib/courseConfig";

export default function HistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  useEffect(() => {
    api
      .history(page)
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <main className="min-h-screen bg-[#fbf6ee] p-6 text-stone-900">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex gap-4">
            <BrandMark size="md" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">生成记录</h1>
              <p className="mt-1 text-lg text-stone-600">共 {total} 条记录</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-stone-200 bg-[#f4eadc]"
            onClick={() => router.push("/")}
          >
            返回首页
          </Button>
        </header>

        {/* Selected detail */}
        {selected && (
          <Card className="border-[#eadcc8] bg-white shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold">记录详情</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  关闭
                </button>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {getHistoryImages(selected).length > 0 ? (
                  <div className="grid gap-3">
                    {getHistoryImages(selected).map((image) => (
                      <div key={`${image.label}-${image.url}`} className="overflow-hidden rounded-xl border border-stone-200">
                        <img src={image.url} alt={image.label} className="w-full" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <TextureBox className="h-64">
                    <PrintSVG type={getMainType(selected.origin)} large />
                  </TextureBox>
                )}
                <div className="space-y-3">
                  <p><b>原形：</b>{selected.origin}</p>
                  <p><b>课程：</b>{getCourseTitle(selected.courseKey)}</p>
                  <p><b>气质：</b>{selected.mood}</p>
                  <p><b>纹样：</b>{JSON.parse(selected.patterns).join("、")}</p>
                  {selected.notes && <p><b>修改说明：</b>{selected.notes}</p>}
                  {selected.description && (
                    <div className="rounded-lg bg-[#fffaf2] p-3">
                      <p><b>效果分析：</b></p>
                      <p className="mt-1 text-sm leading-6 text-stone-600 whitespace-pre-line">{selected.description}</p>
                    </div>
                  )}
                  <p className="text-xs text-stone-400"><b>Prompt：</b>{selected.prompt}</p>
                  <p className="text-sm text-stone-400">
                    {new Date(selected.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-stone-400">加载中…</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-stone-400">还没有生成记录</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              去创作
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className="cursor-pointer rounded-xl border border-stone-200 bg-white p-3 shadow-sm transition hover:shadow-md"
              >
                {getHistoryImages(item)[0] ? (
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={getHistoryImages(item)[0].url}
                      alt={item.origin}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <TextureBox className="aspect-square">
                    <PrintSVG type={getMainType(item.origin)} />
                  </TextureBox>
                )}
                <div className="mt-2">
                  <p className="font-semibold text-stone-700">{item.origin} · {item.mood}</p>
                  <p className="text-xs text-[#8a6a43]">{getCourseTitle(item.courseKey)}</p>
                  <p className="text-xs text-stone-400">
                    {new Date(item.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => {
                setLoading(true);
                setPage(page - 1);
              }}
            >
              上一页
            </Button>
            <span className="flex items-center px-4 text-stone-500">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => {
                setLoading(true);
                setPage(page + 1);
              }}
            >
              下一页
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function getHistoryImages(item: HistoryItem) {
  if (item.outputImages) {
    try {
      const parsed = JSON.parse(item.outputImages);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (image): image is { label: string; url: string } =>
            image && typeof image.label === "string" && typeof image.url === "string",
        );
      }
    } catch {
      // Fall back to the legacy single image field.
    }
  }
  return item.imageUrl ? [{ label: "生成图", url: item.imageUrl }] : [];
}
