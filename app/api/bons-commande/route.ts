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

  const bons = await prisma.bonCommande.findMany({
    where,
    include: {
      lignes: true,
      createdBy: { select: { id: true, nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bons);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json();
  const { intitule, fournisseur, description, date, lignes, etablissementId } = body;

  if (!intitule || !date || !lignes?.length) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const etabId = etablissementId ?? session.etablissementId;
  if (!etabId) return NextResponse.json({ error: "Établissement requis" }, { status: 400 });

  const montantTotal = lignes.reduce(
    (sum: number, l: { quantite: number; prixUnitaire: number }) => sum + l.quantite * l.prixUnitaire,
    0
  );

  const year = new Date(date).getFullYear();
  const count = await prisma.bonCommande.count();
  const reference = `BON-${year}-${String(count + 1).padStart(4, "0")}`;

  const bon = await prisma.bonCommande.create({
    data: {
      reference,
      intitule,
      fournisseur,
      description,
      date: new Date(date),
      montantTotal,
      etablissementId: etabId,
      createdById: session.userId,
      lignes: {
        create: lignes.map((l: { designation: string; quantite: number; prixUnitaire: number }) => ({
          designation: l.designation,
          quantite: l.quantite,
          prixUnitaire: l.prixUnitaire,
          montant: l.quantite * l.prixUnitaire,
        })),
      },
    },
    include: { lignes: true, createdBy: { select: { id: true, nom: true, prenom: true } } },
  });

  return NextResponse.json(bon, { status: 201 });
}
