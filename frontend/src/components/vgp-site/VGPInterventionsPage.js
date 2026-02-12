import React from 'react';
import VGPPageHeader from './VGPPageHeader';
import './VGPInterventionsPage.css';

const VGPInterventionsPage = () => {
  return (
    <div className="vgp-interventions-page">
      <VGPPageHeader
        icon="🛠️"
        title="Gestion des Interventions"
        subtitle="INTERVENTIONS VGP"
        description="Planifiez et gérez vos interventions de visite de grande périodicité sur site client"
      />

      <div className="vgp-interventions-placeholder">
        <div className="vgp-placeholder-content">
          <div className="vgp-placeholder-icon">🔧</div>
          <h2>Interventions en développement</h2>
          <p>Cette section permettra de :</p>
          <ul className="vgp-features-list">
            <li>📅 Planifier les interventions VGP</li>
            <li>📊 Suivre l'avancement des visites</li>
            <li>📝 Documenter les findings</li>
            <li>🔗 Lier aux clients et équipements</li>
            <li>✅ Générer les rapports d'intervention</li>
          </ul>
          <p className="vgp-coming-soon">Disponible très bientôt...</p>
        </div>
      </div>
    </div>
  );
};

export default VGPInterventionsPage;
