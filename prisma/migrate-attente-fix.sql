UPDATE "Depense"     SET "statut" = 'REVIEW' WHERE "commentaire" IS NOT NULL AND "statut" = 'ATTENTE';
UPDATE "BonCommande" SET "statut" = 'REVIEW' WHERE "commentaire" IS NOT NULL AND "statut" = 'ATTENTE';
