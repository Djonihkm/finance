// ============================================================
// app/api/etat-financier/route.ts
// API route pour l'état financier d'un établissement
// L'etablissementId vient toujours de la session — jamais de l'URL
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getEtatFinancier } from "@/lib/queries/etat-financier";

// Rôles autorisés à consulter l'état financier
const ROLES_AUTORISES = ["DIRECTEUR", "COMPTABLE", "ADMIN", "MINISTERE", "SUPER_ADMIN"];

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

  // 3. Récupérer l'établissementId depuis la session
  //    Jamais depuis l'URL — un directeur ne voit que son établissement
  const etablissementId = session.etablissementId;
  if (!etablissementId) {
    return NextResponse.json(
      { error: "Aucun établissement lié à ce compte" },
      { status: 400 }
    );
  }

  // 4. Récupérer l'année depuis les query params
  //    Par défaut : l'année en cours
  const { searchParams } = new URL(req.url);
  const anneeParam = searchParams.get("annee");
  const annee = anneeParam
    ? parseInt(anneeParam)
    : new Date().getFullYear();

  // Valider que l'année est un nombre valide
  if (isNaN(annee) || annee < 2000 || annee > 2100) {
    return NextResponse.json(
      { error: "Année invalide" },
      { status: 400 }
    );
  }

  // 5. Calculer l'état financier
  try {
    const etat = await getEtatFinancier({ etablissementId, annee });
    return NextResponse.json(etat);
  } catch (error) {
    console.error("Erreur état financier:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul de l'état financier" },
      { status: 500 }
    );
  }
}