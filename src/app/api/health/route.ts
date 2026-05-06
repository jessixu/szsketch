import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { config } from "@/lib/config";
import packageJson from "../../../../package.json";

export async function GET() {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");

    return NextResponse.json({
      ok: true,
      database: true,
      aiAvailable: config.aiAvailable,
      version: packageJson.version,
    });
  } catch (error) {
    console.error("Healthcheck failed:", error);

    return NextResponse.json(
      {
        ok: false,
        database: false,
        aiAvailable: config.aiAvailable,
        version: packageJson.version,
      },
      { status: 503 }
    );
  }
}
