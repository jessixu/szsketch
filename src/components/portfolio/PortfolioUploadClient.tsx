"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { api, type PortfolioState } from "@/lib/api";
import { courseList, type CourseKey } from "@/lib/courseConfig";
import { getCourseThemeStyle } from "@/lib/courseThemes";

export default function PortfolioUploadClient({ courseKey }: { courseKey: CourseKey }) {
  const router = useRouter();
  const course = courseList.find((item) => item.key === courseKey) || courseList[0];
  const themeStyle = useMemo(() => getCourseThemeStyle(courseKey), [courseKey]);
  const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
  const [imageData, setImageData] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.portfolio().then((state) => {
      setPortfolio(state);
      const upload = state.uploads.find((item) => item.courseKey === courseKey);
      setNote(upload?.note || "");
    }).catch(() => setError("读取上传状态失败"));
  }, [courseKey]);

  const currentUpload = portfolio?.uploads.find((item) => item.courseKey === courseKey);
  const preview = imageData || currentUpload?.imageUrl || "";

  const save = async () => {
    if (!imageData && !currentUpload?.imageUrl) {
      setError("请先上传作品照片");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.uploadPortfolioWork({ courseKey, imageData, note });
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败，请重试");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--course-page)] p-6 text-stone-900" style={themeStyle}>
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex items-start gap-4">
          <BrandMark size="md" />
          <div>
            <p className="text-sm font-semibold text-[var(--course-primary)]">{course.stage}</p>
            <h1 className="font-heading text-3xl font-bold text-[var(--course-primary-text)]">上传本阶段作品</h1>
            <p className="mt-1 text-lg text-stone-600">{course.title}</p>
          </div>
        </header>

        <section className="rounded-2xl border border-[var(--course-border)] bg-white/90 p-5 shadow-sm">
          <div className="rounded-xl bg-[var(--course-panel)] p-4 text-sm leading-6 text-[var(--course-primary-text)]">
            用手机拍下你的实体作品，上传到这里。光线均匀、作品铺平拍摄效果最佳。
          </div>

          <label className="mt-5 flex min-h-72 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--course-border)] bg-[var(--course-panel)] text-center transition hover:border-[var(--course-border-strong)]">
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setError("");
                try {
                  setImageData(await fileToDataUrl(file));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "图片读取失败");
                }
                event.target.value = "";
              }}
            />
            {preview ? (
              <div className="w-full">
                <div className="flex max-h-[520px] items-center justify-center p-3">
                  <img src={preview} alt="作品预览" className="max-h-[480px] w-auto max-w-full rounded-xl object-contain shadow-sm" />
                </div>
                <div className="border-t border-[var(--course-border)] px-3 py-2 text-sm font-medium text-[var(--course-primary)]">
                  点击重新拍摄或替换照片
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--course-border)] bg-white text-3xl font-semibold text-[var(--course-primary)]">↑</div>
                <div className="mt-4 text-base font-semibold text-stone-800">拍照或从相册选择作品照片</div>
                <div className="mt-2 text-sm text-stone-500">支持 JPG / PNG / WebP</div>
              </div>
            )}
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-stone-700">这件作品我最满意的地方是——</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 120))}
              maxLength={120}
              placeholder="例如：我喜欢这张画里的云纹和主体姿态"
              className="mt-2 h-28 w-full resize-none rounded-xl border border-[var(--course-border)] bg-[var(--course-panel)] p-3 text-sm outline-none focus:border-[var(--course-border-strong)]"
            />
          </label>
          <div className="mt-1 text-right text-sm text-stone-400">{note.length}/120</div>
          {error && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="h-11 rounded-xl bg-[var(--course-primary)] text-[var(--course-button-text)] hover:bg-[var(--course-primary-hover)]" onClick={save} disabled={saving}>
              {saving ? "正在保存" : "保存作品"}
            </Button>
            <Button variant="outline" className="h-11 rounded-xl border-[var(--course-border)] bg-white" onClick={() => router.push("/")}>
              返回首页
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_IMAGE_EDGE = 1600;
const JPEG_QUALITY = 0.84;

async function fileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("请上传图片文件");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("图片不能超过20MB，请先压缩后再上传");
  if (typeof createImageBitmap !== "function") return readOriginalDataUrl(file);
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("图片处理失败，请重试");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

function readOriginalDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}
