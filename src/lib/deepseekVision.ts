import axios from "axios";
import { type PortfolioUploadView, readUploadAsDataUrl } from "@/lib/portfolio";

export interface VisionStageAnalysis {
  courseKey: string;
  composition: string;
  line: string;
  toneOrColor: string;
  feeling: string;
  highlight: string;
}

export interface VisionAnalysis {
  stages: VisionStageAnalysis[];
  overallStyle: string;
}

const GLM_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const GLM_TOKEN = process.env.GLM_API_KEY || "";
const GLM_VISION_MODEL = process.env.GLM_VISION_MODEL || "glm-4v-flash";

export async function analyzePortfolioImages(uploads: PortfolioUploadView[]): Promise<VisionAnalysis> {
  const completed = uploads.filter((item) => item.imageUrl);
  if (!GLM_TOKEN) {
    throw new Error("视觉分析模型未配置：请设置 GLM_API_KEY");
  }

  try {
    const stages = [];
    for (const upload of completed) {
      stages.push(await analyzeSingleUpload(upload));
    }
    return {
      stages,
      overallStyle: buildOverallStyle(stages),
    };
  } catch (err) {
    logVisionError(err);
    if (err instanceof Error) throw new Error(`视觉分析失败：${err.message}`);
    throw new Error("视觉分析失败，请稍后重试");
  }
}

async function analyzeSingleUpload(upload: PortfolioUploadView): Promise<VisionStageAnalysis> {
  const imageData = stripDataUrlPrefix(await readUploadAsDataUrl(upload.imageUrl!));
  const response = await axios.post(
    GLM_API_URL,
    {
      model: GLM_VISION_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "你是高中版画课程的视觉分析助手。请观察这一张学生实体版画作品，结合阶段和学生备注，输出严格 JSON，不要 Markdown。",
                `courseKey=${upload.courseKey}`,
                `阶段：${upload.stage} · ${upload.title}`,
                `学生备注：${upload.note || "无"}`,
                'JSON 字段：courseKey、composition、line、toneOrColor、feeling、highlight。每个字段一句中文，积极具体。',
              ].join("\n"),
            },
            { type: "image_url", image_url: { url: imageData } },
          ],
        },
      ],
      temperature: 0.35,
      max_tokens: 500,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GLM_TOKEN}`,
      },
      timeout: 90000,
    },
  );

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error(`${upload.title}视觉分析模型没有返回内容`);
  return normalizeStageAnalysis(JSON.parse(stripJsonFence(raw)), upload);
}

function normalizeStageAnalysis(value: unknown, upload: PortfolioUploadView): VisionStageAnalysis {
  const data = value as Partial<VisionStageAnalysis>;
  return {
    courseKey: upload.courseKey,
    composition: String(data.composition || "画面结构完整，主体关系清楚。"),
    line: String(data.line || "线条保留了手工刻制的痕迹。"),
    toneOrColor: String(data.toneOrColor || "黑白或色彩关系有自己的节奏。"),
    feeling: String(data.feeling || "作品呈现出认真而稳定的表达。"),
    highlight: String(data.highlight || upload.note || "能看到你对画面效果的主动判断。"),
  };
}

function buildOverallStyle(stages: VisionStageAnalysis[]) {
  const highlights = stages.map((stage) => stage.highlight).filter(Boolean).slice(0, 4);
  return highlights.length
    ? `四件作品呈现出连续的学习轨迹：${highlights.join("；")}。`
    : "整体作品呈现出持续探索和逐步建立个人语言的特点。";
}

function stripDataUrlPrefix(value: string) {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
}

function stripJsonFence(value: string) {
  return value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function logVisionError(err: unknown) {
  if (axios.isAxiosError(err)) {
    console.error("Vision analysis call failed:", {
      status: err.response?.status,
      data: err.response?.data,
      message: err.message,
    });
    return;
  }
  console.error("Vision analysis call failed:", err);
}
