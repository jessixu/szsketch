import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "请输入用户名和密码" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
    }

    const session = await getSession();
    session.userId = user.id;
    session.displayName = user.displayName;
    await session.save();

    return NextResponse.json({
      id: user.id,
      displayName: user.displayName,
    });
  } catch {
    return NextResponse.json({ error: "登录失败，请重试" }, { status: 500 });
  }
}
