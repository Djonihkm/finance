// ============================================================
// lib/queries/etatFinancier.ts
// Query Prisma pour produire l'état financier d'un établissement
// Source de vérité :
//   - Table Ecriture      → sorties (dépenses validées)
//   - Table EntreeTresorerie → entrées (subventions, frais scolarité...)
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

export interface LigneEntree {
  id:       string;
  date:     Date;
  libelle:  string;
  montant:  number;
  compte: {
    id:     number;
    numero: string;
    nom:    string;
  };
}

export interface SectionTresorerie {
  compteId: number;
  numero:   string;
  nom:      string;
  entrees:  LigneEntree[];  // toutes les entrées sur ce compte
  totalEntrees:  number;    // Σ entrées sur ce compte
  totalSorties:  number;    // Σ écritures CRÉDIT sur ce compte
  solde:         number;    // totalEntrees - totalSorties
}

export interface EtatFinancier {
  annee:          number;
  totalCharges:   number;       // Σ DÉBIT  classe 6
  totalProduits:  number;       // Σ CRÉDIT classe 7
  resultat:       number;       // totalProduits - totalCharges
  charges:        SectionClasse[];    // détail par compte classe 6
  produits:       SectionClasse[];    // détail par compte classe 7
  tresorerie:     SectionTresorerie[]; // détail par compte classe 5
  totalEntrees:   number;       // Σ toutes les entrées de trésorerie
  totalSorties:   number;       // Σ toutes les sorties de trésorerie
  soldeTresorerie: number;      // totalEntrees - totalSorties
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

  const debut = new Date(`${annee}-01-01T00:00:00.000Z`);
  const fin   = new Date(`${annee}-12-31T23:59:59.999Z`);

  // ============================================================
  // 1. Récupérer toutes les écritures de la période
  //    Deux sources :
  //    - Écritures liées aux dépenses     (charges + sorties trésorerie)
  //    - Écritures liées aux EntreeProduit (produits + entrées trésorerie)
  // ============================================================
  const ecritures = await prisma.ecriture.findMany({
    where: {
      date: { gte: debut, lte: fin },
      // OR : soit liée à une dépense, soit à une entrée de produit
      OR: [
        {
          depense: {
            etablissementId,
            deletedAt: null,
          },
        },
        {
          entreeProduit: {
            etablissementId,
            deletedAt: null,
          },
        },
      ],
    },
    include: {
      compte: {
        include: {
          classe: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // ============================================================
  // 2. Récupérer toutes les entrées de trésorerie manuelles
  //    (saisies dans la section trésorerie de l'état financier)
  // ============================================================
  const entrees = await prisma.entreeTresorerie.findMany({
    where: {
      etablissementId,
      annee,
    },
    include: {
      compte: {
        select: { id: true, numero: true, nom: true },
      },
    },
    orderBy: { date: "asc" },
  });

  // ============================================================
  // 3. Agréger les écritures par compte et par classe
  // ============================================================
  const agregation: Record<string, {
    classeNom: string;
    comptes:   Record<number, LigneCompte>;
  }> = {};

  // Sorties de trésorerie (CRÉDIT classe 5) — dépenses payées
  // Entrées de trésorerie via écritures (DÉBIT classe 5) — produits reçus
  const sortiesParCompte: Record<number, number> = {};
  const entreesEcrituresParCompte: Record<number, number> = {};

  for (const ecriture of ecritures) {
    const classe  = ecriture.compte.classe;
    const compte  = ecriture.compte;
    const montant = Number(ecriture.montant);

    // Charges (classe 6, DÉBIT) — dépenses engagées
    const estCharge = classe.numero === "6" && ecriture.sens === "DEBIT";

    // Produits (classe 7, CRÉDIT) — recettes constatées
    const estProduit = classe.numero === "7" && ecriture.sens === "CREDIT";

    // Sorties trésorerie (classe 5, CRÉDIT) — argent qui sort (dépenses)
    const estSortie = classe.numero === "5" && ecriture.sens === "CREDIT";

    // Entrées trésorerie via écritures (classe 5, DÉBIT) — argent qui entre (produits)
    // Générées par genererEcrituresEntreeProduit
    const estEntreeEcriture = classe.numero === "5" && ecriture.sens === "DEBIT";

    if (estSortie) {
      sortiesParCompte[compte.id] = (sortiesParCompte[compte.id] ?? 0) + montant;
      continue;
    }

    if (estEntreeEcriture) {
      // On accumule les entrées via écritures séparément
      // pour les combiner avec EntreeTresorerie dans la section trésorerie
      entreesEcrituresParCompte[compte.id] =
        (entreesEcrituresParCompte[compte.id] ?? 0) + montant;
      continue;
    }

    if (!estCharge && !estProduit) continue;

    if (!agregation[classe.numero]) {
      agregation[classe.numero] = {
        classeNom: classe.nom,
        comptes:   {},
      };
    }

    if (!agregation[classe.numero].comptes[compte.id]) {
      agregation[classe.numero].comptes[compte.id] = {
        compteId: compte.id,
        numero:   compte.numero,
        nom:      compte.nom,
        total:    0,
      };
    }

    agregation[classe.numero].comptes[compte.id].total += montant;
  }

  // ============================================================
  // 4. Construire les sections charges et produits
  // ============================================================
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

  // ============================================================
  // 5. Construire la section trésorerie
  //    Combine :
  //    - EntreeTresorerie (saisies manuelles)
  //    - Écritures DÉBIT classe 5 (générées par EntreeProduit)
  //    - Écritures CRÉDIT classe 5 (générées par Depense)
  // ============================================================
  const entreesParCompte: Record<number, {
    numero:  string;
    nom:     string;
    entrees: LigneEntree[];
  }> = {};

  for (const entree of entrees) {
    const compteId = entree.compte.id;

    if (!entreesParCompte[compteId]) {
      entreesParCompte[compteId] = {
        numero:  entree.compte.numero,
        nom:     entree.compte.nom,
        entrees: [],
      };
    }

    entreesParCompte[compteId].entrees.push({
      id:      entree.id,
      date:    entree.date,
      libelle: entree.libelle,
      montant: Number(entree.montant),
      compte:  entree.compte,
    });
  }

  const tresorerie: SectionTresorerie[] = Object.entries(entreesParCompte)
    .map(([compteIdStr, data]) => {
      const compteId     = parseInt(compteIdStr);
      const totalEntrees = data.entrees.reduce((sum, e) => sum + e.montant, 0);

      // Sorties = écritures CRÉDIT classe 5 (dépenses payées)
      const totalSorties = sortiesParCompte[compteId] ?? 0;

      // Entrées via écritures = DÉBIT classe 5 (produits reçus)
      // Ces entrées viennent des EntreeProduit, pas de EntreeTresorerie
      // On les ajoute aux entrées manuelles pour le solde
      const entreesViaEcritures = entreesEcrituresParCompte[compteId] ?? 0;

      return {
        compteId,
        numero:       data.numero,
        nom:          data.nom,
        entrees:      data.entrees,
        totalEntrees: totalEntrees + entreesViaEcritures,
        totalSorties,
        solde:        totalEntrees + entreesViaEcritures - totalSorties,
      };
    })
    .sort((a, b) => a.numero.localeCompare(b.numero));

  // ============================================================
  // 6. Calculer les totaux globaux
  // ============================================================
  const totalCharges    = charges.reduce((sum, s)  => sum + s.total, 0);
  const totalProduits   = produits.reduce((sum, s) => sum + s.total, 0);
  const totalEntrees    = tresorerie.reduce((sum, t) => sum + t.totalEntrees, 0);
  const totalSorties    = tresorerie.reduce((sum, t) => sum + t.totalSorties, 0);
  const resultat        = totalProduits - totalCharges;
  const soldeTresorerie = totalEntrees - totalSorties;

  return {
    annee,
    totalCharges,
    totalProduits,
    resultat,
    charges,
    produits,
    tresorerie,
    totalEntrees,
    totalSorties,
    soldeTresorerie,
  };
}