import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getGrandLivre } from "@/lib/queries/grandLivre";
import { prisma } from "@/lib/prisma";
import GrandLivreView from "@/app/components/grand-livre/GrandLivreView";

interface Props {
  searchParams: Promise<{ annee?: string; compte?: string }>;
}

export default async function GrandLivrePage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rolesAutorises = ["DIRECTEUR", "COMPTABLE", "ADMIN"];
  if (!rolesAutorises.includes(session.role)) redirect("/");

  if (!session.etablissementId) redirect("/");

  const { annee: anneeParam, compte: compteNumero } = await searchParams;
  const annee = anneeParam ? parseInt(anneeParam) : new Date().getFullYear();

  // Requêtes en parallèle
  const [grandLivre, comptes] = await Promise.all([
    getGrandLivre({
      etablissementId: session.etablissementId,
      annee,
      compteNumero,
    }),
    // Liste de tous les comptes mouvementés — pour le filtre
    prisma.compte.findMany({
      where: {
        ecritures: {
          some: {
            depense: {
              etablissementId: session.etablissementId,
            },
          },
        },
      },
      select: { id: true, numero: true, nom: true },
      orderBy: { numero: "asc" },
    }),
  ]);

  return (
    <GrandLivreView
      grandLivre={grandLivre}
      anneeSelectionnee={annee}
      compteSelectionnee={compteNumero}
      comptesDisponibles={comptes}
    />
  );
}