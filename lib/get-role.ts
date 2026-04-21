import { cookies } from "next/headers";
import type { UserRole } from "./mock-users";

export async function getRole(): Promise<UserRole> {
  const cookieStore = await cookies();
  return (cookieStore.get("role")?.value as UserRole) ?? "admin";
}
