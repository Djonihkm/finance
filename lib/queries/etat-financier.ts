// ============================================================
// lib/queries/etatFinancier.ts
// Query Prisma pour produire l'état financier d'un établissement
// Source de vérité : table Ecriture (pas Depense directement)
// ============================================================

import { prisma } from "@/lib/prisma";

// ============================================================
// Types retournés
// ============================================================

export interface LigneCompte {
  compteId: number;
  numero:   string;
  nom:      string;
  total:    number;
}

export interface SectionClasse {
  classeNumero: string;
  classeNom:    string;
  total:        number;
  comptes:      LigneCompte[];
}

export interface EtatFinancier {
  annee:         number;
  totalCharges:  number; // Σ DEBIT  classe 6
  totalProduits: number; // Σ CREDIT classe 7
  resultat:      number; // totalProduits - totalCharges
  charges:       SectionClasse[]; // détail par compte classe 6
  produits:      SectionClasse[]; // détail par compte classe 7 (à venir)
}

// ============================================================
// Paramètres de la query
// ============================================================

interface GetEtatFinancierParams {
  etablissementId: string;
  annee:           number;
}

// ============================================================
// Fonction principale
// ============================================================

export async function getEtatFinancier({
  etablissementId,
  annee,
}: GetEtatFinancierParams): Promise<EtatFinancier> {

  // Bornes de la période — du 1er janvier au 31 décembre
  const debut = new Date(`${annee}-01-01T00:00:00.000Z`);
  const fin   = new Date(`${annee}-12-31T23:59:59.999Z`);

  // 1. Récupérer toutes les écritures de la période
  //    liées aux dépenses de cet établissement
  //    avec le détail du compte et de sa classe
  const ecritures = await prisma.ecriture.findMany({
    where: {
      date: { gte: debut, lte: fin },
      // Filtre par établissement via la dépense liée
      // Un directeur ne voit que les écritures de son établissement
      depense: {
        etablissementId,
        deletedAt: null,
      },
    },
    include: {
      compte: {
        include: {
          classe: true, // pour avoir classe.numero ("5","6","7")
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // 2. Agréger les montants par compte et par classe
  //    Structure intermédiaire :
  //    { classeNumero → { classeNom, comptes: { compteId → LigneCompte } } }
  const agregation: Record<string, {
    classeNom: string;
    comptes:   Record<number, LigneCompte>;
  }> = {};

  for (const ecriture of ecritures) {
    const classe  = ecriture.compte.classe;
    const compte  = ecriture.compte;
    const montant = Number(ecriture.montant);

    // On ne traite que les écritures pertinentes pour l'état financier :
    //   Classe 6 + DEBIT  → charges engagées
    //   Classe 7 + CREDIT → produits perçus
    const estCharge  = classe.numero === "6" && ecriture.sens === "DEBIT";
    const estProduit = classe.numero === "7" && ecriture.sens === "CREDIT";

    if (!estCharge && !estProduit) continue;

    // Initialiser la classe si elle n'existe pas encore
    if (!agregation[classe.numero]) {
      agregation[classe.numero] = {
        classeNom: classe.nom,
        comptes:   {},
      };
    }

    // Initialiser le compte si il n'existe pas encore
    if (!agregation[classe.numero].comptes[compte.id]) {
      agregation[classe.numero].comptes[compte.id] = {
        compteId: compte.id,
        numero:   compte.numero,
        nom:      compte.nom,
        total:    0,
      };
    }

    // Accumuler le montant sur ce compte
    agregation[classe.numero].comptes[compte.id].total += montant;
  }

  // 3. Construire les sections charges et produits
  //    triées par numéro de compte
  function construireSections(classeNumero: string): SectionClasse[] {
    const section = agregation[classeNumero];
    if (!section) return [];

    const comptes = Object.values(section.comptes).sort((a, b) =>
      a.numero.localeCompare(b.numero)
    );

    const total = comptes.reduce((sum, c) => sum + c.total, 0);

    return [{
      classeNumero,
      classeNom: section.classeNom,
      total,
      comptes,
    }];
  }

  const charges  = construireSections("6");
  const produits = construireSections("7");

  // 4. Calculer les totaux globaux
  const totalCharges  = charges.reduce((sum, s)  => sum + s.total, 0);
  const totalProduits = produits.reduce((sum, s) => sum + s.total, 0);

  // Résultat positif = excédent, négatif = déficit
  const resultat = totalProduits - totalCharges;

  return {
    annee,
    totalCharges,
    totalProduits,
    resultat,
    charges,
    produits,
  };
}