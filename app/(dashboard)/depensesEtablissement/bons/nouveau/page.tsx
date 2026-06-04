import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NouveauBonForm from "./_components/NouveauBonForm";

export default async function NouveauBonPage({
  searchParams,
}: {
  searchParams: Promise<{ contratId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { contratId: preselectedContratId } = await searchParams;

  const etabId = session.etablissementId;

  const [etablissement, fournisseurs, contrats] = await Promise.all([
    etabId
      ? prisma.etablissement.findUnique({
          where: { id: etabId },
          select: { adresse: true, ville: true, region: true },
        })
      : null,
    etabId
      ? prisma.fournisseur.findMany({
          where: { etablissementId: etabId, deletedAt: null },
          select: { id: true, nom: true, adresse: true, email: true, telephone: true },
          orderBy: { nom: "asc" },
        })
      : [],
    etabId
      ? prisma.contrat.findMany({
          where: { etablissementId: etabId, statut: "ACTIF" },
          select: {
            id: true,
            reference: true,
            objet: true,
            fournisseurId: true,
            fournisseur: { select: { id: true, nom: true, adresse: true, email: true, telephone: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [],
  ]);

  return (
    <NouveauBonForm
      etablissement={etablissement}
      fournisseurs={JSON.parse(JSON.stringify(fournisseurs))}
      contrats={JSON.parse(JSON.stringify(contrats))}
      preselectedContratId={preselectedContratId ?? null}
    />
  );
}
