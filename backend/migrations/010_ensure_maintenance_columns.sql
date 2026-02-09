-- Migration: Ensure maintenance_history columns exist (failsafe)
-- Date: 2025-02-09
-- Purpose: Guarantee that duree_jours and vgp_effectuee columns exist

-- This migration runs AFTER all others to ensure these columns exist
-- Uses IF NOT EXISTS to prevent errors if already created

ALTER TABLE public.maintenance_history
ADD COLUMN IF NOT EXISTS duree_jours INTEGER DEFAULT 0;

ALTER TABLE public.maintenance_history
ADD COLUMN IF NOT EXISTS vgp_effectuee BOOLEAN DEFAULT FALSE;
