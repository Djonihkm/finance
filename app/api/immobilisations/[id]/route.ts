import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

const CAN_EDIT   = ["SUPER_ADMIN", "MINISTERE", "ADMIN", "COMPTABLE"];
const CAN_DEMANDE = ["ADMIN", "COMPTABLE"];
const CAN_VALIDER = ["DIRECTEUR", "SUPER_ADMIN", "MINISTERE"];

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const immo = await prisma.immobilisation.findUnique({
    where: { id, deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      fournisseur: { select: { id: true, nom: true, telephone: true, email: true } },
      bonCommande: { select: { id: true, reference: true, montantTotal: true, statut: true } },
      sortiPar: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
    },
  });

  if (!immo) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(immo);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  // ── Demande de sortie (ADMIN/COMPTABLE) ──────────────────────────────────────
  if (action === "demander_sortie") {
    if (!CAN_DEMANDE.includes(session.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const immo = await prisma.immobilisation.update({
      where: { id, statut: "ACTIF" },
      data: {
        statut:      "EN_ATTENTE_SORTIE",
        motifSortie: body.motifSortie || null,
        demandeParId: session.userId,
        demandeAt:   new Date(),
      },
    });
    return NextResponse.json(immo);
  }

  // ── Validation de la sortie (DIRECTEUR/SUPER_ADMIN/MINISTERE) ────────────────
  if (action === "valider_sortie") {
    if (!CAN_VALIDER.includes(session.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const immo = await prisma.immobilisation.update({
      where: { id, statut: "EN_ATTENTE_SORTIE" },
      data: {
        statut:    body.typeSortie === "CEDE" ? "CEDE" : "SORTI",
        sortiParId: session.userId,
        sortiAt:   new Date(),
      },
    });
    return NextResponse.json(immo);
  }

  // ── Rejet de la demande de sortie (DIRECTEUR/SUPER_ADMIN/MINISTERE) ──────────
  if (action === "rejeter_sortie") {
    if (!CAN_VALIDER.includes(session.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const immo = await prisma.immobilisation.update({
      where: { id, statut: "EN_ATTENTE_SORTIE" },
      data: {
        statut:      "ACTIF",
        motifSortie:  null,
        demandeParId: null,
        demandeAt:    null,
      },
    });
    return NextResponse.json(immo);
  }

  // ── Mise à jour simple des champs (état, localisation…) ─────────────────────
  if (!CAN_EDIT.includes(session.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const immo = await prisma.immobilisation.update({
    where: { id, statut: "ACTIF" },
    data: {
      designation:      body.designation,
      description:      body.description ?? null,
      etat:             body.etat,
      localisation:     body.localisation ?? null,
      numSerie:         body.numSerie ?? null,
      valeurAcquisition: body.valeurAcquisition,
      dateAcquisition:  body.dateAcquisition ? new Date(body.dateAcquisition) : undefined,
      fournisseurId:    body.fournisseurId ?? null,
      bonCommandeId:    body.bonCommandeId ?? null,
    },
  });
  return NextResponse.json(immo);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await prisma.immobilisation.update({
    where: { id, statut: "ACTIF", createdById: session.userId },
    data: { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}
