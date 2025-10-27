-- Migration 006: Add depart_enlevement column to equipments table
-- Purpose: Store shipment/pickup date for equipment rentals

ALTER TABLE equipments ADD COLUMN depart_enlevement DATE;

-- Add index for performance
CREATE INDEX idx_equipments_depart_enlevement ON equipments(depart_enlevement);

-- Log completion
SELECT 'Migration 006: depart_enlevement column added successfully' AS status;
