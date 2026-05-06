import { NextResponse } from "next/server";
import { config } from "@/lib/config";
import packageJson from "../../../../package.json";

export async function GET() {
  return NextResponse.json({
    aiAvailable: config.aiAvailable,
    version: packageJson.version,
  });
}
