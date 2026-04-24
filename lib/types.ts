export type UserRole = "superadmin" | "ministere" | "etablissement";

export type PrismaRole = "SUPER_ADMIN" | "MINISTERE" | "ADMIN" | "COMPTABLE" | "DIRECTEUR";

export interface SessionData {
  userId: string;
  role: PrismaRole;
  uiRole: UserRole;
  etablissementId: string | null;
  nom: string;
  prenom: string;
  email: string;
}
