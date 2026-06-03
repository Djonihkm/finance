import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import MarcheDetailView from "./_components/MarcheDetailView";

export default async function MarcheDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const [marche, fournisseurs] = await Promise.all([
    prisma.marche.findUnique({
      where: { id },
      include: {
        fournisseur: { select: { id: true, nom: true, telephone: true, email: true } },
        attribuePar: { select: { nom: true, prenom: true } },
        createdBy: { select: { nom: true, prenom: true } },
        contrat: { select: { id: true, reference: true, statut: true } },
        etablissement: { select: { id: true, nom: true } },
      },
    }),
    session.etablissementId
      ? prisma.fournisseur.findMany({
          where: { etablissementId: session.etablissementId, deletedAt: null },
          select: { id: true, nom: true, categorie: true, telephone: true, email: true },
          orderBy: { nom: "asc" },
        })
      : [],
  ]);

  if (!marche) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">Marché</h1>
        <p className="text-sm text-gray-500 mt-1">{marche.reference}</p>
      </div>
      <MarcheDetailView
        marche={JSON.parse(JSON.stringify(marche))}
        fournisseurs={JSON.parse(JSON.stringify(fournisseurs))}
        userPrismaRole={session.role}
      />
    </div>
  );
}
