-- 015_create_vgp_client_sites.sql
-- Create table for VGP client sites (a client can have multiple intervention sites)

CREATE TABLE IF NOT EXISTS vgp_client_sites (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES vgp_clients(id) ON DELETE CASCADE,
  nom VARCHAR(255) NOT NULL,
  adresse TEXT NOT NULL,
  contact_site TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vgp_client_sites_client ON vgp_client_sites(client_id);
