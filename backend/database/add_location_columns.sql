-- Ajout des colonnes de location à la table equipments
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS client VARCHAR(200);
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS debut_location VARCHAR(50);
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS fin_location_theorique VARCHAR(50);
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS rentre_le VARCHAR(50);
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS numero_offre VARCHAR(100);
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS notes_location TEXT;
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS motif_maintenance TEXT;
