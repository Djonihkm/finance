import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const etablissementId = searchParams.get("etablissementId") ?? session.etablissementId;
  const annee = searchParams.get("annee");

  const where: Record<string, unknown> = {};
  if (etablissementId) where.etablissementId = etablissementId;
  if (annee) where.annee = parseInt(annee);

  const budgets = await prisma.budget.findMany({
    where,
    include: { etablissement: { select: { id: true, nom: true } } },
    orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(budgets);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { annee, montantTotal, etablissementId } = body;

  if (!annee || !montantTotal || !etablissementId) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const budget = await prisma.budget.create({
    data: { annee: parseInt(annee), montantTotal, etablissementId },
  });

  return NextResponse.json(budget, { status: 201 });
}
