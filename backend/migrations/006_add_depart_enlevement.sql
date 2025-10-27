-- Migration 006: Add depart_enlevement column to equipments table
-- Purpose: Store shipment/pickup date for equipment rentals

-- Vérifier si la colonne n'existe pas avant de l'ajouter
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipments' AND column_name = 'depart_enlevement'
  ) THEN
    ALTER TABLE equipments ADD COLUMN depart_enlevement DATE;
    RAISE NOTICE 'Colonne depart_enlevement ajoutée avec succès';
  ELSE
    RAISE NOTICE 'Colonne depart_enlevement existe déjà';
  END IF;
END $$;

-- Créer l'index s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'equipments' AND indexname = 'idx_equipments_depart_enlevement'
  ) THEN
    CREATE INDEX idx_equipments_depart_enlevement ON equipments(depart_enlevement);
    RAISE NOTICE 'Index idx_equipments_depart_enlevement créé avec succès';
  ELSE
    RAISE NOTICE 'Index idx_equipments_depart_enlevement existe déjà';
  END IF;
END $$;

SELECT 'Migration 006: depart_enlevement - Complétée' AS status;
