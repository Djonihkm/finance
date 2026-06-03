import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import FournisseurDetailView from "./_components/FournisseurDetailView";

export default async function FournisseurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const fournisseur = await prisma.fournisseur.findUnique({
    where: { id, deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      marches: {
        select: { id: true, reference: true, objet: true, statut: true, montantEstime: true },
        orderBy: { createdAt: "desc" },
      },
      contrats: {
        select: { id: true, reference: true, objet: true, statut: true, montantTotal: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!fournisseur) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">{fournisseur.nom}</h1>
        <p className="text-sm text-gray-500 mt-1">Détail du fournisseur</p>
      </div>
      <FournisseurDetailView
        fournisseur={JSON.parse(JSON.stringify(fournisseur))}
        userPrismaRole={session.role}
      />
    </div>
  );
}
