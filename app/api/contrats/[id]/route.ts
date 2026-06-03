import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const contrat = await prisma.contrat.findUnique({
    where: { id },
    include: {
      fournisseur: { select: { id: true, nom: true, telephone: true, email: true, rccm: true } },
      marche: { select: { id: true, reference: true, objet: true, type: true, montantEstime: true } },
      createdBy: { select: { nom: true, prenom: true } },
      resiliePar: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
      bonsCommande: {
        select: { id: true, reference: true, montantTotal: true, statut: true, date: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contrat) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(contrat);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action, motifResiliation } = body;

  if (action === "resilier") {
    const allowed = ["SUPER_ADMIN", "MINISTERE", "DIRECTEUR", "COMPTABLE"];
    if (!allowed.includes(session.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const existing = await prisma.contrat.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    if (existing.statut === "RESILIE") {
      return NextResponse.json({ error: "Ce contrat est déjà résilié" }, { status: 409 });
    }

    const contrat = await prisma.contrat.update({
      where: { id },
      data: {
        statut: "RESILIE",
        resilieParId: session.userId,
        resilieAt: new Date(),
        motifResiliation: motifResiliation || null,
      },
    });

    return NextResponse.json(contrat);
  }

  return NextResponse.json({ error: "Action non reconnue" }, { status: 400 });
}
