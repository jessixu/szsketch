import axios from "axios";
import { titleLibrary, type PortfolioReportData, type PortfolioUploadView } from "@/lib/portfolio";
import type { VisionAnalysis } from "@/lib/deepseekVision";

const GLM_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const GLM_TOKEN = process.env.GLM_API_KEY || "";

const SYSTEM_PROMPT = `你是版画艺术教学助手。根据用户选择的创作参数，用简洁的中文生成三段描述：
1. 整体风格（2-3句）
2. 刻制建议（2-3句，面向高中生）
3. 表现效果（1-2句，结合具体参数）
每段用"【风格】""【建议】""【效果】"标记开头，总字数不超过200字。`;

export async function generateDescription(params: {
  origin: string;
  mood: string;
  patterns: string[];
}): Promise<string> {
  if (!GLM_TOKEN) {
    return fallbackDescription(params);
  }

  const userMessage = `原形：${params.origin}，气质：${params.mood}，纹样：${params.patterns.join("、")}`;

  try {
    const response = await axios.post(
      GLM_API_URL,
      {
        model: "glm-4-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GLM_TOKEN}`,
        },
        timeout: 30000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) return content;

    return fallbackDescription(params);
  } catch (err) {
    console.error("GLM call failed:", err);
    return fallbackDescription(params);
  }
}

function fallbackDescription(params: { origin: string; mood: string; patterns: string[] }): string {
  return [
    `【风格】高对比度黑白版画，刀痕感有力，${params.mood}气质突出，具有传统版画的手工质感。`,
    `【建议】大面积留白与黑块对比强烈，线条粗细适中，适合高中生刻制练习。`,
    `【效果】${params.origin}搭配${params.patterns.join("、")}，呈现${params.mood}气质，画面具有装饰性与故事感。`,
  ].join("\n");
}

export async function generatePortfolioReport(params: {
  studentName: string;
  uploads: PortfolioUploadView[];
  vision: VisionAnalysis;
}): Promise<PortfolioReportData> {
  if (!GLM_TOKEN) throw new Error("文本报告模型未配置：请设置 GLM_API_KEY");

  try {
    const response = await axios.post(
      GLM_API_URL,
      {
        model: "glm-4-flash",
        messages: [
          {
            role: "system",
            content:
              "你是高中版画课程学习成果点评助手。请基于视觉分析和学生备注生成积极、有仪式感、像年度报告一样的中文学习报告。语言要有艺术性和纪念感，少用机械术语堆砌，只输出严格 JSON，不要 Markdown。不要使用“但是”“不过”等批评式转折。",
          },
          {
            role: "user",
            content: JSON.stringify({
              studentName: params.studentName,
              courses: params.uploads.map((upload) => ({
                courseKey: upload.courseKey,
                stage: upload.stage,
                title: upload.title,
                note: upload.note,
              })),
              vision: params.vision,
              requiredShape: {
                stageSummaries: "数组，四项，每项 { courseKey, summary }，summary 35-60字，一句话，有画面感，避免重复构图/线条/色调拆分",
                overallComment: "180-260字，像完成纪念报告的核心点评，结合四件作品的变化、创作气质、刻刀痕迹和审美判断",
                title: `从称号库选择一个：${titleLibrary.map((item) => item.title).join("、")}`,
                titleReason: "45-70字，称号说明要像颁奖词，积极具体",
                closing: "固定寄语：每一刀都是你留下的印记。带走这份作品，也带走这段时光。印刻奇旅 · 版画创意智造工坊",
              },
            }),
          },
        ],
        temperature: 0.75,
        max_tokens: 1200,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GLM_TOKEN}`,
        },
        timeout: 45000,
      },
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("文本报告模型没有返回内容");
    return normalizePortfolioReport(JSON.parse(stripJsonFence(content)), params);
  } catch (err) {
    console.error("GLM portfolio report failed:", err);
    if (err instanceof Error) throw new Error(`文本报告生成失败：${err.message}`);
    throw new Error("文本报告生成失败，请稍后重试");
  }
}

function normalizePortfolioReport(value: unknown, params: {
  studentName: string;
  uploads: PortfolioUploadView[];
  vision: VisionAnalysis;
}): PortfolioReportData {
  const fallback = fallbackPortfolioReport(params);
  const data = value as Partial<PortfolioReportData>;
  const stageSummaries = Array.isArray(data.stageSummaries)
    ? params.uploads.map((upload) => {
        const found = data.stageSummaries?.find((item) => item?.courseKey === upload.courseKey);
        return {
          courseKey: upload.courseKey,
          summary: String(found?.summary || fallback.stageSummaries.find((item) => item.courseKey === upload.courseKey)?.summary || "").slice(0, 80),
        };
      })
    : fallback.stageSummaries;

  const titleCandidate = titleLibrary.find((item) => item.title === data.title) || titleLibrary[3];
  return {
    studentName: params.studentName,
    completedDate: new Date().toISOString(),
    uploads: params.uploads,
    stageSummaries,
    stageAnalyses: params.vision.stages,
    overallStyle: params.vision.overallStyle,
    overallComment: String(data.overallComment || fallback.overallComment),
    title: titleCandidate.title,
    titleReason: String(data.titleReason || titleCandidate.reason),
    closing: String(data.closing || fallback.closing),
  };
}

function fallbackPortfolioReport(params: {
  studentName: string;
  uploads: PortfolioUploadView[];
  vision: VisionAnalysis;
}): PortfolioReportData {
  const stageSummaries = params.uploads.map((upload) => {
    const analysis = params.vision.stages.find((item) => item.courseKey === upload.courseKey);
    return {
      courseKey: upload.courseKey,
      summary: (analysis?.highlight || upload.note || `${upload.title}呈现出稳定的阶段探索。`).slice(0, 80),
    };
  });
  const title = chooseFallbackTitle(params.uploads);
  return {
    studentName: params.studentName,
    completedDate: new Date().toISOString(),
    uploads: params.uploads,
    stageSummaries,
    overallComment: `你的四件作品连接起一段完整的版画学习旅程。从黑白关系的观察，到传统意象的想象，再到自由主题和套色尝试，可以看到你一直在用自己的方式理解画面。你的作品里有清楚的主体意识，也保留了手工制作中珍贵的痕迹。线条、块面和色彩之间逐渐形成呼应，这种从尝试到判断的变化，是创作真正发生的地方。`,
    title: title.title,
    titleReason: title.reason,
    closing: "每一刀都是你留下的印记。带走这份作品，也带走这段时光。印刻奇旅 · 版画创意智造工坊",
  };
}

function chooseFallbackTitle(uploads: PortfolioUploadView[]) {
  if (uploads.some((upload) => upload.courseKey === "color" && upload.note.includes("色"))) return titleLibrary[5];
  if (uploads.some((upload) => upload.courseKey === "shanhaijing" && upload.note.includes("神"))) return titleLibrary[2];
  return titleLibrary[3];
}

function stripJsonFence(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}
