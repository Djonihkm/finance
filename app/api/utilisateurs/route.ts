import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const etablissementId = searchParams.get("etablissementId");

  const where: Record<string, unknown> = { isActive: true, deletedAt: null };

  if (session.role === "SUPER_ADMIN" || session.role === "MINISTERE") {
    if (etablissementId) where.etablissementId = etablissementId;
  } else {
    where.etablissementId = session.etablissementId;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      telephone: true,
      poste: true,
      isActive: true,
      createdAt: true,
      etablissement: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE" && session.role !== "ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const { nom, prenom, email, password, role, telephone, poste, etablissementId } = body;

  if (!nom || !prenom || !email || !password || !role) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { nom, prenom, email, password: hashed, role, telephone, poste, etablissementId: etablissementId ?? null },
    select: { id: true, nom: true, prenom: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
