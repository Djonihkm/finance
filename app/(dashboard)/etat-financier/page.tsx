import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getEtatFinancier } from "@/lib/queries/etat-financier";
import EtatFinancierView from "@/app/components/etat-financier/EtatFinancierView";

interface Props {
  searchParams: Promise<{ annee?: string }>;
}

export default async function EtatFinancierPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Seuls ces rôles peuvent accéder à l'état financier
  const rolesAutorises = ["DIRECTEUR", "COMPTABLE", "ADMIN"];
  if (!rolesAutorises.includes(session.role)) redirect("/");

  // L'établissementId vient de la session — jamais de l'URL
  if (!session.etablissementId) redirect("/");

  const { annee: anneeParam } = await searchParams;
  const annee = anneeParam ? parseInt(anneeParam) : new Date().getFullYear();

  const etat = await getEtatFinancier({
    etablissementId: session.etablissementId,
    annee,
  });

  return (
    <EtatFinancierView
      etat={etat}
      anneeSelectionnee={annee}
      userPrismaRole={session.role}
    />
  );
}