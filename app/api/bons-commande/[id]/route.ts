import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const bon = await prisma.bonCommande.findUnique({
    where: { id, deletedAt: null },
    include: {
      lignes: true,
      createdBy: { select: { id: true, nom: true, prenom: true } },
      signePar: { select: { id: true, nom: true, prenom: true } },
      validePar: { select: { id: true, nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
      historiques: { include: { user: { select: { nom: true, prenom: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!bon) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(bon);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  if (action === "signer") {
    if (session.role !== "DIRECTEUR" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const bon = await prisma.$transaction(async (tx) => {
      const b = await tx.bonCommande.update({
        where: { id },
        data: { statut: "REVIEW", signeParId: session.userId, signeAt: new Date() },
      });
      await tx.historique.create({ data: { action: "SIGNE", userId: session.userId, bonCommandeId: id } });
      return b;
    });
    return NextResponse.json(bon);
  }

  if (action === "valider") {
    if (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const bon = await prisma.$transaction(async (tx) => {
      const existing = await tx.bonCommande.findUnique({ where: { id } });
      if (!existing) throw new Error("Introuvable");

      const b = await tx.bonCommande.update({
        where: { id },
        data: { statut: "VALIDE", valideParId: session.userId, valideAt: new Date(), commentaire: body.commentaire },
      });

      const year = new Date(existing.date).getFullYear();
      await tx.budget.updateMany({
        where: { etablissementId: existing.etablissementId, annee: year },
        data: { montantConsomme: { increment: existing.montantTotal } },
      });

      await tx.historique.create({
        data: { action: "VALIDE", userId: session.userId, bonCommandeId: id, commentaire: body.commentaire },
      });
      return b;
    });
    return NextResponse.json(bon);
  }

  if (action === "rejeter") {
    const bon = await prisma.$transaction(async (tx) => {
      const b = await tx.bonCommande.update({
        where: { id },
        data: { statut: "REJETE", valideParId: session.userId, valideAt: new Date(), commentaire: body.commentaire },
      });
      await tx.historique.create({
        data: { action: "REJETE", userId: session.userId, bonCommandeId: id, commentaire: body.commentaire },
      });
      return b;
    });
    return NextResponse.json(bon);
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await prisma.bonCommande.update({
    where: { id, statut: "REVIEW", createdById: session.userId },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
