import { PrismaClient, Role, TypeEtablissement } from "../lib/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ── Compte développeur ────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "dev@system.bj" },
    update: {},
    create: {
      email: "dev@system.bj",
      password: await hash("dev123"),
      nom: "Système",
      prenom: "Développeur",
      role: Role.SUPER_ADMIN,
    },
  });

  // ── Compte Ministère ──────────────────────────────────────────────────────
  const ministere = await prisma.user.upsert({
    where: { email: "admin@ministere.bj" },
    update: {},
    create: {
      email: "admin@ministere.bj",
      password: await hash("admin123"),
      nom: "Adjonou",
      prenom: "Kofi",
      role: Role.MINISTERE,
    },
  });

  // ── Établissements ────────────────────────────────────────────────────────
  const lycee = await prisma.etablissement.upsert({
    where: { code: "LYC-BEH-001" },
    update: {},
    create: {
      nom: "Lycée Béhanzin",
      code: "LYC-BEH-001",
      type: TypeEtablissement.LYCEE,
      ville: "Porto-Novo",
      region: "Ouémé",
      telephone: "+229 97 12 34 56",
      email: "lycee.behanzin@edu.bj",
      adresse: "Quartier Missèbo, Porto-Novo",
      createdById: ministere.id,
    },
  });

  const ceg = await prisma.etablissement.upsert({
    where: { code: "CEG-ABC-002" },
    update: {},
    create: {
      nom: "CEG de Abomey-Calavi",
      code: "CEG-ABC-002",
      type: TypeEtablissement.CEG,
      ville: "Abomey-Calavi",
      region: "Atlantique",
      telephone: "+229 91 34 56 78",
      email: "ceg.abcalavi@edu.bj",
      adresse: "Voie principale, Abomey-Calavi",
      createdById: ministere.id,
    },
  });

  // ── Lycée Béhanzin — 3 rôles ──────────────────────────────────────────────
  const directeurLycee = await prisma.user.upsert({
    where: { email: "directeur@lycee-behanzin.bj" },
    update: {},
    create: {
      email: "directeur@lycee-behanzin.bj",
      password: await hash("etab123"),
      nom: "Agossou",
      prenom: "Kofi",
      role: Role.DIRECTEUR,
      etablissementId: lycee.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@lycee-behanzin.bj" },
    update: {},
    create: {
      email: "admin@lycee-behanzin.bj",
      password: await hash("etab123"),
      nom: "Hounkpè",
      prenom: "Pascal",
      role: Role.ADMIN,
      etablissementId: lycee.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "comptable@lycee-behanzin.bj" },
    update: {},
    create: {
      email: "comptable@lycee-behanzin.bj",
      password: await hash("etab123"),
      nom: "Dossou",
      prenom: "Marie",
      role: Role.COMPTABLE,
      etablissementId: lycee.id,
    },
  });

  // ── CEG Abomey-Calavi — 3 rôles ───────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: "directeur@ceg-abcalavi.bj" },
    update: {},
    create: {
      email: "directeur@ceg-abcalavi.bj",
      password: await hash("etab123"),
      nom: "Tchégnonsi",
      prenom: "Arnaud",
      role: Role.DIRECTEUR,
      etablissementId: ceg.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@ceg-abcalavi.bj" },
    update: {},
    create: {
      email: "admin@ceg-abcalavi.bj",
      password: await hash("etab123"),
      nom: "Alabi",
      prenom: "Fatima",
      role: Role.ADMIN,
      etablissementId: ceg.id,
    },
  });

  await prisma.user.upsert({
    where: { email: "comptable@ceg-abcalavi.bj" },
    update: {},
    create: {
      email: "comptable@ceg-abcalavi.bj",
      password: await hash("etab123"),
      nom: "Gbaguidi",
      prenom: "Roméo",
      role: Role.COMPTABLE,
      etablissementId: ceg.id,
    },
  });

  // ── Budgets année courante ────────────────────────────────────────────────
  const year = new Date().getFullYear();

  await prisma.budget.upsert({
    where: { etablissementId_annee: { etablissementId: lycee.id, annee: year } },
    update: {},
    create: { annee: year, montantTotal: 45_000_000, etablissementId: lycee.id },
  });

  await prisma.budget.upsert({
    where: { etablissementId_annee: { etablissementId: ceg.id, annee: year } },
    update: {},
    create: { annee: year, montantTotal: 52_000_000, etablissementId: ceg.id },
  });

  // ── Dépense exemple ───────────────────────────────────────────────────────
  await prisma.depense.upsert({
    where: { reference: "DEP-2024-001" },
    update: {},
    create: {
      reference: "DEP-2024-001",
      intitule: "Fournitures de bureau (Papier, Encre)",
      montant: 450_000,
      categorie: "FOURNITURE",
      paiement: "ESPECES",
      date: new Date("2024-10-12"),
      etablissementId: lycee.id,
      createdById: directeurLycee.id,
    },
  });

  console.log("✅ Seed terminé");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
