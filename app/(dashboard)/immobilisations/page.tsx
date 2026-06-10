import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getImmobilisations, getFournisseurs, getBons } from "@/lib/queries";
import ImmobilisationsView from "./_components/ImmobilisationsView";

export default async function ImmobilisationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const etabId = session.etablissementId ?? "";

  const [immobilisations, fournisseurs, bons] = await Promise.all([
    getImmobilisations(etabId),
    etabId ? getFournisseurs(etabId) : Promise.resolve([]),
    etabId ? getBons(etabId) : Promise.resolve([]),
  ]);

  const bonsValides = bons.filter((b) => b.statut === "VALIDE");

  return (
    <ImmobilisationsView
      immobilisations={JSON.parse(JSON.stringify(immobilisations))}
      fournisseurs={JSON.parse(JSON.stringify(fournisseurs))}
      bonsValides={JSON.parse(JSON.stringify(bonsValides))}
      userPrismaRole={session.role}
      etablissementId={etabId}
    />
  );
}
