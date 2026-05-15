// app/etat-financier/page.tsx
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getEtatFinancier } from "@/lib/queries/etat-financier";
import EtatFinancierView from "@/app/components/etat-financier/EtatFinancierView";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ annee?: string }>;
}

export default async function EtatFinancierPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const rolesAutorises = ["DIRECTEUR", "COMPTABLE", "ADMIN"];
  if (!rolesAutorises.includes(session.role)) redirect("/");

  if (!session.etablissementId) redirect("/");

  const { annee: anneeParam } = await searchParams;
  const annee = anneeParam ? parseInt(anneeParam) : new Date().getFullYear();

  // --- DÉBUT DES MODIFICATIONS ---

  // On ajoute une troisième requête pour les comptes de produits
  const [etat, comptesTresorerie, comptesProduits] = await Promise.all([
    getEtatFinancier({
      etablissementId: session.etablissementId,
      annee,
    }),
    prisma.compte.findMany({
      where: {
        classe: { numero: "5" },
        numero: { in: ["5200", "5201", "5700", "5701"] },
      },
      select: { id: true, numero: true, nom: true },
      orderBy: { numero: "asc" },
    }),
    // NOUVELLE REQUÊTE : On récupère les comptes de la Classe 7
    prisma.compte.findMany({
      where: {
        classe: { numero: "7" }, // <-- On filtre pour la Classe 7
      },
      select: { id: true, numero: true, nom: true },
      orderBy: { numero: "asc" }, // On les trie par numéro
    }),
  ]);

  // --- FIN DES MODIFICATIONS ---

  return (
    <EtatFinancierView
      etat={etat}
      anneeSelectionnee={annee}
      userPrismaRole={session.role}
      comptesTresorerie={comptesTresorerie}
      // On envoie la nouvelle liste de comptes en prop
      comptesProduits={comptesProduits}
    />
  );
}