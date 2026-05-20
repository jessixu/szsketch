import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { config } from "@/lib/config";
import { courseList, type CourseKey } from "@/lib/courseConfig";

export const portfolioCourseKeys: CourseKey[] = ["black-white", "shanhaijing", "free", "color"];

export const titleLibrary = [
  { title: "刀锋诗人", reason: "线条细腻，情感丰富，刻刀像笔一样表达内心。" },
  { title: "黑白炼金师", reason: "对黑白关系有天然的敏感，构图干净有力。" },
  { title: "神兽召唤师", reason: "对传统意象有独特的理解，想象力强。" },
  { title: "印迹探险家", reason: "勇于尝试，每件作品都在突破上一件的边界。" },
  { title: "沉默的匠人", reason: "不声不响，但作品有一种安静的力量。" },
  { title: "色彩编织者", reason: "套色阶段表现突出，对色彩关系有直觉。" },
];

export interface PortfolioUploadView {
  courseKey: CourseKey;
  stage: string;
  title: string;
  imageUrl: string | null;
  note: string;
  uploadedAt: string | null;
}

export interface PortfolioReportData {
  studentName: string;
  completedDate: string;
  uploads: PortfolioUploadView[];
  stageSummaries: Array<{ courseKey: CourseKey; summary: string }>;
  stageAnalyses?: Array<{
    courseKey: string;
    composition: string;
    line: string;
    toneOrColor: string;
    feeling: string;
    highlight: string;
  }>;
  overallStyle?: string;
  overallComment: string;
  title: string;
  titleReason: string;
  closing: string;
}

export function buildUploadViews(
  uploads: Array<{ courseKey: string; imageUrl: string; note: string; updatedAt: Date }>,
): PortfolioUploadView[] {
  return portfolioCourseKeys.map((courseKey) => {
    const course = courseList.find((item) => item.key === courseKey)!;
    const upload = uploads.find((item) => item.courseKey === courseKey);
    return {
      courseKey,
      stage: course.stage,
      title: course.title,
      imageUrl: upload?.imageUrl || null,
      note: upload?.note || "",
      uploadedAt: upload?.updatedAt.toISOString() || null,
    };
  });
}

export async function savePortfolioImage(userId: string, courseKey: CourseKey, dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,(.+)$/);
  if (!match) throw new Error("请上传 JPG / PNG / WebP 图片");

  const mime = match[1];
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 8 * 1024 * 1024) throw new Error("图片不能超过 8MB，请压缩后再上传");

  const dir = join(config.uploadDir, "portfolio");
  await mkdir(dir, { recursive: true });
  const filename = `${userId}_${courseKey}_${Date.now()}_${randomUUID().slice(0, 8)}.${ext}`;
  await writeFile(join(dir, filename), buffer);
  return `/uploads/portfolio/${filename}`;
}

export async function readUploadAsDataUrl(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/")) throw new Error("仅支持读取本地上传图片");
  const relative = imageUrl.replace(/^\/uploads\//, "");
  const fullPath = join(config.uploadDir, relative);
  const buffer = await readFile(fullPath);
  return `data:${getMimeFromPath(imageUrl)};base64,${buffer.toString("base64")}`;
}

export function parseCourseKey(value: unknown): CourseKey {
  if (typeof value === "string" && portfolioCourseKeys.includes(value as CourseKey)) return value as CourseKey;
  throw new Error("未知课程阶段");
}

function getMimeFromPath(filePath: string) {
  if (filePath.endsWith(".png")) return "image/png";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}
