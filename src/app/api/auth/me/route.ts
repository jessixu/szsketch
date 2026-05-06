import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, username: true, displayName: true, className: true },
  });

  if (!user) {
    return NextResponse.json({ error: "用户不存在" }, { status: 401 });
  }

  return NextResponse.json(user);
}
