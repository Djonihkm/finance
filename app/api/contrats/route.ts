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

  const contrats = await prisma.contrat.findMany({
    where: { ...(etabId ? { etablissementId: etabId } : {}) },
    include: {
      fournisseur: { select: { id: true, nom: true } },
      marche: { select: { id: true, reference: true, objet: true } },
      createdBy: { select: { nom: true, prenom: true } },
      resiliePar: { select: { nom: true, prenom: true } },
      bonsCommande: { select: { id: true, reference: true, montantTotal: true, statut: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contrats);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (session.role !== "COMPTABLE" && session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE") {
    return NextResponse.json({ error: "Non autorisé — réservé au comptable" }, { status: 403 });
  }

  const body = await req.json();
  const { objet, description, montantTotal, dateDebut, dateFin, marcheId, etablissementId } = body;

  if (!objet || !montantTotal || !dateDebut || !dateFin || !marcheId) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const marche = await prisma.marche.findUnique({
    where: { id: marcheId },
    include: { contrat: true },
  });

  if (!marche) return NextResponse.json({ error: "Marché introuvable" }, { status: 404 });
  if (marche.statut !== "ATTRIBUE") {
    return NextResponse.json({ error: "Le marché doit être attribué avant de créer un contrat" }, { status: 409 });
  }
  if (marche.contrat) {
    return NextResponse.json({ error: "Un contrat existe déjà pour ce marché" }, { status: 409 });
  }
  if (!marche.fournisseurId) {
    return NextResponse.json({ error: "Aucun fournisseur attribué à ce marché" }, { status: 409 });
  }

  const etabId = etablissementId ?? session.etablissementId ?? marche.etablissementId;
  if (!etabId) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });

  const year = new Date().getFullYear();
  const count = await prisma.contrat.count();
  const reference = `CTR-${year}-${String(count + 1).padStart(4, "0")}`;

  const contrat = await prisma.$transaction(async (tx) => {
    const c = await tx.contrat.create({
      data: {
        reference,
        objet,
        description: description || null,
        montantTotal,
        dateDebut: new Date(dateDebut),
        dateFin: new Date(dateFin),
        marcheId,
        fournisseurId: marche.fournisseurId!,
        etablissementId: etabId,
        createdById: session.userId,
      },
    });
    await tx.historique.create({
      data: { action: "CREE", userId: session.userId, contratId: c.id },
    });
    return c;
  });

  return NextResponse.json(contrat, { status: 201 });
}
