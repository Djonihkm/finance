-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'MINISTERE', 'ADMIN', 'COMPTABLE', 'DIRECTEUR');

-- CreateEnum
CREATE TYPE "StatutDocument" AS ENUM ('BROUILLON', 'SOUMIS', 'VALIDE', 'REJETE');

-- CreateEnum
CREATE TYPE "TypeEtablissement" AS ENUM ('LYCEE', 'COLLEGE', 'CEG', 'ECOLE_PRIMAIRE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypePaiement" AS ENUM ('ESPECES', 'VIREMENT', 'VIREMENT_30J', 'VIREMENT_60J', 'CHEQUE', 'CARTE_BANCAIRE', 'ACOMPTE');

-- CreateEnum
CREATE TYPE "CategorieDepense" AS ENUM ('FOURNITURE', 'MOBILIER', 'PERSONNEL', 'PEDAGOGIE', 'EQUIPEMENT', 'TRAVAUX', 'AUTRE');

-- CreateEnum
CREATE TYPE "ActionHistorique" AS ENUM ('CREE', 'MODIFIE', 'SOUMIS', 'SIGNE', 'VALIDE', 'REJETE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "telephone" TEXT,
    "poste" TEXT,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "etablissementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etablissement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "TypeEtablissement" NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "region" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Etablissement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "annee" INTEGER NOT NULL,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "montantConsomme" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "etablissementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Depense" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "categorie" "CategorieDepense" NOT NULL,
    "paiement" "TypePaiement" NOT NULL,
    "fournisseur" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'BROUILLON',
    "signeParId" TEXT,
    "signeAt" TIMESTAMP(3),
    "valideParId" TEXT,
    "valideAt" TIMESTAMP(3),
    "commentaire" TEXT,
    "etablissementId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Depense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonCommande" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "fournisseur" TEXT,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "statut" "StatutDocument" NOT NULL DEFAULT 'BROUILLON',
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "signeParId" TEXT,
    "signeAt" TIMESTAMP(3),
    "valideParId" TEXT,
    "valideAt" TIMESTAMP(3),
    "commentaire" TEXT,
    "etablissementId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BonCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LigneBonCommande" (
    "id" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DECIMAL(15,2) NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "bonCommandeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LigneBonCommande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Historique" (
    "id" TEXT NOT NULL,
    "action" "ActionHistorique" NOT NULL,
    "commentaire" TEXT,
    "userId" TEXT NOT NULL,
    "depenseId" TEXT,
    "bonCommandeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Historique_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Etablissement_code_key" ON "Etablissement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_etablissementId_annee_key" ON "Budget"("etablissementId", "annee");

-- CreateIndex
CREATE UNIQUE INDEX "Depense_reference_key" ON "Depense"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "BonCommande_reference_key" ON "BonCommande"("reference");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etablissement" ADD CONSTRAINT "Etablissement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_signeParId_fkey" FOREIGN KEY ("signeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonCommande" ADD CONSTRAINT "BonCommande_signeParId_fkey" FOREIGN KEY ("signeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonCommande" ADD CONSTRAINT "BonCommande_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonCommande" ADD CONSTRAINT "BonCommande_etablissementId_fkey" FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonCommande" ADD CONSTRAINT "BonCommande_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LigneBonCommande" ADD CONSTRAINT "LigneBonCommande_bonCommandeId_fkey" FOREIGN KEY ("bonCommandeId") REFERENCES "BonCommande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_depenseId_fkey" FOREIGN KEY ("depenseId") REFERENCES "Depense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique" ADD CONSTRAINT "Historique_bonCommandeId_fkey" FOREIGN KEY ("bonCommandeId") REFERENCES "BonCommande"("id") ON DELETE SET NULL ON UPDATE CASCADE;
