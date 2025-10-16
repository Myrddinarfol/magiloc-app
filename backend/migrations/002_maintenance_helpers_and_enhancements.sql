-- Migration: Maintenance Helpers and Enhanced Maintenance System
-- Date: 2025-10-16
-- Purpose: Add maintenance aid/helper system and enhance maintenance records

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: MAINTENANCE HELPERS (Aide à la maintenance par équipement)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.maintenance_helpers (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL UNIQUE REFERENCES public.equipments(id) ON DELETE CASCADE,

    -- Tips & Conseils
    tips_conseils TEXT,

    -- Liens Utiles
    liens_utiles TEXT,  -- JSON array format: [{"titre": "...", "url": "..."}, ...]

    -- Pièces Critiques
    pieces_critiques TEXT,  -- JSON array format: [{"nom": "...", "description": "..."}, ...]

    -- Contact Constructeur
    contact_constructeur_nom VARCHAR(200),
    contact_constructeur_tel VARCHAR(20),
    contact_constructeur_email VARCHAR(255),
    contact_constructeur_url VARCHAR(500),

    -- Historique des problèmes récurrents
    historique_problemes TEXT,  -- Texte libre ou JSON

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ENHANCE MAINTENANCE_HISTORY TABLE
-- ═══════════════════════════════════════════════════════════════════════════

-- Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public.maintenance_history
ADD COLUMN IF NOT EXISTS notes_maintenance TEXT,
ADD COLUMN IF NOT EXISTS main_oeuvre_heures DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS vgp_effectuee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS technicien_nom VARCHAR(100),
ADD COLUMN IF NOT EXISTS pieces_utilisees_json TEXT;

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE: MAINTENANCE_PIECES_TEMP (Pièces temporaires saisies en maintenance)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.maintenance_pieces_temp (
    id SERIAL PRIMARY KEY,
    maintenance_id INTEGER NOT NULL REFERENCES public.maintenance_history(id) ON DELETE CASCADE,
    designation VARCHAR(200) NOT NULL,
    quantite INTEGER DEFAULT 1,
    spare_part_id INTEGER REFERENCES public.spare_parts(id) ON DELETE SET NULL,
    is_from_inventory BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CREATE INDEXES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_maintenance_helpers_equipment ON public.maintenance_helpers(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_pieces_temp_maintenance ON public.maintenance_pieces_temp(maintenance_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_pieces_temp_spare_part ON public.maintenance_pieces_temp(spare_part_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_vgp ON public.maintenance_history(vgp_effectuee);
