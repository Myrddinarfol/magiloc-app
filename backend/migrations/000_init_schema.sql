-- ═══════════════════════════════════════════════════════════════════════════
--  MAGILOC - SCHÉMA DE BASE DE DONNÉES INITIAL
--  Version: 0.9.1
--  Crée les tables principales de base
-- ═══════════════════════════════════════════════════════════════════════════

-- Table des équipements (table principale)
CREATE TABLE IF NOT EXISTS equipments (
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
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipments(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS location_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipments(id),
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
CREATE TABLE IF NOT EXISTS maintenance_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipments(id) ON DELETE CASCADE,
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
--  INDEX POUR OPTIMISATION DES PERFORMANCES
-- ═══════════════════════════════════════════════════════════════════════════

-- Index sur equipments
CREATE INDEX IF NOT EXISTS idx_equipments_statut ON equipments(statut);
CREATE INDEX IF NOT EXISTS idx_equipments_numero_serie ON equipments(numero_serie);
CREATE INDEX IF NOT EXISTS idx_equipments_prochain_vgp ON equipments(prochain_vgp);

-- Index sur locations
CREATE INDEX IF NOT EXISTS idx_locations_equipment_id ON locations(equipment_id);
CREATE INDEX IF NOT EXISTS idx_locations_statut ON locations(statut);

-- Index sur location_history
CREATE INDEX IF NOT EXISTS idx_location_history_equipment_id ON location_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_location_history_date_debut ON location_history(date_debut);
CREATE INDEX IF NOT EXISTS idx_location_history_ca_total ON location_history(ca_total_ht);
CREATE INDEX IF NOT EXISTS idx_location_history_remise_ld ON location_history(remise_ld);

-- Index sur maintenance_history
CREATE INDEX IF NOT EXISTS idx_maintenance_history_equipment_id ON maintenance_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_history_date_entree ON maintenance_history(date_entree);
