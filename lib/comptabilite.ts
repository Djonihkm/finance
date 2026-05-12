// ============================================================
// lib/comptabilite.ts
// Utilitaire de génération des écritures comptables
// Principe de la partie double :
//   DÉBIT  → compte de charge (classe 6) — la dépense augmente
//   CRÉDIT → compte de trésorerie (classe 5) — l'argent sort
// Règle fondamentale : Σ débits = Σ crédits
// ============================================================

import { Prisma, TypePaiement } from "@/lib/generated/prisma";

// Type minimal de la transaction Prisma
// On l'utilise pour que la fonction soit appelable
// à l'intérieur d'une prisma.$transaction existante
type PrismaTransaction = Prisma.TransactionClient;

// ============================================================
// Détermine le numéro du compte de trésorerie
// selon le mode de paiement de la dépense
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
// Paramètres attendus par la fonction principale
// ============================================================
interface GenererEcrituresDepenseParams {
    tx: PrismaTransaction;
    depenseId: string;
    compteChargeId: number;       // compteId déjà lié à la dépense (classe 6)
    montant: number;              // montant de la dépense
    paiement: TypePaiement;       // mode de paiement → détermine le compte classe 5
    libelle: string;              // intitulé de la dépense → libellé des écritures
    date: Date;                   // date comptable (date de validation)
}

// ============================================================
// Fonction principale
// À appeler dans prisma.$transaction lors du passage à VALIDE
// Retourne l'id du compte de trésorerie utilisé
// pour mettre à jour Depense.compteTresorerieId
// ============================================================
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

    // 2. Créer les deux écritures en une seule requête
    //
    //  Exemple — Dépense "Fournitures" 50 000 FCFA payée en espèces :
    //    DÉBIT  6100 Fournitures scolaires   50 000  ← charge augmente
    //    CRÉDIT 5700 Caisse principale       50 000  ← caisse diminue
    //
    await tx.ecriture.createMany({
        data: [
            {
                // Écriture 1 : DÉBIT sur le compte de charge (classe 6)
                date,
                sens: "DEBIT",
                montant,
                libelle: `Charge — ${libelle}`,
                compteId: compteChargeId,
                depenseId,
            },
            {
                // Écriture 2 : CRÉDIT sur le compte de trésorerie (classe 5)
                date,
                sens: "CREDIT",
                montant,
                libelle: `Règlement — ${libelle}`,
                compteId: compteTresorerie.id,
                depenseId,
            },
        ],
    });

    // 3. Mettre à jour Depense.compteTresorerieId
    //    pour garder la trace du compte utilisé
    await tx.depense.update({
        where: { id: depenseId },
        data: { compteTresorerieId: compteTresorerie.id },
    });

    return { compteTresorerieId: compteTresorerie.id };
}