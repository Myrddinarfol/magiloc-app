-- Migration: Ajouter le champ est_pret à location_history
-- Date: 2025-11-05

ALTER TABLE location_history
ADD COLUMN IF NOT EXISTS est_pret BOOLEAN DEFAULT FALSE;

-- Index optionnel pour améliorer les performances sur les requêtes prêt
CREATE INDEX IF NOT EXISTS idx_location_history_est_pret ON location_history(est_pret);

-- Note: Les locations archivées avant cette migration auront est_pret = FALSE par défaut
-- Pour les locations prêtées archivées, le champ aura été correctement défini par le backend
-- lors de la prochaine archivisation avec est_pret = true
