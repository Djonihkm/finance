import { cookies } from "next/headers";
import type { SessionData, UserRole } from "./types";

const SESSION_COOKIE = "session";
const ROLE_COOKIE = "role";

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8")) as SessionData;
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(data)).toString("base64");
  const opts = { path: "/", sameSite: "lax" as const, httpOnly: true };
  cookieStore.set(SESSION_COOKIE, encoded, opts);
  cookieStore.set(ROLE_COOKIE, data.uiRole, { path: "/", sameSite: "lax" as const });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(ROLE_COOKIE);
}

export async function getUiRole(): Promise<UserRole> {
  const session = await getSession();
  if (session) return session.uiRole;
  const cookieStore = await cookies();
  return (cookieStore.get(ROLE_COOKIE)?.value as UserRole) ?? "ministere";
}
