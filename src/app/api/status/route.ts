import { NextResponse } from "next/server";
import { config } from "@/lib/config";

export async function GET() {
  return NextResponse.json({
    aiAvailable: config.aiAvailable,
    version: "1.0.0",
  });
}
