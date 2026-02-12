-- Create vgp_clients table for VGP (Visites de Grande Périodicité) application
CREATE TABLE IF NOT EXISTS vgp_clients (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  contact_principal TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on nom for faster searches
CREATE INDEX IF NOT EXISTS idx_vgp_clients_nom ON vgp_clients(nom);
