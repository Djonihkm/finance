import { notFound } from "next/navigation";
import { getUserById } from "@/lib/queries";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils/serialize";
import UtilisateurDetailView from "./_components/UtilisateurDetailView";

export default async function UtilisateurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [user, etablissements] = await Promise.all([
    getUserById(id),
    prisma.etablissement.findMany({
      where: { deletedAt: null, isActive: true },
      select: { id: true, nom: true },
      orderBy: { nom: "asc" },
    }),
  ]);
  if (!user) notFound();

  return <UtilisateurDetailView data={serialize(user)} etablissements={etablissements} />;
}
