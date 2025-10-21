-- Migration: Add minimum facturation field to equipment
-- Date: 2025-10-21
-- Purpose: Add minimum_facturation field for billing minimum management

-- ═══════════════════════════════════════════════════════════════════════════
-- ADD MINIMUM_FACTURATION COLUMN TO EQUIPMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.equipments
ADD COLUMN IF NOT EXISTS minimum_facturation DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_facturation_apply BOOLEAN DEFAULT FALSE;

-- ═══════════════════════════════════════════════════════════════════════════
-- ADD MINIMUM_FACTURATION TRACKING TO LOCATION_HISTORY TABLE
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.location_history
ADD COLUMN IF NOT EXISTS minimum_facturation_apply BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minimum_facturation DECIMAL(10,2) DEFAULT 0;

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_equipments_minimum_facturation ON public.equipments(minimum_facturation);
CREATE INDEX IF NOT EXISTS idx_location_history_min_facturation ON public.location_history(minimum_facturation_apply);
