-- Migration : Ajout des colonnes pour le calcul du CA
-- Date: 2025-10-02
-- Objectif: Tracer le CA généré par chaque location

-- Ajouter les colonnes pour le calcul du CA
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS duree_jours_ouvres INTEGER;
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS prix_ht_jour DECIMAL(10,2);
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS remise_ld BOOLEAN DEFAULT FALSE;
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS ca_total_ht DECIMAL(10,2);

-- Index pour améliorer les requêtes d'analyse
CREATE INDEX IF NOT EXISTS idx_location_history_ca_total ON location_history(ca_total_ht);
CREATE INDEX IF NOT EXISTS idx_location_history_remise_ld ON location_history(remise_ld);

SELECT 'Migration CA columns completed successfully!' AS status;
