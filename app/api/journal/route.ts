import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const CAN_VIEW = ["SUPER_ADMIN", "MINISTERE", "DIRECTEUR", "ADMIN"];
const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!CAN_VIEW.includes(session.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const action    = searchParams.get("action") ?? "";
  const entite    = searchParams.get("entite") ?? "";
  const userId    = searchParams.get("userId") ?? "";
  const dateDebut = searchParams.get("dateDebut") ?? "";
  const dateFin   = searchParams.get("dateFin") ?? "";
  const etablissementId = searchParams.get("etablissementId") ?? "";

  const where: Record<string, unknown> = {};

  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (dateDebut || dateFin) {
    where.createdAt = {
      ...(dateDebut ? { gte: new Date(dateDebut) } : {}),
      ...(dateFin   ? { lte: new Date(dateFin + "T23:59:59") } : {}),
    };
  }

  // Filtrer par type d'entité
  if (entite === "depense")        where.depenseId        = { not: null };
  if (entite === "bon")            where.bonCommandeId    = { not: null };
  if (entite === "immobilisation") where.immobilisationId = { not: null };
  if (entite === "fournisseur")    where.fournisseurId    = { not: null };
  if (entite === "marche")         where.marcheId         = { not: null };
  if (entite === "contrat")        where.contratId        = { not: null };
  if (entite === "session")        where.AND = [
    { depenseId: null }, { bonCommandeId: null }, { immobilisationId: null },
    { fournisseurId: null }, { marcheId: null }, { contratId: null },
  ];

  // Scoper par établissement pour les rôles non-globaux
  if (session.role !== "SUPER_ADMIN" && session.role !== "MINISTERE") {
    // Pour DIRECTEUR/ADMIN : filtrer par les entités de leur établissement
    // On passe l'etablissementId dans le where via les relations
    const etabId = session.etablissementId;
    if (etabId) {
      where.user = { etablissementId: etabId };
    }
  } else if (etablissementId) {
    where.user = { etablissementId };
  }

  const [total, entries] = await Promise.all([
    prisma.historique.count({ where }),
    prisma.historique.findMany({
      where,
      include: {
        user: { select: { id: true, nom: true, prenom: true, role: true } },
        depense:        { select: { id: true, reference: true, intitule: true } },
        bonCommande:    { select: { id: true, reference: true, intitule: true } },
        immobilisation: { select: { id: true, reference: true, designation: true } },
        fournisseur:    { select: { id: true, nom: true } },
        marche:         { select: { id: true, reference: true, objet: true } },
        contrat:        { select: { id: true, reference: true, objet: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({ entries, total, page, pageSize: PAGE_SIZE });
}
