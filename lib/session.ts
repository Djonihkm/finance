import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import type { SessionData, UserRole } from "./types";

const ROLE_COOKIE = "role";

const sessionOptions = {
  cookieName: "session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8 heures
    path: "/",
  },
};

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const session = await getIronSession<{ data?: SessionData }>(cookieStore, sessionOptions);
  return session.data ?? null;
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<{ data?: SessionData }>(cookieStore, sessionOptions);
  session.data = data;
  await session.save();

  // Cookie UI role lisible côté client pour le contexte React
  cookieStore.set(ROLE_COOKIE, data.uiRole, {
    path: "/",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  const session = await getIronSession<{ data?: SessionData }>(cookieStore, sessionOptions);
  session.destroy();
  cookieStore.delete(ROLE_COOKIE);
}

export async function getUiRole(): Promise<UserRole> {
  const session = await getSession();
  if (session) return session.uiRole;
  const cookieStore = await cookies();
  return (cookieStore.get(ROLE_COOKIE)?.value as UserRole) ?? "ministere";
}
