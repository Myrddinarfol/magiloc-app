-- Migration: Ajouter colonne est_pret pour tracer les matériels en prêt

-- Ajouter colonne est_pret à la table equipments
ALTER TABLE equipments
ADD COLUMN est_pret BOOLEAN DEFAULT FALSE;

-- Créer un index pour améliorer les performances de filtrage
CREATE INDEX IF NOT EXISTS idx_equipments_est_pret ON equipments(est_pret);

-- Ajouter colonne est_pret à la table location_history pour archiver l'info
ALTER TABLE location_history
ADD COLUMN est_pret BOOLEAN DEFAULT FALSE;

-- Créer un index pour location_history
CREATE INDEX IF NOT EXISTS idx_location_history_est_pret ON location_history(est_pret);

-- Commentaires pour documenter
COMMENT ON COLUMN equipments.est_pret IS 'Indique si le matériel est en prêt (non facturé). Exemple: SAV, délai de commande, etc.';
COMMENT ON COLUMN location_history.est_pret IS 'Indique si cette location était un prêt (non facturé)';
