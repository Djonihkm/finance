import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const etablissements = await prisma.etablissement.findMany({
    where: { isActive: true, deletedAt: null },
    include: {
      budgets: { orderBy: { annee: "desc" }, take: 1 },
      _count: { select: { users: true, depenses: true, bons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(etablissements);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { nom, code, type, adresse, ville, region, telephone, email } = body;

  if (!nom || !code || !type) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const etablissement = await prisma.etablissement.create({
    data: { nom, code, type, adresse, ville, region, telephone, email, createdById: session.userId },
  });

  return NextResponse.json(etablissement, { status: 201 });
}
