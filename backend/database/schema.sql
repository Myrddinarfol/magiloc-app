-- Table des équipements
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
    etat VARCHAR(50),
    certificat VARCHAR(100),
    dernier_vgp DATE,
    prochain_vgp DATE,
    statut VARCHAR(50) DEFAULT 'Sur Parc',
    client VARCHAR(200),
    debut_location VARCHAR(50),
    fin_location_theorique VARCHAR(50),
    rentre_le VARCHAR(50),
    numero_offre VARCHAR(100),
    notes_location TEXT,
    motif_maintenance TEXT,
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

-- Table historique des locations
CREATE TABLE IF NOT EXISTS location_history (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipments(id),
    client VARCHAR(200),
    date_debut DATE,
    date_fin DATE,
    numero_offre VARCHAR(100),
    notes_location TEXT,
    prix_facture DECIMAL(10,2),
    archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_equipments_statut ON equipments(statut);
CREATE INDEX IF NOT EXISTS idx_equipments_numero_serie ON equipments(numero_serie);
CREATE INDEX IF NOT EXISTS idx_locations_equipment_id ON locations(equipment_id);
