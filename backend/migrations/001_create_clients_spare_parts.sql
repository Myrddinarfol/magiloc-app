-- Migration: Create CLIENTS and SPARE_PARTS tables
-- Date: 2025-10-16

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
