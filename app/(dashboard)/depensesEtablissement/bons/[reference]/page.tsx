/**
 * app/(dashboard)/depensesEtablissement/bons/[reference]/page.tsx — Server Component
 * ──────────────────────────────────────────────────────────────────────────────────
 * Récupère un bon de commande par sa référence depuis Neon via Prisma.
 *
 * Flux : URL → getBonByReference() → BonDetailView
 */

import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getBonByReference } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import BonDetailView from "../_components/BonDetailView";

export default async function BonDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const session = await getSession();
  const bon = await getBonByReference(decodeURIComponent(reference));
  if (!bon) notFound();

  return (
    <BonDetailView
      data={serialize(bon)}
      backPath="/depensesEtablissement?tab=bons"
      userPrismaRole={session?.role}
    />
  );
}
