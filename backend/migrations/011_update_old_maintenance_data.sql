-- Migration: Update old maintenance records with vgp_effectuee and duree_jours
-- Date: 2026-02-09
-- Purpose: Backfill existing maintenance records with missing JSON data

-- For empty or NULL travaux_effectues, create JSON with default values
UPDATE public.maintenance_history
SET travaux_effectues = jsonb_build_object(
  'vgp_effectuee', false,
  'duree_jours', GREATEST(1, CEIL(EXTRACT(DAY FROM (COALESCE(date_sortie, NOW()) - date_entree))))::integer
)::text
WHERE travaux_effectues IS NULL OR travaux_effectues = '';

-- For existing JSON records, ensure vgp_effectuee and duree_jours are present
UPDATE public.maintenance_history
SET travaux_effectues = (
  travaux_effectues::jsonb ||
  jsonb_build_object(
    'vgp_effectuee', COALESCE((travaux_effectues::jsonb->>'vgp_effectuee')::boolean, false),
    'duree_jours', COALESCE(
      (travaux_effectues::jsonb->>'duree_jours')::integer,
      GREATEST(1, CEIL(EXTRACT(DAY FROM (COALESCE(date_sortie, NOW()) - date_entree))))::integer
    )
  )
)::text
WHERE travaux_effectues IS NOT NULL
  AND travaux_effectues != ''
  AND (
    travaux_effectues::jsonb ? 'vgp_effectuee' = false
    OR travaux_effectues::jsonb ? 'duree_jours' = false
  );
