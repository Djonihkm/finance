/**
 * app/(dashboard)/depenses/[reference]/page.tsx — Server Component (vue admin)
 * ──────────────────────────────────────────────────────────────────────────────
 * Récupère une dépense par sa référence depuis Neon via Prisma.
 * Affiche le détail avec les actions de validation / rejet.
 *
 * Flux : URL /depenses/[ref] → getDepenseByReference() → DepenseDetailView
 */

import { notFound } from "next/navigation";
import { getDepenseByReference } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import DepenseDetailView from "../../depensesEtablissement/_components/DepenseDetailView";

export default async function DepenseDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const depense = await getDepenseByReference(decodeURIComponent(reference));
  if (!depense) notFound();

  return <DepenseDetailView data={serialize(depense)} backPath="/depenses" />;
}
