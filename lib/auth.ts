"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "./types";

export type LoginState = { error: string } | null;

const USERS: { email: string; password: string; role: UserRole }[] = [
  {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
    role: "admin",
  },
  {
    email: process.env.ETAB_EMAIL!,
    password: process.env.ETAB_PASSWORD!,
    role: "etablissement",
  },
];

export async function login(_prevState: LoginState, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = USERS.find(u => u.email === email && u.password === password);
  if (!user) return { error: "Email ou mot de passe incorrect" };

  const cookieStore = await cookies();
  cookieStore.set("role", user.role, { path: "/", sameSite: "lax" });

  redirect(user.role === "admin" ? "/etablissements" : "/mon-etablissement");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("role");
  redirect("/login");
}
