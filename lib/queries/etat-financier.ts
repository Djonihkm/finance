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

  // Bornes de la période — du 1er janvier au 31 décembre
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
  // 2. Récupérer toutes les entrées de trésorerie de la période
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
  //
  //  Structure intermédiaire :
  //  {
  //    "6": { classeNom: "Charges", comptes: { 6: { total: 500000 } } }
  //    "5": { classeNom: "Trésorerie", comptes: { 92: { total: 500000 } } }
  //  }
  // ============================================================
  const agregation: Record<string, {
    classeNom: string;
    comptes:   Record<number, LigneCompte>;
  }> = {};

  // Structure pour les sorties de trésorerie (écritures CRÉDIT classe 5)
  // { compteId → montant total sorti }
  const sortiesParCompte: Record<number, number> = {};

  for (const ecriture of ecritures) {
    const classe  = ecriture.compte.classe;
    const compte  = ecriture.compte;
    const montant = Number(ecriture.montant);

    // ── Charges (classe 6, DÉBIT) ─────────────────────────
    const estCharge  = classe.numero === "6" && ecriture.sens === "DEBIT";
    // ── Produits (classe 7, CRÉDIT) ───────────────────────
    const estProduit = classe.numero === "7" && ecriture.sens === "CREDIT";
    // ── Sorties trésorerie (classe 5, CRÉDIT) ─────────────
    // Ce sont les paiements effectués depuis la caisse ou la banque
    const estSortie  = classe.numero === "5" && ecriture.sens === "CREDIT";

    if (estSortie) {
      // Accumuler les sorties par compte de trésorerie
      sortiesParCompte[compte.id] = (sortiesParCompte[compte.id] ?? 0) + montant;
      continue;
    }

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

  // ============================================================
  // 4. Construire les sections charges et produits
  //    triées par numéro de compte
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
  //    Regrouper les entrées par compte (5200 Banque, 5700 Caisse)
  //    et calculer le solde = entrées - sorties
  // ============================================================
  const entreesParCompte: Record<number, {
    numero:  string;
    nom:     string;
    entrees: LigneEntree[];
  }> = {};

  for (const entree of entrees) {
    const compteId = entree.compte.id;

    // Initialiser le compte s'il n'existe pas encore
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

  // Construire le tableau final de trésorerie
  const tresorerie: SectionTresorerie[] = Object.entries(entreesParCompte)
    .map(([compteIdStr, data]) => {
      const compteId     = parseInt(compteIdStr);
      const totalEntrees = data.entrees.reduce((sum, e) => sum + e.montant, 0);
      const totalSorties = sortiesParCompte[compteId] ?? 0;

      return {
        compteId,
        numero:       data.numero,
        nom:          data.nom,
        entrees:      data.entrees,
        totalEntrees,
        totalSorties,
        // Solde = ce qui est entré - ce qui est sorti
        solde: totalEntrees - totalSorties,
      };
    })
    .sort((a, b) => a.numero.localeCompare(b.numero));

  // ============================================================
  // 6. Calculer les totaux globaux
  // ============================================================
  const totalCharges   = charges.reduce((sum, s)  => sum + s.total, 0);
  const totalProduits  = produits.reduce((sum, s) => sum + s.total, 0);
  const totalEntrees   = tresorerie.reduce((sum, t) => sum + t.totalEntrees, 0);
  const totalSorties   = tresorerie.reduce((sum, t) => sum + t.totalSorties, 0);

  // Résultat comptable : produits - charges
  const resultat = totalProduits - totalCharges;

  // Solde de trésorerie : entrées - sorties
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