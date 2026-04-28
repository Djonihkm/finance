UPDATE "Depense"     SET "statut" = 'ATTENTE' WHERE "statut" = 'REVIEW';
UPDATE "BonCommande" SET "statut" = 'ATTENTE' WHERE "statut" = 'REVIEW';
