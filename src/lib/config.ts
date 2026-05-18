export const config = {
  arkApiKey: process.env.ARK_API_KEY || "",
  arkBaseUrl: process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
  arkImageSize: process.env.ARK_IMAGE_SIZE || "2K",
  arkOutputFormat: process.env.ARK_OUTPUT_FORMAT || "jpeg",
  saveGeneratedImage: process.env.SAVE_GENERATED_IMAGE === "true",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  get aiAvailable(): boolean {
    return !!this.arkApiKey;
  },
};
