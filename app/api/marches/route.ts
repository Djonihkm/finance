import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const etablissementId = searchParams.get("etablissementId");

  const etabId =
    session.role === "SUPER_ADMIN" || session.role === "MINISTERE"
      ? (etablissementId ?? undefined)
      : session.etablissementId;

  const marches = await prisma.marche.findMany({
    where: { ...(etabId ? { etablissementId: etabId } : {}) },
    include: {
      fournisseur: { select: { id: true, nom: true } },
      attribuePar: { select: { nom: true, prenom: true } },
      createdBy: { select: { nom: true, prenom: true } },
      contrat: { select: { id: true, reference: true, statut: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(marches);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const allowed = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { objet, description, type, montantEstime, etablissementId } = body;

  if (!objet || !type || !montantEstime) {
    return NextResponse.json({ error: "Objet, type et montant estimé requis" }, { status: 400 });
  }

  const etabId = etablissementId ?? session.etablissementId;
  if (!etabId) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });

  const year = new Date().getFullYear();
  const count = await prisma.marche.count();
  const reference = `MRC-${year}-${String(count + 1).padStart(4, "0")}`;

  const marche = await prisma.marche.create({
    data: {
      reference,
      objet,
      description: description || null,
      type,
      montantEstime,
      etablissementId: etabId,
      createdById: session.userId,
    },
  });

  return NextResponse.json(marche, { status: 201 });
}
