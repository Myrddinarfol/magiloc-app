-- Add nature_intervention column to track the type of intervention
ALTER TABLE vgp_interventions
ADD COLUMN IF NOT EXISTS nature_intervention VARCHAR(255);
