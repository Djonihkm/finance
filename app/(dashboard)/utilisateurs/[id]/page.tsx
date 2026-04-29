import { notFound, redirect } from "next/navigation";
import { getUserById } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils/serialize";
import UtilisateurDetailView from "./_components/UtilisateurDetailView";

export default async function UtilisateurDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const isEtabAdmin = session.role === "ADMIN";

  const [user, etablissements] = await Promise.all([
    getUserById(id),
    isEtabAdmin
      ? Promise.resolve([])
      : prisma.etablissement.findMany({
          where: { deletedAt: null, isActive: true },
          select: { id: true, nom: true },
          orderBy: { nom: "asc" },
        }),
  ]);

  if (!user) notFound();

  // ADMIN ne peut voir que les utilisateurs de son établissement
  if (isEtabAdmin && user.etablissement?.id !== session.etablissementId) {
    notFound();
  }

  return <UtilisateurDetailView data={serialize(user)} etablissements={etablissements} isEtabAdmin={isEtabAdmin} />;
}
