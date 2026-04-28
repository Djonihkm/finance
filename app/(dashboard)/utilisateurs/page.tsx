/**
 * app/(dashboard)/utilisateurs/page.tsx — Server Component
 * ──────────────────────────────────────────────────────────
 * Récupère la liste des utilisateurs depuis Neon via Prisma.
 * Passe les données au Client Component UtilisateursView.
 *
 * Flux : Neon ← Prisma ← getUsers() ← ici ← UtilisateursView
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getUsers } from "@/lib/queries";
import UtilisateursView from "./_components/UtilisateursView";

export default async function UtilisateursPage() {
  const session = await getSession();
  if (!session || session.uiRole === "etablissement") redirect("/mon-etablissement");

  const utilisateurs = await getUsers();
  return <UtilisateursView data={utilisateurs} />;
}
