import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const CAN_CREATE = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const etablissementId = searchParams.get("etablissementId");

  const where: Record<string, unknown> = { deletedAt: null };

  if (session.role === "SUPER_ADMIN" || session.role === "MINISTERE") {
    if (etablissementId) where.etablissementId = etablissementId;
  } else {
    where.etablissementId = session.etablissementId;
  }

  const items = await prisma.immobilisation.findMany({
    where,
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      fournisseur: { select: { id: true, nom: true } },
      bonCommande: { select: { id: true, reference: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (!CAN_CREATE.includes(session.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const {
    designation, description, categorie, etat,
    valeurAcquisition, dateAcquisition, numSerie, localisation,
    bonCommandeId, fournisseurId, etablissementId,
  } = body;

  if (!designation || !categorie || !valeurAcquisition || !dateAcquisition) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const etabId = etablissementId ?? session.etablissementId;
  if (!etabId) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });

  const year = new Date(dateAcquisition).getFullYear();
  const count = await prisma.immobilisation.count({ where: { etablissementId: etabId } });
  const reference = `IMM-${year}-${String(count + 1).padStart(4, "0")}`;

  const immo = await prisma.$transaction(async (tx) => {
    const i = await tx.immobilisation.create({
      data: {
        reference,
        designation,
        description: description || null,
        categorie,
        etat: etat || "NEUF",
        valeurAcquisition,
        dateAcquisition: new Date(dateAcquisition),
        numSerie: numSerie || null,
        localisation: localisation || null,
        bonCommandeId: bonCommandeId || null,
        fournisseurId: fournisseurId || null,
        etablissementId: etabId,
        createdById: session.userId,
      },
      include: {
        createdBy: { select: { nom: true, prenom: true } },
        fournisseur: { select: { id: true, nom: true } },
        bonCommande: { select: { id: true, reference: true } },
      },
    });
    await tx.historique.create({
      data: { action: "CREE", userId: session.userId, immobilisationId: i.id },
    });
    return i;
  });

  return NextResponse.json(immo, { status: 201 });
}
