import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 });
  }

  const { id } = await params;
  const { nom } = await req.json();
  if (!nom?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });

  const compte = await prisma.compte.update({
    where: { id: parseInt(id) },
    data: { nom: nom.trim() },
  });

  return NextResponse.json(compte);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Réservé au super-administrateur" }, { status: 403 });
  }

  const { id } = await params;
  const numId = parseInt(id);

  const compte = await prisma.compte.findUnique({
    where: { id: numId },
    include: {
      _count: {
        select: {
          depensesCharge: true,
          bonsCharge: true,
          ecritures: true,
          entreesProduitsCompte: true,
          entreesTresorerie: true,
          enfants: true,
        },
      },
    },
  });

  if (!compte) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const utilisations =
    compte._count.depensesCharge +
    compte._count.bonsCharge +
    compte._count.ecritures +
    compte._count.entreesProduitsCompte +
    compte._count.entreesTresorerie +
    compte._count.enfants;

  if (utilisations > 0) {
    return NextResponse.json(
      { error: "Ce compte est utilisé et ne peut pas être supprimé" },
      { status: 409 }
    );
  }

  await prisma.compte.delete({ where: { id: numId } });
  return new NextResponse(null, { status: 204 });
}
