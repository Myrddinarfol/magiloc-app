-- Migration 007: Add est_long_duree column to equipments table
-- Purpose: Store whether equipment rental qualifies for long-duration discount

-- Vérifier si la colonne n'existe pas avant de l'ajouter
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipments' AND column_name = 'est_long_duree'
  ) THEN
    ALTER TABLE equipments ADD COLUMN est_long_duree BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Colonne est_long_duree ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne est_long_duree existe déjà';
  END IF;
END $$;

-- Créer l'index s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'equipments' AND indexname = 'idx_equipments_est_long_duree'
  ) THEN
    CREATE INDEX idx_equipments_est_long_duree ON equipments(est_long_duree);
    RAISE NOTICE 'Index idx_equipments_est_long_duree créé avec succès';
  ELSE
    RAISE NOTICE 'Index idx_equipments_est_long_duree existe déjà';
  END IF;
END $$;

SELECT 'Migration 007: est_long_duree - Complétée' AS status;
