-- Migration 018: Create VGP Intervention Executions Table
-- Purpose: Store execution details for VGP interventions (field work tracking)

CREATE TABLE IF NOT EXISTS vgp_intervention_executions (
  id SERIAL PRIMARY KEY,
  intervention_id INTEGER NOT NULL UNIQUE REFERENCES vgp_interventions(id) ON DELETE CASCADE,

  -- Actual times tracked during field work
  heure_debut TIME,
  heure_fin TIME,
  duree_effective_heures DECIMAL(4,1),

  -- Equipment checked during intervention (JSONB array)
  -- Structure: [{ id, designation, numero_serie, cmu, statut: 'conforme'|'non_conforme'|'a_remplacer', observations, timestamp }]
  equipements_controles JSONB DEFAULT '[]'::jsonb,

  -- Parts changed during intervention (JSONB array)
  -- Structure: [{ id, reference, designation, quantite, cout_unitaire, timestamp }]
  pieces_changees JSONB DEFAULT '[]'::jsonb,

  -- Field observations and notes (JSONB array)
  -- Structure: [{ id, timestamp, texte, type: 'info'|'warning'|'critical' }]
  observations JSONB DEFAULT '[]'::jsonb,

  -- Draft status (auto-save vs completed)
  brouillon BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_vgp_executions_intervention ON vgp_intervention_executions(intervention_id);
