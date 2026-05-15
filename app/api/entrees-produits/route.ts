// ============================================================
// app/api/entrees-produits/route.ts
// CRUD des entrées de produits (dons, subventions, frais...)
// L'etablissementId vient toujours de la session
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { genererEcrituresEntreeProduit } from "@/lib/comptabilite";

const ROLES_AUTORISES = ["DIRECTEUR", "COMPTABLE", "ADMIN"];

// ============================================================
// GET — Récupérer toutes les entrées de produits d'une année
// ============================================================
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!session.etablissementId) {
    return NextResponse.json({ error: "Aucun établissement lié" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const annee = parseInt(searchParams.get("annee") ?? `${new Date().getFullYear()}`);

  const debut = new Date(`${annee}-01-01T00:00:00.000Z`);
  const fin   = new Date(`${annee}-12-31T23:59:59.999Z`);

  const entrees = await prisma.entreeProduit.findMany({
    where: {
      etablissementId: session.etablissementId,
      deletedAt:       null,
      date:            { gte: debut, lte: fin },
    },
    include: {
      compte:          { select: { id: true, numero: true, nom: true } },
      compteTresorerie:{ select: { id: true, numero: true, nom: true } },
      createdBy:       { select: { nom: true, prenom: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(entrees);
}

// ============================================================
// POST — Créer une nouvelle entrée de produit
// Génère automatiquement les deux écritures comptables
// ============================================================
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (!ROLES_AUTORISES.includes(session.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  if (!session.etablissementId) {
    return NextResponse.json({ error: "Aucun établissement lié" }, { status: 400 });
  }

  const body = await req.json();
  const { date, libelle, montant, compteId, compteTresorerieId, description } = body;

  // Validation des champs requis
  if (!date || !libelle || !montant || !compteId || !compteTresorerieId) {
    return NextResponse.json(
      { error: "Tous les champs sont requis" },
      { status: 400 }
    );
  }

  if (montant <= 0) {
    return NextResponse.json(
      { error: "Le montant doit être supérieur à 0" },
      { status: 400 }
    );
  }

  try {
    const entree = await prisma.$transaction(async (tx) => {

      // 1. Générer la référence unique
      const annee     = new Date(date).getFullYear();
      const count     = await tx.entreeProduit.count();
      const reference = `PRD-${annee}-${String(count + 1).padStart(4, "0")}`;

      // 2. Créer l'entrée de produit
      const nouvelleEntree = await tx.entreeProduit.create({
        data: {
          reference,
          date:              new Date(date),
          libelle,
          montant,
          description:       description ?? null,
          compteId:          parseInt(compteId),
          compteTresorerieId: parseInt(compteTresorerieId),
          etablissementId:   session.etablissementId!,
          createdById:       session.userId,
        },
        include: {
          compte:           { select: { id: true, numero: true, nom: true } },
          compteTresorerie: { select: { id: true, numero: true, nom: true } },
        },
      });

      // 3. Générer les deux écritures comptables (partie double)
      //   DÉBIT  classe 5 (trésorerie) ← l'argent entre
      //   CRÉDIT classe 7 (produit)    ← le produit est constaté
      await genererEcrituresEntreeProduit({
        tx,
        entreeProduitId:   nouvelleEntree.id,
        compteId:          parseInt(compteId),
        compteTresorerieId: parseInt(compteTresorerieId),
        montant:           parseFloat(montant),
        libelle,
        date:              new Date(date),
      });

      return nouvelleEntree;
    });

    return NextResponse.json(entree, { status: 201 });

  } catch (error) {
    console.error("Erreur création entrée produit:", error);
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}