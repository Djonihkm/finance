/**
 * lib/queries/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Couche d'accès aux données — toutes les fonctions qui interrogent Prisma/Neon.
 * Ces fonctions sont SERVEUR uniquement (appelées depuis des Server Components
 * ou des Server Actions). Elles ne peuvent jamais être importées dans un
 * "use client" component.
 *
 * Flux : page.tsx (Server Component) → queries/index.ts → Prisma → Neon DB
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

// ── Types exportés ────────────────────────────────────────────────────────────
// Prisma génère des types précis à partir des `include`. Ces alias rendent
// les props des Client Components lisibles.

export type EtablissementRow = Prisma.EtablissementGetPayload<{
  include: {
    budgets: { orderBy: { annee: "desc" }; take: 1 };
    _count: { select: { users: true; depenses: true } };
  };
}>;

export type EtablissementDetail = Prisma.EtablissementGetPayload<{
  include: {
    users: { where: { deletedAt: null } };
    budgets: { orderBy: { annee: "desc" } };
    depenses: { where: { deletedAt: null }; orderBy: { createdAt: "desc" }; take: 10 };
    bons: { where: { deletedAt: null }; orderBy: { createdAt: "desc" }; take: 10 };
  };
}>;

export type UserRow = Prisma.UserGetPayload<{
  select: {
    id: true; nom: true; prenom: true; email: true; role: true;
    poste: true; isActive: true; createdAt: true;
    etablissement: { select: { id: true; nom: true } };
  };
}>;

export type UserDetail = Prisma.UserGetPayload<{
  select: {
    id: true; nom: true; prenom: true; email: true; role: true;
    telephone: true; poste: true; avatarUrl: true; isActive: true; createdAt: true;
    etablissement: { select: { id: true; nom: true; code: true } };
  };
}>;

export type DepenseRow = Prisma.DepenseGetPayload<{
  include: {
    createdBy: { select: { nom: true; prenom: true } };
    etablissement: { select: { id: true; nom: true } };
  };
}>;

export type BonRow = Prisma.BonCommandeGetPayload<{
  include: {
    lignes: true;
    createdBy: { select: { nom: true; prenom: true } };
    etablissement: { select: { id: true; nom: true; adresse: true; ville: true; region: true } };
  };
}>;

export type BudgetRow = Prisma.BudgetGetPayload<{
  include: { etablissement: { select: { id: true; nom: true; code: true } } };
}>;

// ── Établissements ────────────────────────────────────────────────────────────

/** Liste tous les établissements actifs (admin / ministère). */
export async function getEtablissements(): Promise<EtablissementRow[]> {
  return prisma.etablissement.findMany({
    where: { deletedAt: null },
    include: {
      budgets: { orderBy: { annee: "desc" }, take: 1 },
      _count: { select: { users: true, depenses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  
}

/** Détail complet d'un établissement avec ses utilisateurs, budgets et docs. */
export async function getEtablissementById(id: string): Promise<EtablissementDetail | null> {
  return prisma.etablissement.findUnique({
    where: { id, deletedAt: null },
    include: {
      users: { where: { deletedAt: null }, orderBy: { role: "asc" } },
      budgets: { orderBy: { annee: "desc" } },
      depenses: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 },
      bons: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

// ── Utilisateurs ──────────────────────────────────────────────────────────────

/**
 * Liste les utilisateurs.
 * - Si `etablissementId` est fourni : filtre pour cet établissement.
 * - Sinon : retourne tous les utilisateurs (accès admin/ministère).
 */
export async function getUsers(opts?: { etablissementId?: string }): Promise<UserRow[]> {
  return prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(opts?.etablissementId ? { etablissementId: opts.etablissementId } : {}),
    },
    select: {
      id: true, nom: true, prenom: true, email: true, role: true,
      poste: true, isActive: true, createdAt: true,
      etablissement: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Détail d'un utilisateur par son ID. */
export async function getUserById(id: string): Promise<UserDetail | null> {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true, nom: true, prenom: true, email: true, role: true,
      telephone: true, poste: true, avatarUrl: true, isActive: true, createdAt: true,
      etablissement: { select: { id: true, nom: true, code: true } },
    },
  });
}

// ── Dépenses ──────────────────────────────────────────────────────────────────

/**
 * Dépenses d'un établissement (vue établissement).
 * Passe `etablissementId` de la session pour scoper les données.
 */
export async function getDepenses(etablissementId: string): Promise<DepenseRow[]> {
  return prisma.depense.findMany({
    where: { etablissementId, deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Toutes les dépenses de tous les établissements (vue admin / ministère).
 */
export async function getAllDepenses(): Promise<DepenseRow[]> {
  return prisma.depense.findMany({
    where: { deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Trouve une dépense par sa référence (ex: DEP-2024-0001). */
export async function getDepenseByReference(reference: string): Promise<DepenseRow | null> {
  return prisma.depense.findUnique({
    where: { reference, deletedAt: null },
    include: {
      createdBy: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true } },
    },
  });
}

// ── Bons de commande ──────────────────────────────────────────────────────────

/** Bons de commande d'un établissement. */
export async function getBons(etablissementId: string): Promise<BonRow[]> {
  return prisma.bonCommande.findMany({
    where: { etablissementId, deletedAt: null },
    include: {
      lignes: true,
      createdBy: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true, adresse: true, ville: true, region: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Tous les bons de commande (vue admin). */
export async function getAllBons(): Promise<BonRow[]> {
  return prisma.bonCommande.findMany({
    where: { deletedAt: null },
    include: {
      lignes: true,
      createdBy: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true, adresse: true, ville: true, region: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Trouve un bon par sa référence (ex: BON-2024-0001). */
export async function getBonByReference(reference: string): Promise<BonRow | null> {
  return prisma.bonCommande.findUnique({
    where: { reference, deletedAt: null },
    include: {
      lignes: true,
      createdBy: { select: { nom: true, prenom: true } },
      etablissement: { select: { id: true, nom: true, adresse: true, ville: true, region: true } },
    },
  });
}

// ── Budgets ───────────────────────────────────────────────────────────────────

/**
 * Budgets filtrés.
 * - Avec `etablissementId` : budget d'un seul établissement.
 * - Sans paramètre : tous les budgets (vue admin / ministère).
 */
export async function getBudgets(opts?: { etablissementId?: string }): Promise<BudgetRow[]> {
  return prisma.budget.findMany({
    where: opts?.etablissementId ? { etablissementId: opts.etablissementId } : {},
    include: { etablissement: { select: { id: true, nom: true, code: true } } },
    orderBy: [{ annee: "desc" }, { createdAt: "desc" }],
  });
}
