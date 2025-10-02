-- Migration : Ajout des tables d'historique et colonnes nécessaires
-- Date: 2025-10-02
-- Objectif: Traçabilité complète des locations et maintenances

-- 1. Ajouter la colonne note_retour dans equipments (temporaire, nettoyée au retour sur parc)
ALTER TABLE equipments ADD COLUMN IF NOT EXISTS note_retour TEXT;

-- 2. Améliorer location_history avec colonnes manquantes
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS date_retour_reel DATE;
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS note_retour TEXT;
ALTER TABLE location_history ADD COLUMN IF NOT EXISTS rentre_le VARCHAR(50);

-- 3. Créer la table maintenance_history
CREATE TABLE IF NOT EXISTS maintenance_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipments(id) ON DELETE CASCADE,
    date_entree TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sortie TIMESTAMP,
    motif_maintenance TEXT,
    note_retour TEXT,
    travaux_effectues TEXT,
    cout_maintenance DECIMAL(10,2),
    technicien VARCHAR(100),
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Index pour améliorer les performances des requêtes d'historique
CREATE INDEX IF NOT EXISTS idx_location_history_equipment_id ON location_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_location_history_date_debut ON location_history(date_debut);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment_id ON maintenance_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_date_entree ON maintenance_history(date_entree);

-- Vérification
SELECT 'Migration completed successfully!' AS status;
