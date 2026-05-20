import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { config } from "@/lib/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  if (!path?.length || path.some((part) => part === ".." || part.includes("\\"))) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const filePath = path.join("/");
  const fullPath = join(config.uploadDir, ...path);

  try {
    const buffer = await readFile(fullPath);
    const headers = new Headers();
    headers.set("Content-Type", getContentType(filePath));
    headers.set("Cache-Control", "public, max-age=2592000");
    return new NextResponse(buffer, { headers });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

function getContentType(filePath: string) {
  if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) return "image/jpeg";
  if (filePath.endsWith(".webp")) return "image/webp";
  return "image/png";
}
