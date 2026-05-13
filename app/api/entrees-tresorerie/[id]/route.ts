// ============================================================
// app/api/entrees-tresorerie/[id]/route.ts
// Suppression d'une entrée de trésorerie
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

  // Vérifier que l'entrée appartient bien à l'établissement de l'utilisateur
  const entree = await prisma.entreeTresorerie.findFirst({
    where: {
      id,
      etablissementId: session.etablissementId,
    },
  });

  if (!entree) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  await prisma.entreeTresorerie.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}