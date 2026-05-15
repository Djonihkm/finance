// ============================================================
// app/api/entrees-produits/[id]/route.ts
// Suppression d'une entrée de produit (soft delete)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const ROLES_AUTORISES = ["DIRECTEUR", "COMPTABLE", "ADMIN"];

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
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

  const { id } = await params;

  // Vérifier que l'entrée appartient à l'établissement de l'utilisateur
  const entree = await prisma.entreeProduit.findFirst({
    where: {
      id,
      etablissementId: session.etablissementId,
      deletedAt:       null,
    },
  });

  if (!entree) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  // Soft delete — on ne supprime pas les écritures associées
  // pour garder la traçabilité comptable
  await prisma.entreeProduit.update({
    where: { id },
    data:  { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}