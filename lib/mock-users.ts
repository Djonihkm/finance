export type UserRole = "admin" | "etablissement";

export const MOCK_USERS = [
  { email: "admin@ministere.bj", password: "admin123", role: "admin" as UserRole },
  { email: "lycee@behan.bj", password: "etab123", role: "etablissement" as UserRole },
];
