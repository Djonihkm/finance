import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const classes = await prisma.classe.findMany({
    orderBy: { numero: "asc" },
    include: {
      comptes: {
        orderBy: { numero: "asc" },
        include: {
          enfants: { orderBy: { numero: "asc" } },
          _count: {
            select: {
              depensesCharge: true,
              bonsCharge: true,
              ecritures: true,
              entreesProduitsCompte: true,
              entreesTresorerie: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 });
  }

  const body = await req.json();
  const { numero, nom, classeId, parentId } = body;

  if (!numero || !nom || !classeId) {
    return NextResponse.json({ error: "Numéro, nom et classe requis" }, { status: 400 });
  }

  const exists = await prisma.compte.findUnique({ where: { numero } });
  if (exists) {
    return NextResponse.json({ error: `Le compte ${numero} existe déjà` }, { status: 409 });
  }

  const compte = await prisma.compte.create({
    data: {
      numero,
      nom,
      classeId: parseInt(classeId),
      parentId: parentId ? parseInt(parentId) : null,
    },
  });

  return NextResponse.json(compte, { status: 201 });
}
