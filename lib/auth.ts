"use server";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { setSession, clearSession } from "./session";
import type { PrismaRole, UserRole } from "./types";

export type LoginState = { error: string } | { redirect: string } | null;

function toUiRole(role: PrismaRole): UserRole {
  if (role === "SUPER_ADMIN") return "superadmin";
  if (role === "MINISTERE") return "ministere";
  return "etablissement";
}

function dashboardFor(uiRole: UserRole): string {
  if (uiRole === "superadmin") return "/etablissements";
  if (uiRole === "ministere") return "/etablissements";
  return "/mon-etablissement";
}

export async function login(_prevState: LoginState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await prisma.user.findUnique({ where: { email, isActive: true, deletedAt: null } });
  if (!user) return { error: "Email ou mot de passe incorrect" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Email ou mot de passe incorrect" };

  const uiRole = toUiRole(user.role as PrismaRole);
  await setSession({
    userId: user.id,
    role: user.role as PrismaRole,
    uiRole,
    etablissementId: user.etablissementId,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
  });

  return { redirect: dashboardFor(uiRole) };
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
