import React from 'react';
import VGPPageHeader from './VGPPageHeader';
import './VGPRapportsPage.css';

const VGPRapportsPage = () => {
  return (
    <div className="vgp-rapports-page">
      <VGPPageHeader
        icon="📝"
        title="Rapports d'Intervention"
        subtitle="DOCUMENTATION VGP"
        description="Générez et consultez les rapports détaillés de vos interventions VGP"
      />

      <div className="vgp-rapports-placeholder">
        <div className="vgp-placeholder-content">
          <div className="vgp-placeholder-icon">📄</div>
          <h2>Rapports en développement</h2>
          <p>Cette section permettra de :</p>
          <ul className="vgp-features-list">
            <li>📋 Générer les rapports d'intervention</li>
            <li>✍️ Documenter les observations</li>
            <li>📎 Joindre photos et documents</li>
            <li>🔗 Exporter en PDF</li>
            <li>📧 Envoyer par email au client</li>
          </ul>
          <p className="vgp-coming-soon">Disponible très bientôt...</p>
        </div>
      </div>
    </div>
  );
};

export default VGPRapportsPage;
