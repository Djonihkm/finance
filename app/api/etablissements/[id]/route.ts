import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const etab = await prisma.etablissement.findUnique({
    where: { id, isActive: true, deletedAt: null },
    include: {
      users: { where: { isActive: true, deletedAt: null }, orderBy: { createdAt: "asc" } },
      budgets: { orderBy: { annee: "desc" } },
      depenses: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20 },
      bons: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  if (!etab) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(etab);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.nom !== undefined) data.nom = body.nom;
  if (body.type !== undefined) data.type = body.type;
  if (body.adresse !== undefined) data.adresse = body.adresse;
  if (body.ville !== undefined) data.ville = body.ville;
  if (body.region !== undefined) data.region = body.region;
  if (body.telephone !== undefined) data.telephone = body.telephone;
  if (body.email !== undefined) data.email = body.email;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const etab = await prisma.etablissement.update({ where: { id }, data });

  return NextResponse.json(etab);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.etablissement.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
