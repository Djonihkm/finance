import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const fournisseur = await prisma.fournisseur.findUnique({
    where: { id, deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      marches: {
        select: { id: true, reference: true, objet: true, statut: true, montantEstime: true },
        orderBy: { createdAt: "desc" },
      },
      contrats: {
        select: { id: true, reference: true, objet: true, statut: true, montantTotal: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!fournisseur) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(fournisseur);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (session.role === "DIRECTEUR") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { nom, telephone, email, adresse, rccm, nif, categorie } = body;

  if (!nom || !categorie) {
    return NextResponse.json({ error: "Nom et catégorie requis" }, { status: 400 });
  }

  const fournisseur = await prisma.fournisseur.update({
    where: { id },
    data: {
      nom,
      telephone: telephone || null,
      email: email || null,
      adresse: adresse || null,
      rccm: rccm || null,
      nif: nif || null,
      categorie,
    },
  });

  return NextResponse.json(fournisseur);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (session.role === "DIRECTEUR" || session.role === "COMPTABLE") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const linked = await prisma.marche.count({ where: { fournisseurId: id } });
  if (linked > 0) {
    return NextResponse.json({ error: "Ce fournisseur est lié à un ou plusieurs marchés" }, { status: 409 });
  }

  await prisma.fournisseur.update({ where: { id }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}
