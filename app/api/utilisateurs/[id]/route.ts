import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, nom: true, prenom: true, email: true, role: true,
      telephone: true, poste: true, isActive: true, createdAt: true,
      etablissement: { select: { id: true, nom: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.nom !== undefined) data.nom = body.nom;
  if (body.prenom !== undefined) data.prenom = body.prenom;
  if (body.telephone !== undefined) data.telephone = body.telephone;
  if (body.poste !== undefined) data.poste = body.poste;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  if (body.newPassword && body.currentPassword) {
    const userWithPwd = await prisma.user.findUnique({ where: { id } });
    if (!userWithPwd) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    const valid = await bcrypt.compare(body.currentPassword, userWithPwd.password);
    if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
    data.password = await bcrypt.hash(body.newPassword, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, nom: true, prenom: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.user.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
