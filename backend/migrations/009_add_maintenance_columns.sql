-- Migration: Add missing columns to maintenance_history
-- Date: 2025-02-06
-- Purpose: Add duree_jours and vgp_effectuee columns that are used by the backend

-- Add duree_jours column (duration in days)
ALTER TABLE public.maintenance_history
ADD COLUMN IF NOT EXISTS duree_jours INTEGER DEFAULT 0;

-- Add vgp_effectuee column (VGP = Visite Générale Périodique)
ALTER TABLE public.maintenance_history
ADD COLUMN IF NOT EXISTS vgp_effectuee BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment ON public.maintenance_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_date_entree ON public.maintenance_history(date_entree);
