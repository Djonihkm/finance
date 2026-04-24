import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const etablissementId = searchParams.get("etablissementId");
  const statut = searchParams.get("statut");

  const where: Record<string, unknown> = { deletedAt: null };

  if (session.role === "SUPER_ADMIN" || session.role === "MINISTERE") {
    if (etablissementId) where.etablissementId = etablissementId;
  } else {
    where.etablissementId = session.etablissementId;
  }

  if (statut) where.statut = statut;

  const depenses = await prisma.depense.findMany({
    where,
    include: {
      createdBy: { select: { id: true, nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(depenses);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { intitule, montant, categorie, paiement, fournisseur, description, date, etablissementId } = body;

  if (!intitule || !montant || !categorie || !paiement || !date) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const etabId = etablissementId ?? session.etablissementId;
  if (!etabId) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });

  const year = new Date(date).getFullYear();
  const count = await prisma.depense.count();
  const reference = `DEP-${year}-${String(count + 1).padStart(4, "0")}`;

  const depense = await prisma.depense.create({
    data: {
      reference,
      intitule,
      montant,
      categorie,
      paiement,
      fournisseur,
      description,
      date: new Date(date),
      etablissementId: etabId,
      createdById: session.userId,
    },
    include: { createdBy: { select: { id: true, nom: true, prenom: true } } },
  });

  return NextResponse.json(depense, { status: 201 });
}
