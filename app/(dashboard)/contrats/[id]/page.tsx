import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import ContratDetailView from "./_components/ContratDetailView";

export default async function ContratDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  const contrat = await prisma.contrat.findUnique({
    where: { id },
    include: {
      fournisseur: { select: { id: true, nom: true, telephone: true, email: true, rccm: true } },
      marche: { select: { id: true, reference: true, objet: true, type: true, montantEstime: true } },
      createdBy: { select: { nom: true, prenom: true } },
      resiliePar: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
      bonsCommande: {
        select: { id: true, reference: true, montantTotal: true, statut: true, date: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contrat) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#11355b]">Contrat</h1>
        <p className="text-sm text-gray-500 mt-1">{contrat.reference}</p>
      </div>
      <ContratDetailView
        contrat={JSON.parse(JSON.stringify(contrat))}
        userPrismaRole={session.role}
      />
    </div>
  );
}
