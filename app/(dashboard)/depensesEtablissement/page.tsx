/**
 * app/(dashboard)/depensesEtablissement/page.tsx — Server Component
 * ──────────────────────────────────────────────────────────────────
 * Vue dépenses pour les utilisateurs d'un établissement.
 * Lit l'etablissementId dans la session pour filtrer les données.
 *
 * Flux : session.etablissementId → getDepenses() + getBons() → DepensesView
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getDepenses, getBons } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import DepensesView from "./_components/DepensesView";

export default async function DepensesEtablissementPage() {
  const session = await getSession();
  if (!session?.etablissementId) redirect("/mon-etablissement");

  const [depenses, bons] = await Promise.all([
    getDepenses(session.etablissementId),
    getBons(session.etablissementId),
  ]);

  return (
    <DepensesView
      depenses={serialize(depenses)}
      bons={serialize(bons)}
      basePath="/depensesEtablissement"
        userPrismaRole={session.role}
    />
  );
}
