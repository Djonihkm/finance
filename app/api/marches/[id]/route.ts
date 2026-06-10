import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const marche = await prisma.marche.findUnique({
    where: { id },
    include: {
      fournisseur: { select: { id: true, nom: true, telephone: true, email: true } },
      attribuePar: { select: { nom: true, prenom: true } },
      createdBy: { select: { nom: true, prenom: true } },
      contrat: true,
      etablissement: { select: { id: true, nom: true } },
    },
  });

  if (!marche) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(marche);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, objet, description, type, montantEstime, fournisseurId } = body;

  // Attribution du fournisseur
  if (action === "attribuer") {
    const allowed = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];
    if (!allowed.includes(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
    if (!fournisseurId) {
      return NextResponse.json({ error: "Fournisseur requis" }, { status: 400 });
    }

    const marche = await prisma.$transaction(async (tx) => {
      const m = await tx.marche.update({
        where: { id },
        data: {
          fournisseurId,
          statut: "ATTRIBUE",
          attribueParId: session.userId,
          attribueAt: new Date(),
        },
      });
      await tx.historique.create({
        data: { action: "ATTRIBUE", userId: session.userId, marcheId: id },
      });
      return m;
    });
    return NextResponse.json(marche);
  }

  // Modification du marché (uniquement si EN_ATTENTE)
  const allowed = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];
  if (!allowed.includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const existing = await prisma.marche.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  if (existing.statut === "ATTRIBUE") {
    return NextResponse.json({ error: "Un marché attribué ne peut plus être modifié" }, { status: 409 });
  }

  const marche = await prisma.marche.update({
    where: { id },
    data: {
      objet: objet ?? existing.objet,
      description: description ?? existing.description,
      type: type ?? existing.type,
      montantEstime: montantEstime ?? existing.montantEstime,
    },
  });

  return NextResponse.json(marche);
}
