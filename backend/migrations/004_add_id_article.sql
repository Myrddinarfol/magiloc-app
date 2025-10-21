-- Migration: Add id_article field to equipment
-- Date: 2025-10-21
-- Purpose: Add id_article field for linking with external inventory system

-- ═══════════════════════════════════════════════════════════════════════════
-- ADD ID_ARTICLE COLUMN TO EQUIPMENTS TABLE
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.equipments
ADD COLUMN IF NOT EXISTS id_article VARCHAR(50);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE INDEX
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_equipments_id_article ON public.equipments(id_article);
