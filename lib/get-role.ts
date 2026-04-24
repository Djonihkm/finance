import type { UserRole } from "./types";
import { getUiRole } from "./session";

export async function getRole(): Promise<UserRole> {
  return getUiRole();
}
