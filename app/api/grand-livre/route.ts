// ============================================================
// app/api/grand-livre/route.ts
// API route pour le grand livre d'un établissement
// L'etablissementId vient toujours de la session — jamais de l'URL
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getGrandLivre } from "@/lib/queries/grandLivre";

const ROLES_AUTORISES = ["DIRECTEUR", "COMPTABLE", "ADMIN"];

export async function GET(req: NextRequest) {

  // 1. Vérifier l'authentification
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // 2. Vérifier le rôle
  if (!ROLES_AUTORISES.includes(session.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // 3. L'etablissementId vient de la session — jamais de l'URL
  const etablissementId = session.etablissementId;
  if (!etablissementId) {
    return NextResponse.json(
      { error: "Aucun établissement lié à ce compte" },
      { status: 400 }
    );
  }

  // 4. Récupérer les paramètres depuis l'URL
  const { searchParams } = new URL(req.url);

  // Année — par défaut l'année en cours
  const anneeParam = searchParams.get("annee");
  const annee = anneeParam
    ? parseInt(anneeParam)
    : new Date().getFullYear();

  if (isNaN(annee) || annee < 2000 || annee > 2100) {
    return NextResponse.json({ error: "Année invalide" }, { status: 400 });
  }

  // Filtre optionnel par numéro de compte
  const compteNumero = searchParams.get("compte") ?? undefined;

  // 5. Calculer le grand livre
  try {
    const grandLivre = await getGrandLivre({
      etablissementId,
      annee,
      compteNumero,
    });
    return NextResponse.json(grandLivre);
  } catch (error) {
    console.error("Erreur grand livre:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul du grand livre" },
      { status: 500 }
    );
  }
}