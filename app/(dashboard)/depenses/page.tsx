/**
 * app/(dashboard)/depenses/page.tsx — Server Component (vue admin / ministère)
 * ──────────────────────────────────────────────────────────────────────────────
 * Récupère toutes les dépenses et tous les bons de commande (sans filtre établissement).
 * Réservé aux rôles MINISTERE, ADMIN et SUPER_ADMIN.
 *
 * Flux : Neon ← Prisma ← getAllDepenses() + getAllBons() ← ici ← DepensesView
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getAllDepenses, getAllBons } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import DepensesView from "../depensesEtablissement/_components/DepensesView";

export default async function DepensesAdminPage() {
  const session = await getSession();
  if (!session || session.uiRole === "etablissement") redirect("/depensesEtablissement");
  const [depenses, bons] = await Promise.all([
    getAllDepenses(),
    getAllBons(),
  ]);

  return (
    <DepensesView
      depenses={serialize(depenses)}
      bons={serialize(bons)}
      basePath="/depenses"
    />
  );
}
