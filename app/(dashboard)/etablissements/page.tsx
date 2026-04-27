/**
 * app/(dashboard)/etablissements/page.tsx  — Server Component
 * ─────────────────────────────────────────────────────────────
 * Récupère les établissements directement depuis Neon via Prisma,
 * puis passe les données au Client Component EtablissementsView
 * qui gère la pagination et les interactions.
 *
 * Flux :  Neon ← Prisma ← getEtablissements() ← ici ← EtablissementsView
 * ─────────────────────────────────────────────────────────────
 */
import { getEtablissements } from "@/lib/queries";
import EtablissementsView from "./_components/EtablissementsView";

export default async function EtablissementsPage() {
  // Appel direct à Prisma (pas de fetch HTTP, pas de store)
  const etablissements = await getEtablissements();
  return <EtablissementsView data={etablissements} />;
}
