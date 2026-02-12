import React from 'react';
import VGPPageHeader from './VGPPageHeader';
import './VGPMaterielPage.css';

const VGPMaterielPage = () => {
  return (
    <div className="vgp-materiel-page">
      <VGPPageHeader
        icon="📦"
        title="Gestion du Matériel"
        subtitle="PARC MATÉRIEL"
        description="Gérez les équipements par client et suivez leurs inspections VGP"
      />

      <div className="vgp-materiel-placeholder">
        <div className="vgp-placeholder-content">
          <div className="vgp-placeholder-icon">🏗️</div>
          <h2>Matériel en développement</h2>
          <p>Cette section permettra de :</p>
          <ul className="vgp-features-list">
            <li>📋 Lister les équipements par client</li>
            <li>🔍 Consulter les détails techniques</li>
            <li>📅 Tracker les dates d'inspection VGP</li>
            <li>✅ Enregistrer les conformités</li>
            <li>⚠️ Gérer les non-conformités détectées</li>
          </ul>
          <p className="vgp-coming-soon">Disponible très bientôt...</p>
        </div>
      </div>
    </div>
  );
};

export default VGPMaterielPage;
