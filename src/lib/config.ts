export const config = {
  arkApiKey: process.env.ARK_API_KEY || "",
  arkBaseUrl: process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
  uploadDir: process.env.UPLOAD_DIR || "./uploads",
  get aiAvailable(): boolean {
    return !!this.arkApiKey;
  },
};
