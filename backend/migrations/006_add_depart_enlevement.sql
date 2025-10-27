-- Migration 006: Add depart_enlevement column to equipments table
-- Purpose: Store shipment/pickup date for equipment rentals

-- Ajouter la colonne si elle n'existe pas (simple et robuste)
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS depart_enlevement DATE;

-- Créer l'index si'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_equipments_depart_enlevement ON equipments(depart_enlevement);

SELECT 'Migration 006: depart_enlevement column added' AS status;
