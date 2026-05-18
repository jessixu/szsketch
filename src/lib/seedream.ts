import axios from "axios";
import { config } from "./config";

interface GenerateResult {
  imagePath: string;
  imageUrl: string;
}

export interface GenerateImageOptions {
  image?: string | string[];
  outputCount?: number;
}

export async function generateImage(
  prompt: string,
  negativePrompt?: string,
  options: GenerateImageOptions = {},
): Promise<GenerateResult> {
  const body: Record<string, unknown> = {
    model: "doubao-seedream-5-0-260128",
    prompt,
    sequential_image_generation: "disabled",
    response_format: "url",
    size: config.arkImageSize,
    stream: false,
    output_format: config.arkOutputFormat,
    watermark: false,
  };

  if (negativePrompt) {
    body.negative_prompt = negativePrompt;
  }
  if (options.image) {
    body.image = options.image;
  }
  if (options.outputCount && options.outputCount > 1) {
    body.sequential_image_generation = "auto";
    body.sequential_image_generation_options = { max_images: options.outputCount };
  }

  const response = await postWithRetry(body);

  const result = response.data;

  // Response: { data: [{ url: "..." }] }
  if (result.data?.[0]?.url) {
    if (!config.saveGeneratedImage) {
      return { imagePath: result.data[0].url, imageUrl: result.data[0].url };
    }
    return await downloadAndSave(result.data[0].url);
  }

  // Base64 fallback: { data: [{ b64_json: "..." }] }
  if (result.data?.[0]?.b64_json) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filename = `gen_${Date.now()}.${getImageExtension()}`;
    const imagePath = path.join(config.uploadDir, filename);
    await fs.mkdir(config.uploadDir, { recursive: true });
    await fs.writeFile(imagePath, Buffer.from(result.data[0].b64_json, "base64"));
    return { imagePath, imageUrl: `/uploads/${filename}` };
  }

  throw new Error(`Unexpected response: ${JSON.stringify(result).slice(0, 500)}`);
}

export async function generateImageSet(
  requests: Array<{ label: string; prompt: string; negativePrompt?: string; image?: string | string[] }>,
): Promise<Array<{ label: string; imageUrl: string }>> {
  const outputs: Array<{ label: string; imageUrl: string }> = [];
  for (const request of requests) {
    const result = await generateImage(request.prompt, request.negativePrompt, {
      image: request.image,
    });
    outputs.push({ label: request.label, imageUrl: result.imageUrl });
  }
  return outputs;
}

async function postWithRetry(body: Record<string, unknown>) {
  const maxAttempts = 3;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await axios.post(`${config.arkBaseUrl}/images/generations`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.arkApiKey}`,
        },
        timeout: 180000,
      });
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts || !isRetryableNetworkError(err)) break;
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  throw lastError;
}

function isRetryableNetworkError(err: unknown) {
  if (!axios.isAxiosError(err)) return false;
  return ["ECONNRESET", "ETIMEDOUT", "ECONNABORTED", "ENOTFOUND", "EAI_AGAIN"].includes(
    err.code || "",
  );
}

async function downloadAndSave(imageUrl: string): Promise<GenerateResult> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const filename = `gen_${Date.now()}.${getImageExtension()}`;
  const imagePath = path.join(config.uploadDir, filename);
  await fs.mkdir(config.uploadDir, { recursive: true });

  const resp = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 60000 });
  await fs.writeFile(imagePath, Buffer.from(resp.data));
  return { imagePath, imageUrl: `/uploads/${filename}` };
}

function getImageExtension() {
  return config.arkOutputFormat === "png" ? "png" : "jpg";
}
