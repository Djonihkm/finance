-- Migrate StatutDocument enum: BROUILLON/SOUMIS → REVIEW
-- Step 1: Create new enum type
CREATE TYPE "StatutDocument_new" AS ENUM ('REVIEW', 'VALIDE', 'REJETE');

-- Step 2: Drop defaults that reference the old type
ALTER TABLE "Depense" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "BonCommande" ALTER COLUMN "statut" DROP DEFAULT;

-- Step 3: Update data (cast existing BROUILLON/SOUMIS rows to REVIEW via text)
UPDATE "Depense" SET "statut" = 'BROUILLON' WHERE "statut"::text = 'BROUILLON';
UPDATE "Depense" SET "statut" = 'SOUMIS' WHERE "statut"::text = 'SOUMIS';

-- Step 4: Alter columns to use new enum, coercing BROUILLON/SOUMIS → REVIEW
ALTER TABLE "Depense" ALTER COLUMN "statut" TYPE "StatutDocument_new"
  USING (
    CASE "statut"::text
      WHEN 'BROUILLON' THEN 'REVIEW'::"StatutDocument_new"
      WHEN 'SOUMIS'    THEN 'REVIEW'::"StatutDocument_new"
      ELSE "statut"::text::"StatutDocument_new"
    END
  );

ALTER TABLE "BonCommande" ALTER COLUMN "statut" TYPE "StatutDocument_new"
  USING (
    CASE "statut"::text
      WHEN 'BROUILLON' THEN 'REVIEW'::"StatutDocument_new"
      WHEN 'SOUMIS'    THEN 'REVIEW'::"StatutDocument_new"
      ELSE "statut"::text::"StatutDocument_new"
    END
  );

-- Step 5: Drop old enum and rename new one
DROP TYPE "StatutDocument";
ALTER TYPE "StatutDocument_new" RENAME TO "StatutDocument";

-- Step 6: Restore defaults
ALTER TABLE "Depense" ALTER COLUMN "statut" SET DEFAULT 'REVIEW';
ALTER TABLE "BonCommande" ALTER COLUMN "statut" SET DEFAULT 'REVIEW';
