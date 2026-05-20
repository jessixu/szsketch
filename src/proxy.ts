import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";

export interface SessionData {
  userId?: string;
  displayName?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex-password-at-least-32-characters-long-for-security",
  cookieName: "szsketch_session",
};

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/reports") ||
    pathname.startsWith("/api/status") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/animal_img") ||
    pathname.startsWith("/reports")
  ) {
    return response;
  }

  if (!session.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
