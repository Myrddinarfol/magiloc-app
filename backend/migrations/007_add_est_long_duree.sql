-- Migration 007: Add est_long_duree column to equipments table
-- Purpose: Store whether equipment rental qualifies for long-duration discount

-- Ajouter la colonne si elle n'existe pas (simple et robuste)
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS est_long_duree BOOLEAN DEFAULT FALSE;

-- Créer l'index si'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_equipments_est_long_duree ON equipments(est_long_duree);

SELECT 'Migration 007: est_long_duree column added' AS status;
