import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  beastEdits,
  beastLibrary,
  blackWhiteStyles,
  freeStyles,
  type CourseKey,
} from "@/lib/courseConfig";
import { generateImage, generateImageSet } from "@/lib/seedream";
import { config } from "@/lib/config";

const RELIEF_STYLE =
  "黑白凸版画风格，线条清晰，块面明确，无渐变，无杂色，适合高中生手绘、转印、刻制、印制。";

const NEGATIVE_PROMPT =
  "photorealistic, 3D render, watercolor, oil painting, blurry, soft gradient, colorful noise, low contrast, complex tiny details";

const SHANHAIJING_STYLE =
  "Chinese traditional woodblock print, black and white, high contrast, bold knife-carved lines, ink on rice paper, hand-carved woodblock texture, monochrome linocut style, wood engraving, strong black and white contrast";

const SHANHAIJING_NEGATIVE_PROMPT =
  `${NEGATIVE_PROMPT}, white background, isolated subject, blank background, picture frame, border, decorative frame, mat, poster frame, square frame, floating object, product shot`;

interface CourseGeneratePayload {
  courseKey: CourseKey;
  action: string;
  inputs: Record<string, unknown>;
}

interface CourseResult {
  origin: string;
  mood: string;
  patterns: string[];
  notes: string;
  prompt: string;
  description: string;
  images: Array<{ label: string; url: string }>;
  palette?: string[];
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as CourseGeneratePayload;
    const result = await generateCourseResult(payload);
    const shouldRecordHistory = !(payload.courseKey === "color" && payload.action === "palette");

    const history = shouldRecordHistory
      ? await prisma.history.create({
          data: {
            userId: session.userId,
            origin: result.origin,
            mood: result.mood,
            patterns: JSON.stringify(result.patterns),
            notes: result.notes,
            prompt: result.prompt,
            imageUrl: result.images[0]?.url || null,
            description: result.description,
            aiAvailable: config.aiAvailable,
            courseKey: payload.courseKey,
            actionKey: payload.action,
            paramsJson: stringifyHistoryParams(payload.inputs),
            outputImages: JSON.stringify(result.images),
          },
        })
      : null;

    return NextResponse.json({
      id: history?.id || null,
      courseKey: payload.courseKey,
      action: payload.action,
      images: result.images,
      description: result.description,
      prompt: result.prompt,
      palette: result.palette || null,
      aiAvailable: config.aiAvailable,
      imageError: null,
    });
  } catch (err) {
    const message = getGenerateErrorMessage(err);
    console.error("Course generation failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function generateCourseResult(payload: CourseGeneratePayload): Promise<CourseResult> {
  if (payload.courseKey === "black-white") return generateBlackWhite(payload.inputs);
  if (payload.courseKey === "shanhaijing") return generateShanhaijing(payload.action, payload.inputs);
  if (payload.courseKey === "free") return generateFree(payload.inputs);
  if (payload.courseKey === "color") return generateColor(payload.action, payload.inputs);
  throw new Error("未知课程");
}

async function generateBlackWhite(inputs: Record<string, unknown>) {
  const imageData = stringInput(inputs.imageData);
  const styleKey = stringInput(inputs.styleKey) || blackWhiteStyles[0].key;
  if (!imageData) throw new Error("请先上传风景照片");

  const style = blackWhiteStyles.find((item) => item.key === styleKey) || blackWhiteStyles[0];
  const prompt = `${style.prompt} ${RELIEF_STYLE}`;
  const result = await generateImage(prompt, NEGATIVE_PROMPT, { image: imageData });
  return {
    origin: "风景照片",
    mood: style.label,
    patterns: [],
    notes: "",
    prompt,
    description: `${style.label}已生成，可作为黑白关系和刻制练习参考。`,
    images: [{ label: "版画稿", url: result.imageUrl }],
  };
}

async function generateShanhaijing(action: string, inputs: Record<string, unknown>) {
  const beastId = stringInput(inputs.beastId) || beastLibrary[0].id;
  const beast = beastLibrary.find((item) => item.id === beastId) || beastLibrary[0];
  const mood = stringInput(inputs.mood) || "神秘";
  const edits = arrayInput(inputs.edits).filter((item) => beastEdits.includes(item));
  const notes = stringInput(inputs.notes).slice(0, 200);
  const editInstruction = [edits.join("；"), notes].filter(Boolean).join("；");

  if (action === "library") {
    const editText = edits.length
      ? `在原有基础上优化：${edits.join("；")}；主体形象更整体、更概括；线条更粗壮、清晰；背景简化；纹样疏朗，不干扰主体；保持黑白凸版画风格，适合印制。`
      : "在原有基础上优化：主体形象更整体、更概括；线条更粗壮、清晰；背景简化；纹样疏朗，不干扰主体；保持黑白凸版画风格，适合印制。";
    const requests = [
      ["主体定稿图", `${editText} 生成《山海经》${beast.name}主体定稿图，气质${mood}。`],
      ["主体动态参考图", `${editText} 生成《山海经》${beast.name}动态姿态参考图，气质${mood}。`],
      ["纹样参考图A", `${editText} 生成适合《山海经》${beast.name}的疏朗传统纹样参考图A。`],
      ["纹样参考图B", `${editText} 生成适合《山海经》${beast.name}的疏朗传统纹样参考图B。`],
    ].map(([label, prompt]) => ({ label, prompt: `${prompt} ${RELIEF_STYLE}`, negativePrompt: NEGATIVE_PROMPT }));
    const images = await generateImageSet(requests);
    return {
      origin: beast.name,
      mood,
      patterns: edits,
      notes: edits.join("；"),
      prompt: requests.map((item) => `${item.label}: ${item.prompt}`).join("\n"),
      description: `${beast.name}素材库已生成，包含主体、动态和两张纹样参考。`,
      images: images.map((item) => ({ label: item.label, url: item.imageUrl })),
    };
  }

  const subject = `a mythical creature from Shan Hai Jing named ${beast.name}; identity: ${beast.story}; appearance: ${beast.appearance}`;
  const prompt = [
    SHANHAIJING_STYLE,
    subject,
    `mood: ${mood}, complete printmaking composition, full scene with atmospheric background`,
    "integrated mountain, cloud, wave or traditional Chinese pattern background, background carved into the same woodblock print",
    "the creature and environment are part of one continuous artwork, no outer border, no picture frame, no blank white margin",
    "suitable for high school woodblock carving practice, clear silhouette, bold black shapes, rough carved texture",
    editInstruction ? `revision guidance: ${editInstruction}` : "",
  ]
    .filter(Boolean)
    .join(". ");
  const result = await generateImage(`${prompt}.`, SHANHAIJING_NEGATIVE_PROMPT);
  return {
    origin: beast.name,
    mood,
    patterns: edits,
    notes,
    prompt,
    description: `${beast.name}：${beast.story}`,
    images: [{ label: "生成初稿", url: result.imageUrl }],
  };
}

async function generateFree(inputs: Record<string, unknown>) {
  const mode = stringInput(inputs.mode) || "text";
  const keyword = stringInput(inputs.keyword);
  const imageData = stringInput(inputs.imageData);
  const style = stringInput(inputs.style) || freeStyles[0];
  const composition = stringInput(inputs.composition) || "居中构图";
  const element = stringInput(inputs.element) || "自然元素";

  if (mode === "image") {
    if (!imageData) throw new Error("请先上传图片");
    const prompt = `将这张图片转化为黑白凸版画风格，简化细节，强化轮廓，黑白对比明确，保留主体特征，适合学生手绘临摹与刻制。${RELIEF_STYLE}`;
    const result = await generateImage(prompt, NEGATIVE_PROMPT, { image: imageData });
    return {
      origin: "上传图片",
      mood: style,
      patterns: [composition, element],
      notes: "",
      prompt,
      description: "图生图参考图已生成，可用于自主主题创作。",
      images: [{ label: "参考图", url: result.imageUrl }],
    };
  }

  if (!keyword) throw new Error("请输入主题或关键词");
  const prompt = `以${keyword}为主题，创作黑白凸版画主体，风格${style}，构图${composition}，搭配${element}，造型适合木板刻制，黑白关系清晰，主体突出。${RELIEF_STYLE}`;
  const result = await generateImage(prompt, NEGATIVE_PROMPT);
  return {
    origin: keyword,
    mood: style,
    patterns: [composition, element],
    notes: "",
    prompt,
    description: "自由主题参考图已生成。",
    images: [{ label: "参考图", url: result.imageUrl }],
  };
}

async function generateColor(action: string, inputs: Record<string, unknown>) {
  const imageData = stringInput(inputs.imageData);
  const tone = stringInput(inputs.tone) || "暖色调";
  const atmosphere = stringInput(inputs.atmosphere) || "古朴";
  const count = stringInput(inputs.count) || "3色";
  const seed = numberInput(inputs.seed);
  const requestedPalette = arrayInput(inputs.palette).filter(isHexColor);
  const palette = requestedPalette.length > 0 ? requestedPalette : buildColorPalette(tone, count, seed);

  if (action === "palette") {
    const prompt = `为这幅黑白版画生成${count}种套色方案，色调${tone}，氛围${atmosphere}，颜色适合实物印制，无渐变，无叠色，符合凸版套色逻辑。`;
    return {
      origin: "黑白底稿",
      mood: tone,
      patterns: palette,
      notes: atmosphere,
      prompt,
      description: `${count}${tone}${atmosphere}配色方案已生成。`,
      palette,
      images: [],
    };
  }

  if (!imageData) throw new Error("请先上传黑白底稿");
  const prompt = `将这幅黑白版画转化为${palette.join("、")}套色版画效果，分色明确，版画肌理清晰，适合绝版套色或多版套色实际操作。色调${tone}，氛围${atmosphere}，无渐变，无杂色。`;
  const result = await generateImage(prompt, NEGATIVE_PROMPT, { image: imageData });
  return {
    origin: "黑白底稿",
    mood: tone,
    patterns: palette,
    notes: atmosphere,
    prompt,
    description: "套色效果图已生成，可作为分版与印制参考。",
    palette,
    images: [{ label: "套色效果图", url: result.imageUrl }],
  };
}

function stringInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberInput(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function arrayInput(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function buildColorPalette(tone: string, count: string, seed: number) {
  const size = parseInt(count, 10) || 3;
  const variants = colorPaletteVariants[tone] || colorPaletteVariants.暖色调;
  return variants[Math.abs(seed) % variants.length].slice(0, size);
}

const colorPaletteVariants: Record<string, string[][]> = {
  暖色调: [
    ["#5A2418", "#B4552E", "#E2A23A", "#F3D7A4"],
    ["#6B1F1F", "#A84A2A", "#D58B3A", "#F0C98D"],
    ["#4A2A1A", "#8A4F2B", "#C98B48", "#E8CFA5"],
  ],
  冷色调: [
    ["#173F5F", "#2F6F73", "#74A6A6", "#B8D8D8"],
    ["#1F2933", "#2E5266", "#5D8AA8", "#C7DDE8"],
    ["#123C45", "#256D6A", "#6AA5A0", "#C8E0D8"],
  ],
  对比色调: [
    ["#8B1A1A", "#1F6F5B", "#E2A23A", "#F2D492"],
    ["#202020", "#9B1C1F", "#2F6F73", "#F3D7A4"],
    ["#5A2418", "#1F5F4A", "#C95F2D", "#EBD28A"],
  ],
  和谐色调: [
    ["#4B3526", "#6F4E37", "#A8703A", "#D8B985"],
    ["#3E3229", "#70543A", "#9F744A", "#CFB184"],
    ["#5B4231", "#7C5D3E", "#A98255", "#E0C79C"],
  ],
};

const MAX_HISTORY_PARAMS_CHARS = 12_000;
const MAX_HISTORY_STRING_CHARS = 500;

function stringifyHistoryParams(inputs: Record<string, unknown>) {
  const json = JSON.stringify(sanitizeHistoryValue(inputs));
  if (json.length <= MAX_HISTORY_PARAMS_CHARS) return json;
  return JSON.stringify({
    truncated: true,
    originalChars: json.length,
    message: "History params exceeded storage limit after sanitizing.",
  });
}

function sanitizeHistoryValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.startsWith("data:image/")) {
      return {
        uploaded: true,
        kind: "image",
        chars: value.length,
        bytesApprox: Math.round(value.length * 0.75),
      };
    }
    if (value.length > MAX_HISTORY_STRING_CHARS) {
      return {
        truncated: true,
        chars: value.length,
        preview: value.slice(0, MAX_HISTORY_STRING_CHARS),
      };
    }
    return value;
  }

  if (Array.isArray(value)) return value.map(sanitizeHistoryValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, sanitizeHistoryValue(child)]),
    );
  }

  return value;
}

function getGenerateErrorMessage(err: unknown) {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data ? JSON.stringify(err.response.data).slice(0, 240) : err.message;
    if (err.response?.status) return `生图服务返回 ${err.response.status}：${detail}`;
  }
  return err instanceof Error ? err.message : "生成失败，请重试";
}
