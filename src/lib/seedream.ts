import axios from "axios";
import { config } from "./config";

interface GenerateResult {
  imagePath: string;
  imageUrl: string;
}

export async function generateImage(
  prompt: string,
  negativePrompt?: string,
): Promise<GenerateResult> {
  const body: Record<string, unknown> = {
    model: "doubao-seedream-5-0-260128",
    prompt,
    sequential_image_generation: "disabled",
    response_format: "url",
    size: "2K",
    stream: false,
    output_format: "png",
    watermark: false,
  };

  if (negativePrompt) {
    body.negative_prompt = negativePrompt;
  }

  const response = await axios.post(
    `${config.arkBaseUrl}/images/generations`,
    body,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.arkApiKey}`,
      },
      timeout: 180000,
    }
  );

  const result = response.data;

  // Response: { data: [{ url: "..." }] }
  if (result.data?.[0]?.url) {
    return await downloadAndSave(result.data[0].url);
  }

  // Base64 fallback: { data: [{ b64_json: "..." }] }
  if (result.data?.[0]?.b64_json) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filename = `gen_${Date.now()}.png`;
    const imagePath = path.join(config.uploadDir, filename);
    await fs.mkdir(config.uploadDir, { recursive: true });
    await fs.writeFile(imagePath, Buffer.from(result.data[0].b64_json, "base64"));
    return { imagePath, imageUrl: `/uploads/${filename}` };
  }

  throw new Error(`Unexpected response: ${JSON.stringify(result).slice(0, 500)}`);
}

async function downloadAndSave(imageUrl: string): Promise<GenerateResult> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const filename = `gen_${Date.now()}.png`;
  const imagePath = path.join(config.uploadDir, filename);
  await fs.mkdir(config.uploadDir, { recursive: true });

  const resp = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 60000 });
  await fs.writeFile(imagePath, Buffer.from(resp.data));
  return { imagePath, imageUrl: `/uploads/${filename}` };
}
