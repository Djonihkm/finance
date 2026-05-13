// ============================================================
// lib/queries/grandLivre.ts
// Query Prisma pour produire le grand livre d'un établissement
// Le grand livre liste toutes les écritures groupées par compte
// Source de vérité : table Ecriture
// ============================================================

import { prisma } from "@/lib/prisma";

// ============================================================
// Types retournés
// ============================================================

export interface LigneEcriture {
  id:      string;
  date:    Date;
  libelle: string | null;
  debit:   number; // montant si sens = DEBIT, sinon 0
  credit:  number; // montant si sens = CREDIT, sinon 0
  // Référence du document source
  reference: string | null; // référence de la dépense ou du bon
}

export interface SectionCompte {
  compteId:    number;
  numero:      string;
  nom:         string;
  classeNom:   string;
  lignes:      LigneEcriture[];
  totalDebit:  number; // Σ débits sur ce compte
  totalCredit: number; // Σ crédits sur ce compte
  solde:       number; // totalDebit - totalCredit
}

export interface GrandLivre {
  annee:            number;
  sections:         SectionCompte[]; // une section par compte mouvementé
  grandTotalDebit:  number;          // Σ tous les débits
  grandTotalCredit: number;          // Σ tous les crédits
  // Vérification partie double : grandTotalDebit === grandTotalCredit
  estEquilibre:     boolean;
}

// ============================================================
// Paramètres de la query
// ============================================================

interface GetGrandLivreParams {
  etablissementId: string;
  annee:           number;
  // Filtre optionnel par numéro de compte
  // Ex: "6100" pour voir uniquement les fournitures scolaires
  compteNumero?:   string;
}

// ============================================================
// Fonction principale
// ============================================================

export async function getGrandLivre({
  etablissementId,
  annee,
  compteNumero,
}: GetGrandLivreParams): Promise<GrandLivre> {

  // Bornes de la période
  const debut = new Date(`${annee}-01-01T00:00:00.000Z`);
  const fin   = new Date(`${annee}-12-31T23:59:59.999Z`);

  // ============================================================
  // 1. Récupérer toutes les écritures de la période
  //    liées aux dépenses de cet établissement
  // ============================================================
  const ecritures = await prisma.ecriture.findMany({
    where: {
      date: { gte: debut, lte: fin },
      depense: {
        etablissementId,
        deletedAt: null,
      },
      // Filtre optionnel par compte
      ...(compteNumero && {
        compte: { numero: compteNumero },
      }),
    },
    include: {
      compte: {
        include: {
          classe: true,
        },
      },
      // Inclure la dépense pour récupérer la référence
      depense: {
        select: { reference: true },
      },
    },
    orderBy: [
      { compte: { numero: "asc" } }, // grouper par compte
      { date: "asc" },               // puis trier par date
    ],
  });

  // ============================================================
  // 2. Grouper les écritures par compte
  //    { compteId → SectionCompte }
  // ============================================================
  const sections: Record<number, SectionCompte> = {};

  for (const ecriture of ecritures) {
    const compte  = ecriture.compte;
    const montant = Number(ecriture.montant);

    // Initialiser la section du compte si elle n'existe pas encore
    if (!sections[compte.id]) {
      sections[compte.id] = {
        compteId:    compte.id,
        numero:      compte.numero,
        nom:         compte.nom,
        classeNom:   compte.classe.nom,
        lignes:      [],
        totalDebit:  0,
        totalCredit: 0,
        solde:       0,
      };
    }

    // Débit ou Crédit selon le sens de l'écriture
    const debit  = ecriture.sens === "DEBIT"  ? montant : 0;
    const credit = ecriture.sens === "CREDIT" ? montant : 0;

    // Ajouter la ligne à la section
    sections[compte.id].lignes.push({
      id:        ecriture.id,
      date:      ecriture.date,
      libelle:   ecriture.libelle,
      debit,
      credit,
      reference: ecriture.depense?.reference ?? null,
    });

    // Accumuler les totaux
    sections[compte.id].totalDebit  += debit;
    sections[compte.id].totalCredit += credit;
  }

  // ============================================================
  // 3. Calculer le solde de chaque compte
  //    et trier les sections par numéro de compte
  // ============================================================
  const sectionsTriees = Object.values(sections)
    .map((section) => ({
      ...section,
      // Solde = Débit - Crédit
      // Positif = solde débiteur (compte de charge)
      // Négatif = solde créditeur (compte de trésorerie)
      solde: section.totalDebit - section.totalCredit,
    }))
    .sort((a, b) => a.numero.localeCompare(b.numero));

  // ============================================================
  // 4. Calculer les grands totaux
  // ============================================================
  const grandTotalDebit  = sectionsTriees.reduce((sum, s) => sum + s.totalDebit,  0);
  const grandTotalCredit = sectionsTriees.reduce((sum, s) => sum + s.totalCredit, 0);

  // Vérification de l'équilibre comptable
  // En partie double : Σ débits = Σ crédits toujours
  const estEquilibre = Math.abs(grandTotalDebit - grandTotalCredit) < 0.01;

  return {
    annee,
    sections:         sectionsTriees,
    grandTotalDebit,
    grandTotalCredit,
    estEquilibre,
  };
}