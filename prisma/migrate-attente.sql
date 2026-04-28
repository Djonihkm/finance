-- Ajoute la valeur ATTENTE à l'enum (non-destructif)
ALTER TYPE "StatutDocument" ADD VALUE IF NOT EXISTS 'ATTENTE';

-- Migrate les documents existants : REVIEW (jamais touchés) → ATTENTE
UPDATE "Depense"     SET "statut" = 'ATTENTE' WHERE "statut" = 'REVIEW';
UPDATE "BonCommande" SET "statut" = 'ATTENTE' WHERE "statut" = 'REVIEW';
