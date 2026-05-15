// ============================================================
// lib/comptabilite.ts
// Utilitaire de génération des écritures comptables
//
// Principe de la partie double :
//   DÉPENSE  → DÉBIT  classe 6 (charge)     + CRÉDIT classe 5 (trésorerie)
//   PRODUIT  → DÉBIT  classe 5 (trésorerie) + CRÉDIT classe 7 (produit)
//
// Règle fondamentale : Σ débits = Σ crédits
// ============================================================

import { Prisma, TypePaiement } from "@/lib/generated/prisma";

type PrismaTransaction = Prisma.TransactionClient;

// ============================================================
// Détermine le compte de trésorerie selon le mode de paiement
// Utilisé pour les dépenses uniquement
// ============================================================
function getNumeroCompteTresorerie(paiement: TypePaiement): string {
  switch (paiement) {
    case "ESPECES":
      return "5700"; // Caisse principale
    case "VIREMENT":
    case "VIREMENT_30J":
    case "VIREMENT_60J":
    case "CHEQUE":
    case "CARTE_BANCAIRE":
    case "ACOMPTE":
    default:
      return "5200"; // Banque principale
  }
}

// ============================================================
// FONCTION 1 — Écritures pour une dépense validée
//
// Exemple — Fournitures 50 000 FCFA payées en espèces :
//   DÉBIT  6100 Fournitures scolaires   50 000  ← charge augmente
//   CRÉDIT 5700 Caisse principale       50 000  ← caisse diminue
// ============================================================

interface GenererEcrituresDepenseParams {
  tx:             PrismaTransaction;
  depenseId:      string;
  compteChargeId: number;   // compte classe 6
  montant:        number;
  paiement:       TypePaiement;
  libelle:        string;
  date:           Date;
}

export async function genererEcrituresDepense({
  tx,
  depenseId,
  compteChargeId,
  montant,
  paiement,
  libelle,
  date,
}: GenererEcrituresDepenseParams): Promise<{ compteTresorerieId: number }> {

  // 1. Trouver le compte de trésorerie selon le mode de paiement
  const numeroTresorerie = getNumeroCompteTresorerie(paiement);

  const compteTresorerie = await tx.compte.findFirst({
    where: { numero: numeroTresorerie },
  });

  if (!compteTresorerie) {
    throw new Error(
      `Compte de trésorerie "${numeroTresorerie}" introuvable. ` +
      `Vérifiez que le seed a bien été exécuté.`
    );
  }

  // 2. Créer les deux écritures
  await tx.ecriture.createMany({
    data: [
      {
        // Écriture 1 : DÉBIT sur le compte de charge (classe 6)
        date,
        sens:     "DEBIT",
        montant,
        libelle:  `Charge — ${libelle}`,
        compteId: compteChargeId,
        depenseId,
      },
      {
        // Écriture 2 : CRÉDIT sur le compte de trésorerie (classe 5)
        date,
        sens:     "CREDIT",
        montant,
        libelle:  `Règlement — ${libelle}`,
        compteId: compteTresorerie.id,
        depenseId,
      },
    ],
  });

  // 3. Mettre à jour Depense.compteTresorerieId
  await tx.depense.update({
    where: { id: depenseId },
    data:  { compteTresorerieId: compteTresorerie.id },
  });

  return { compteTresorerieId: compteTresorerie.id };
}

// ============================================================
// FONCTION 2 — Écritures pour une entrée de produit
//
// C'est l'inverse d'une dépense — l'argent ENTRE dans l'établissement
//
// Exemple — Don reçu de 500 000 FCFA en banque :
//   DÉBIT  5200 Banque principale   500 000  ← banque augmente
//   CRÉDIT 7200 Dons en espèces     500 000  ← produit constaté
//
// Exemple — Subvention État de 2 000 000 FCFA par virement :
//   DÉBIT  5200 Banque principale   2 000 000  ← banque augmente
//   CRÉDIT 7100 Subvention État     2 000 000  ← produit constaté
// ============================================================

interface GenererEcrituresEntreeProduitParams {
  tx:                PrismaTransaction;
  entreeProduitId:   string;
  compteId:          number;   // compte classe 7 (le produit)
  compteTresorerieId: number;  // compte classe 5 (où l'argent arrive)
  montant:           number;
  libelle:           string;
  date:              Date;
}

export async function genererEcrituresEntreeProduit({
  tx,
  entreeProduitId,
  compteId,
  compteTresorerieId,
  montant,
  libelle,
  date,
}: GenererEcrituresEntreeProduitParams): Promise<void> {

  // Vérifier que le compte de produit existe (classe 7)
  const compteProduit = await tx.compte.findFirst({
    where: {
      id:     compteId,
      classe: { numero: "7" },
    },
  });

  if (!compteProduit) {
    throw new Error(
      `Compte de produit introuvable ou n'appartient pas à la classe 7.`
    );
  }

  // Vérifier que le compte de trésorerie existe (classe 5)
  const compteTresorerie = await tx.compte.findFirst({
    where: {
      id:     compteTresorerieId,
      classe: { numero: "5" },
    },
  });

  if (!compteTresorerie) {
    throw new Error(
      `Compte de trésorerie introuvable ou n'appartient pas à la classe 5.`
    );
  }

  // Créer les deux écritures
  await tx.ecriture.createMany({
    data: [
      {
        // Écriture 1 : DÉBIT sur le compte de trésorerie (classe 5)
        // L'argent entre dans la caisse ou la banque
        date,
        sens:            "DEBIT",
        montant,
        libelle:         `Entrée — ${libelle}`,
        compteId:        compteTresorerieId,
        entreeProduitId,
      },
      {
        // Écriture 2 : CRÉDIT sur le compte de produit (classe 7)
        // Le produit est constaté
        date,
        sens:            "CREDIT",
        montant,
        libelle:         `Produit — ${libelle}`,
        compteId:        compteId,
        entreeProduitId,
      },
    ],
  });
}