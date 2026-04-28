import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { resetToken: token } });

  if (!user || !user.resetTokenExp || user.resetTokenExp < new Date()) {
    return NextResponse.json(
      { error: "Ce lien est invalide ou a expiré." },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashed,
      resetToken: null,
      resetTokenExp: null,
      isActive: true,
    },
  });

  return NextResponse.json({ ok: true });
}
