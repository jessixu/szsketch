import axios from "axios";

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
