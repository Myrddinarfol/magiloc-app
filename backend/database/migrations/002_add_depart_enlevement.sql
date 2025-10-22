-- Migration: Ajouter le champ depart_enlevement pour les réservations
-- Date: 2025-10-22
-- Description: Ajoute un champ optionnel pour enregistrer la date de départ/enlèvement d'un matériel

ALTER TABLE equipments
ADD COLUMN depart_enlevement VARCHAR(50) DEFAULT NULL;

-- Commentaire
COMMENT ON COLUMN equipments.depart_enlevement IS 'Date de départ/enlèvement du matériel (expédition ou enlèvement client) - À titre indicatif';
