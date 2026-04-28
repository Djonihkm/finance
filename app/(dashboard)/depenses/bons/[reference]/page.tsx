/**
 * app/(dashboard)/depenses/bons/[reference]/page.tsx — Server Component (vue admin)
 * ──────────────────────────────────────────────────────────────────────────────────
 * Récupère un bon de commande par sa référence depuis Neon via Prisma.
 *
 * Flux : URL → getBonByReference() → BonDetailView
 */

import { notFound } from "next/navigation";
import { getBonByReference } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import BonDetailView from "@/app/(dashboard)/depensesEtablissement/bons/_components/BonDetailView";

export default async function BonDetailAdminPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const bon = await getBonByReference(decodeURIComponent(reference));
  if (!bon) notFound();

  return <BonDetailView data={serialize(bon)} backPath="/depenses" />;
}
