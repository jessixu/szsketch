import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  displayName?: string;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET || "complex-password-at-least-32-characters-long-for-security",
  cookieName: "szsketch_session",
  cookieOptions: {
    secure:
      process.env.SESSION_COOKIE_SECURE === "false"
        ? false
        : process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24, // 24 hours
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}
