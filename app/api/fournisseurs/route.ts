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

  const fournisseurs = await prisma.fournisseur.findMany({
    where: { ...(etabId ? { etablissementId: etabId } : {}), deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      _count: { select: { marches: true, contrats: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(fournisseurs);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (session.role === "DIRECTEUR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { nom, telephone, email, adresse, rccm, nif, categorie, etablissementId } = body;

  if (!nom || !categorie) {
    return NextResponse.json({ error: "Nom et catégorie requis" }, { status: 400 });
  }

  const etabId = etablissementId ?? session.etablissementId;
  if (!etabId) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });

  const fournisseur = await prisma.$transaction(async (tx) => {
    const f = await tx.fournisseur.create({
      data: {
        nom,
        telephone: telephone || null,
        email: email || null,
        adresse: adresse || null,
        rccm: rccm || null,
        nif: nif || null,
        categorie,
        etablissementId: etabId,
        createdById: session.userId,
      },
    });
    await tx.historique.create({
      data: { action: "CREE", userId: session.userId, fournisseurId: f.id },
    });
    return f;
  });

  return NextResponse.json(fournisseur, { status: 201 });
}
