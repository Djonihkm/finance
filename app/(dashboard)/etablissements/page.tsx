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
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getEtablissements } from "@/lib/queries";
import { serialize } from "@/lib/utils/serialize";
import EtablissementsView from "./_components/EtablissementsView";

export default async function EtablissementsPage() {
  const session = await getSession();
  if (!session || session.uiRole === "etablissement") redirect("/mon-etablissement");

  const etablissements = serialize(await getEtablissements());
  return <EtablissementsView data={etablissements} />;
}
