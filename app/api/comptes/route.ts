import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session"; // ← ta fonction existante

export async function GET(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const classe = searchParams.get("classe");

  const comptes = await prisma.compte.findMany({
    where: classe ? { numero: { startsWith: "6" } } : undefined,
    orderBy: { numero: "asc" },
  });

  return NextResponse.json(comptes);
}