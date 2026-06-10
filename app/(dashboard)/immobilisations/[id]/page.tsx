import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getImmobilisationById, getFournisseurs, getBons } from "@/lib/queries";
import ImmobilisationDetailView from "./_components/ImmobilisationDetailView";

type Props = { params: Promise<{ id: string }> };

export default async function ImmobilisationDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const immo = await getImmobilisationById(id);
  if (!immo) notFound();

  const etabId = session.etablissementId ?? "";
  const [fournisseurs, bons] = await Promise.all([
    etabId ? getFournisseurs(etabId) : Promise.resolve([]),
    etabId ? getBons(etabId) : Promise.resolve([]),
  ]);

  const bonsValides = bons.filter((b) => b.statut === "VALIDE");

  return (
    <ImmobilisationDetailView
      immo={JSON.parse(JSON.stringify(immo))}
      fournisseurs={JSON.parse(JSON.stringify(fournisseurs))}
      bonsValides={JSON.parse(JSON.stringify(bonsValides))}
      userPrismaRole={session.role}
    />
  );
}
