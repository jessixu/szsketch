"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

function redirectWithError(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    redirectWithError("请输入用户名和密码");
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  } catch {
    redirectWithError("登录失败，请重试");
  }

  if (!user) {
    redirectWithError("用户名或密码错误");
  }

  try {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      redirectWithError("用户名或密码错误");
    }

    const session = await getSession();
    session.userId = user.id;
    session.displayName = user.displayName;
    await session.save();
  } catch {
    redirectWithError("登录失败，请重试");
  }

  redirect("/");
}
