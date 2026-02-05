-- Migration: Create CLIENTS, SPARE_PARTS and BASE TABLES
-- Date: 2025-10-16
-- NOTE: Now includes base table creation

-- ═══════════════════════════════════════════════════════════════════════════
--  BASE TABLES - CREATED FIRST
-- ═══════════════════════════════════════════════════════════════════════════

-- Table des équipements (table principale)
CREATE TABLE IF NOT EXISTS public.equipments (
    id SERIAL PRIMARY KEY,
    designation VARCHAR(100) NOT NULL,
    cmu VARCHAR(20),
    modele VARCHAR(100),
    marque VARCHAR(100),
    longueur VARCHAR(50),
    infos_complementaires TEXT,
    numero_serie VARCHAR(100) UNIQUE NOT NULL,
    prix_ht_jour DECIMAL(10,2),
    minimum_facturation DECIMAL(10,2) DEFAULT 0,
    minimum_facturation_apply BOOLEAN DEFAULT FALSE,
    id_article VARCHAR(50),
    etat VARCHAR(50),
    certificat VARCHAR(100),
    dernier_vgp DATE,
    prochain_vgp DATE,
    statut VARCHAR(50) DEFAULT 'Sur Parc',
    client VARCHAR(200),
    debut_location VARCHAR(50),
    fin_location_theorique VARCHAR(50),
    depart_enlevement VARCHAR(50),
    rentre_le VARCHAR(50),
    numero_offre VARCHAR(100),
    notes_location TEXT,
    note_retour TEXT,
    motif_maintenance TEXT,
    debut_maintenance TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des locations actives
CREATE TABLE IF NOT EXISTS public.locations (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES public.equipments(id) ON DELETE CASCADE,
    client VARCHAR(200),
    date_debut DATE,
    date_fin_theorique DATE,
    date_retour_reel DATE,
    numero_offre VARCHAR(100),
    notes_location TEXT,
    statut VARCHAR(50) DEFAULT 'En cours',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table historique des locations (avec CA)
CREATE TABLE IF NOT EXISTS public.location_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES public.equipments(id),
    client VARCHAR(200),
    date_debut DATE,
    date_fin_theorique DATE,
    date_retour_reel DATE,
    rentre_le VARCHAR(50),
    numero_offre VARCHAR(100),
    notes_location TEXT,
    note_retour TEXT,
    prix_facture DECIMAL(10,2),
    duree_jours_ouvres INTEGER,
    prix_ht_jour DECIMAL(10,2),
    remise_ld BOOLEAN DEFAULT FALSE,
    ca_total_ht DECIMAL(10,2),
    minimum_facturation_apply BOOLEAN DEFAULT FALSE,
    minimum_facturation DECIMAL(10,2) DEFAULT 0,
    est_pret BOOLEAN DEFAULT FALSE,
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table historique des maintenances
CREATE TABLE IF NOT EXISTS public.maintenance_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES public.equipments(id) ON DELETE CASCADE,
    date_entree TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_sortie TIMESTAMP,
    motif_maintenance TEXT,
    note_retour TEXT,
    travaux_effectues TEXT,
    cout_maintenance DECIMAL(10,2),
    technicien VARCHAR(100),
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══════════════════════════════════════════════════════════════════════════
--  CLIENTS AND RELATED TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Table CLIENTS
CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL UNIQUE,
    email VARCHAR(255),
    telephone VARCHAR(20),
    adresse TEXT,
    contact_principal VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table PIECES_DETACHEES (Spare Parts)
CREATE TABLE IF NOT EXISTS public.spare_parts (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(100) NOT NULL UNIQUE,
    designation VARCHAR(200) NOT NULL,
    equipment_id INTEGER REFERENCES public.equipments(id) ON DELETE CASCADE,
    cost NUMERIC(10, 2),
    quantity INTEGER DEFAULT 1,
    supplier VARCHAR(200),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table SPARE_PARTS_USAGE (Track spare part usage in maintenance)
CREATE TABLE IF NOT EXISTS public.spare_parts_usage (
    id SERIAL PRIMARY KEY,
    spare_part_id INTEGER NOT NULL REFERENCES public.spare_parts(id) ON DELETE CASCADE,
    maintenance_id INTEGER REFERENCES public.maintenance_history(id) ON DELETE CASCADE,
    quantity_used INTEGER NOT NULL DEFAULT 1,
    cost_used NUMERIC(10, 2),
    date_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_nom ON public.clients(nom);
CREATE INDEX IF NOT EXISTS idx_spare_parts_reference ON public.spare_parts(reference);
CREATE INDEX IF NOT EXISTS idx_spare_parts_equipment ON public.spare_parts(equipment_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_usage_part ON public.spare_parts_usage(spare_part_id);
CREATE INDEX IF NOT EXISTS idx_spare_parts_usage_maintenance ON public.spare_parts_usage(maintenance_id);

-- Alter EQUIPMENTS table if needed (add client_id foreign key)
ALTER TABLE public.equipments
ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL;

-- Alter LOCATION_HISTORY table if needed
ALTER TABLE public.location_history
ADD COLUMN IF NOT EXISTS client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL;

-- Create indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_equipments_client ON public.equipments(client_id);
CREATE INDEX IF NOT EXISTS idx_location_history_client ON public.location_history(client_id);
