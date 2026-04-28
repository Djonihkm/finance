import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendWelcomeEmail } from "@/lib/mailer";

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
  const { nom, prenom, email, role, telephone, poste, etablissementId } = body;

  if (!nom || !prenom || !email || !role) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
  }

  const tempPassword = crypto.randomBytes(16).toString("hex");
  const hashed = await bcrypt.hash(tempPassword, 10);
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExp = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  const user = await prisma.user.create({
    data: {
      nom, prenom, email, role,
      telephone: telephone || null,
      poste: poste || null,
      etablissementId: etablissementId || null,
      password: hashed,
      resetToken,
      resetTokenExp,
      isActive: false,
    },
    select: { id: true, nom: true, prenom: true, email: true, role: true, createdAt: true },
  });

  try {
    await sendWelcomeEmail(email, prenom, resetToken);
  } catch {
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json({ error: "Impossible d'envoyer l'email d'activation." }, { status: 500 });
  }

  return NextResponse.json(user, { status: 201 });
}
