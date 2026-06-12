-- Migration 019: Normaliser le statut 'Réservation' en 'En Réservation'
-- Des données legacy (ancien import) utilisaient 'Réservation' alors que
-- toute l'application filtre sur 'En Réservation'. Ces équipements
-- n'apparaissaient dans aucun onglet.
UPDATE equipments SET statut = 'En Réservation' WHERE statut = 'Réservation'
