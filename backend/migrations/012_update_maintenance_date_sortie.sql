-- Migration: Update date_sortie for old maintenance records
-- Date: 2026-02-09
-- Purpose: Calculate and set date_sortie for maintenance records that are missing it

-- Update date_sortie by calculating from date_entree + duree_jours (from JSON)
UPDATE public.maintenance_history
SET date_sortie = CASE
  -- If we have duree_jours in JSON, add it to date_entree
  WHEN travaux_effectues IS NOT NULL
    AND (travaux_effectues::jsonb->>'duree_jours')::integer > 0
  THEN date_entree + ((travaux_effectues::jsonb->>'duree_jours')::integer || ' days')::interval

  -- Otherwise, set it to 1 day after date_entree
  ELSE date_entree + interval '1 day'
END
WHERE date_sortie IS NULL;

-- Verify the update
SELECT COUNT(*) as "Maintenances avec date_sortie mise à jour"
FROM public.maintenance_history
WHERE date_sortie IS NOT NULL;
