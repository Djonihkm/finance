import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const depense = await prisma.depense.findUnique({
    where: { id, deletedAt: null },
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
      signePar: { select: { id: true, nom: true, prenom: true } },
      validePar: { select: { id: true, nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
      historiques: { include: { user: { select: { nom: true, prenom: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!depense) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(depense);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  if (action === "valider") {
    if (session.role !== "DIRECTEUR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const existing = await tx.depense.findUnique({ where: { id } });
      if (!existing) throw new Error("Introuvable");

      const d = await tx.depense.update({
        where: { id },
        data: { statut: "VALIDE", valideParId: session.userId, valideAt: new Date() },
      });

      const year = new Date(existing.date).getFullYear();
      await tx.budget.updateMany({
        where: { etablissementId: existing.etablissementId, annee: year },
        data: { montantConsomme: { increment: existing.montant } },
      });

      await tx.historique.create({
        data: { action: "VALIDE", userId: session.userId, depenseId: id },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  if (action === "rejeter") {
    if (session.role !== "DIRECTEUR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const d = await tx.depense.update({
        where: { id },
        data: { statut: "REJETE", valideParId: session.userId, valideAt: new Date(), commentaire: body.commentaire },
      });
      await tx.historique.create({
        data: { action: "REJETE", userId: session.userId, depenseId: id, commentaire: body.commentaire },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  if (action === "resoumettre") {
    if (session.role !== "COMPTABLE" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const d = await tx.depense.update({
        where: { id, statut: "REVISION" },
        data: { statut: "ATTENTE", commentaire: null },
      });
      await tx.historique.create({
        data: { action: "SOUMIS", userId: session.userId, depenseId: id },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  if (action === "renvoyer") {
    if (session.role !== "DIRECTEUR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const d = await tx.depense.update({
        where: { id },
        data: { statut: "REVISION", commentaire: body.commentaire },
      });
      await tx.historique.create({
        data: { action: "MODIFIE", userId: session.userId, depenseId: id, commentaire: body.commentaire },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  // Simple update (ATTENTE only)
  const depense = await prisma.depense.update({
    where: { id, statut: { in: ["ATTENTE", "REVISION"] } },
    data: {
      intitule: body.intitule,
      montant: body.montant,
      categorie: body.categorie,
      paiement: body.paiement,
      fournisseur: body.fournisseur,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
    },
  });
  return NextResponse.json(depense);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await prisma.depense.update({
    where: { id, statut: "ATTENTE", createdById: session.userId },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
