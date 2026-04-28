import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import NouveauUtilisateurView from "./_components/NouveauUtilisateurView";

export default async function NouvelUtilisateurPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE" && session.role !== "ADMIN") {
    redirect("/utilisateurs");
  }

  const etablissements = await prisma.etablissement.findMany({
    where: { deletedAt: null, isActive: true },
    select: { id: true, nom: true },
    orderBy: { nom: "asc" },
  });

  return <NouveauUtilisateurView etablissements={etablissements} />;
}
