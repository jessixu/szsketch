import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.history.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.history.count({ where: { userId: session.userId } }),
  ]);

  return NextResponse.json({ items, total, page, limit });
}
