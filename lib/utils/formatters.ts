/**
 * lib/utils/formatters.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Fonctions de formatage pour afficher les valeurs Prisma (enums, Decimal,
 * dates) de façon lisible dans l'UI.
 *
 * Importé dans les Client Components (pas de "use server" ici).
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Établissements ────────────────────────────────────────────────────────────

export const TYPE_ETABLISSEMENT_LABELS: Record<string, string> = {
  LYCEE: "Lycée",
  COLLEGE: "Collège",
  CEG: "CEG",
  ECOLE_PRIMAIRE: "École Primaire",
  AUTRE: "Autre",
};

export function formatTypeEtablissement(type: string): string {
  return TYPE_ETABLISSEMENT_LABELS[type] ?? type;
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  MINISTERE: "Ministère",
  ADMIN: "Administrateur",
  COMPTABLE: "Comptable",
  DIRECTEUR: "Directeur",
};

export function formatRole(role: string): string {
  return ROLE_LABELS[role] ?? role;
}

// ── Documents ─────────────────────────────────────────────────────────────────

export const STATUT_LABELS: Record<string, string> = {
  ATTENTE:  "En attente",
  REVISION: "En révision",
  VALIDE:   "Validé",
  REJETE:   "Rejeté",
};

export const STATUT_COLORS: Record<string, string> = {
  ATTENTE:  "bg-gray-100 text-gray-600",
  REVISION: "bg-amber-100 text-amber-700",
  VALIDE:   "bg-emerald-100 text-emerald-700",
  REJETE:   "bg-red-100 text-red-600",
};

export function formatStatut(statut: string): string {
  return STATUT_LABELS[statut] ?? statut;
}

export const CATEGORIE_LABELS: Record<string, string> = {
  FOURNITURE: "Fourniture",
  MOBILIER: "Mobilier",
  PERSONNEL: "Personnel",
  PEDAGOGIE: "Pédagogie",
  EQUIPEMENT: "Équipement",
  TRAVAUX: "Travaux",
  AUTRE: "Autre",
};

export function formatCategorie(cat: string): string {
  return CATEGORIE_LABELS[cat] ?? cat;
}

export const PAIEMENT_LABELS: Record<string, string> = {
  ESPECES: "Espèces",
  VIREMENT: "Virement",
  VIREMENT_30J: "Virement 30j",
  VIREMENT_60J: "Virement 60j",
  CHEQUE: "Chèque",
  CARTE_BANCAIRE: "Carte bancaire",
  ACOMPTE: "Acompte",
};

export function formatPaiement(paiement: string): string {
  return PAIEMENT_LABELS[paiement] ?? paiement;
}

// ── Montants ──────────────────────────────────────────────────────────────────

/** Formate un montant Decimal (stocké en FCFA) en chaîne lisible. */
export function formatMontant(montant: number | string | { toString(): string }): string {
  const num = typeof montant === "number" ? montant : parseFloat(montant.toString());
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + " FCFA";
}

// ── Dates ─────────────────────────────────────────────────────────────────────

/** Formate une Date JS en "12 Oct 2024" (format FR court). */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}
