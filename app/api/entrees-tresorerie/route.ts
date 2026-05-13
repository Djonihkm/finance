// ============================================================
// app/api/entrees-tresorerie/route.ts
// CRUD des entrées de trésorerie
// L'etablissementId vient toujours de la session
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const ROLES_AUTORISES = ["DIRECTEUR", "COMPTABLE", "ADMIN"];

// ============================================================
// GET — Récupérer toutes les entrées d'une année
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

  const entrees = await prisma.entreeTresorerie.findMany({
    where: {
      etablissementId: session.etablissementId,
      annee,
    },
    include: {
      compte: {
        select: { id: true, numero: true, nom: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(entrees);
}

// ============================================================
// POST — Créer une nouvelle entrée
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
  const { date, libelle, montant, compteId } = body;

  // Validation basique
  if (!date || !libelle || !montant || !compteId) {
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

  // Vérifier que le compte est bien un compte de trésorerie (classe 5)
  const compte = await prisma.compte.findFirst({
    where: {
      id: compteId,
      classe: { numero: "5" },
    },
  });

  if (!compte) {
    return NextResponse.json(
      { error: "Le compte doit être un compte de trésorerie (classe 5)" },
      { status: 400 }
    );
  }

  const annee = new Date(date).getFullYear();

  const entree = await prisma.entreeTresorerie.create({
    data: {
      date:            new Date(date),
      libelle,
      montant,
      annee,
      compteId,
      etablissementId: session.etablissementId,
    },
    include: {
      compte: {
        select: { id: true, numero: true, nom: true },
      },
    },
  });

  return NextResponse.json(entree, { status: 201 });
}