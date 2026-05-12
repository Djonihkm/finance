import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { genererEcrituresDepense } from "@/lib/comptabilite";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const depense = await prisma.depense.findUnique({
    where: { id, deletedAt: null },
    include: {
      createdBy:    { select: { id: true, nom: true, prenom: true } },
      signePar:     { select: { id: true, nom: true, prenom: true } },
      validePar:    { select: { id: true, nom: true, prenom: true } },
      etablissement:{ select: { id: true, nom: true } },
      // Compte de charge (classe 6)
      compte:       { select: { id: true, numero: true, nom: true } },
      // Compte de trésorerie (classe 5) — rempli après validation
      compteTresorerie: { select: { id: true, numero: true, nom: true } },
      historiques: {
        include: { user: { select: { nom: true, prenom: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!depense) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(depense);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { action } = body;

  // ============================================================
  // ACTION : VALIDER
  // Déclenche la génération des écritures comptables (partie double)
  // ============================================================
  if (action === "valider") {
    if (session.role !== "DIRECTEUR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    try {
      const depense = await prisma.$transaction(async (tx) => {

        // 1. Récupérer la dépense avec son compte de charge
        const existing = await tx.depense.findUnique({
          where: { id },
          include: {
            compte: true, // compte de charge (classe 6)
          },
        });

        if (!existing) throw new Error("Dépense introuvable");

        // 2. Mettre à jour le statut → VALIDE
        const d = await tx.depense.update({
          where: { id },
          data: {
            statut:     "VALIDE",
            valideParId: session.userId,
            valideAt:   new Date(),
          },
        });

        // 3. Mettre à jour le budget de l'établissement
        const year = new Date(existing.date).getFullYear();
        await tx.budget.updateMany({
          where: {
            etablissementId: existing.etablissementId,
            annee: year,
          },
          data: {
            montantConsomme: { increment: existing.montant },
          },
        });

        // 4. Générer les écritures comptables (partie double)
        //    uniquement si un compte de charge est lié à la dépense
        if (existing.compteId) {
          await genererEcrituresDepense({
            tx:             tx,
            depenseId:      id,
            compteChargeId: existing.compteId,
            montant:        Number(existing.montant),
            paiement:       existing.paiement,
            libelle:        existing.intitule,
            date:           new Date(),
          });
        }
        // Si pas de compteId, on valide quand même sans écriture
        // Le comptable pourra lier un compte plus tard

        // 5. Enregistrer dans l'historique
        await tx.historique.create({
          data: {
            action:    "VALIDE",
            userId:    session.userId,
            depenseId: id,
          },
        });

        return d;
      });

      return NextResponse.json(depense);

    } catch (error) {
      console.error("Erreur validation dépense:", error);
      return NextResponse.json(
        { error: "Erreur lors de la validation" },
        { status: 500 }
      );
    }
  }

  // ============================================================
  // ACTION : REJETER
  // ============================================================
  if (action === "rejeter") {
    if (session.role !== "DIRECTEUR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const d = await tx.depense.update({
        where: { id },
        data: {
          statut:     "REJETE",
          valideParId: session.userId,
          valideAt:   new Date(),
          commentaire: body.commentaire,
        },
      });
      await tx.historique.create({
        data: {
          action:     "REJETE",
          userId:     session.userId,
          depenseId:  id,
          commentaire: body.commentaire,
        },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  // ============================================================
  // ACTION : RESOUMETTRE
  // ============================================================
  if (action === "resoumettre") {
    if (session.role !== "COMPTABLE" && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const d = await tx.depense.update({
        where: { id, statut: "REVISION" },
        data: { statut: "ATTENTE", commentaire: null },
      });
      await tx.historique.create({
        data: {
          action:    "SOUMIS",
          userId:    session.userId,
          depenseId: id,
        },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  // ============================================================
  // ACTION : RENVOYER POUR RÉVISION
  // ============================================================
  if (action === "renvoyer") {
    if (session.role !== "DIRECTEUR") {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }
    const depense = await prisma.$transaction(async (tx) => {
      const d = await tx.depense.update({
        where: { id },
        data: {
          statut:     "REVISION",
          commentaire: body.commentaire,
        },
      });
      await tx.historique.create({
        data: {
          action:     "MODIFIE",
          userId:     session.userId,
          depenseId:  id,
          commentaire: body.commentaire,
        },
      });
      return d;
    });
    return NextResponse.json(depense);
  }

  // ============================================================
  // MISE À JOUR SIMPLE (dépense en ATTENTE ou REVISION)
  // ============================================================
  const depense = await prisma.depense.update({
    where: { id, statut: { in: ["ATTENTE", "REVISION"] } },
    data: {
      intitule:    body.intitule,
      montant:     body.montant,
      categorie:   body.categorie,
      paiement:    body.paiement,
      fournisseur: body.fournisseur,
      description: body.description,
      date:        body.date ? new Date(body.date) : undefined,
    },
  });
  return NextResponse.json(depense);
}

// ============================================================
// DELETE — Suppression logique (soft delete)
// ============================================================
export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  await prisma.depense.update({
    where: { id, statut: "ATTENTE", createdById: session.userId },
    data:  { deletedAt: new Date() },
  });

  return new NextResponse(null, { status: 204 });
}