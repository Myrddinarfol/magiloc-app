-- 016_create_vgp_interventions.sql
-- Create table for VGP interventions planning and tracking

CREATE TABLE IF NOT EXISTS vgp_interventions (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES vgp_clients(id) ON DELETE SET NULL,
  client_nom VARCHAR(255),
  site_id INTEGER REFERENCES vgp_client_sites(id) ON DELETE SET NULL,
  site_nom VARCHAR(255),
  adresse_intervention TEXT NOT NULL,
  contact_site TEXT,
  date_intervention DATE NOT NULL,
  duree_jours DECIMAL(4,1) NOT NULL DEFAULT 1.0,
  recommandations TEXT,
  statut VARCHAR(50) DEFAULT 'planifiee',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vgp_interventions_date ON vgp_interventions(date_intervention);
CREATE INDEX IF NOT EXISTS idx_vgp_interventions_statut ON vgp_interventions(statut);
