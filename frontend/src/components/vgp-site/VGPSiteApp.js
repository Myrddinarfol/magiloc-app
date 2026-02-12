import React from 'react';
import { useApp } from '../../context/AppContext';
import './VGPSiteApp.css';

const VGPSiteApp = () => {
  const { resetAppSelection } = useApp();

  return (
    <div className="vgp-site-app">
      {/* Header */}
      <header className="vgp-site-header">
        <div className="vgp-header-content">
          <h1 className="vgp-title">🔧 MAGI-VGP</h1>
          <p className="vgp-subtitle">Interventions sur site client</p>
        </div>
        <button
          className="vgp-back-button"
          onClick={resetAppSelection}
          title="Retour à la sélection d'application"
        >
          ← Retour
        </button>
      </header>

      {/* Main Content */}
      <main className="vgp-site-main">
        <div className="vgp-construction-container">
          <div className="construction-icon">🚧</div>
          <h2 className="construction-title">Module en construction</h2>
          <p className="construction-text">
            L'application MAGI-VGP est en cours de développement.
          </p>
          <p className="construction-subtext">
            Revenez bientôt pour gérer vos interventions et parcs matériel !
          </p>

          <div className="construction-features">
            <h3>Fonctionnalités à venir :</h3>
            <ul>
              <li>📋 Gestion des clients VGP</li>
              <li>🛠️ Gestion du parc matériel par client</li>
              <li>📝 Rapports d'intervention</li>
              <li>✅ Suivi des maintenances préventives</li>
              <li>📊 Statistiques et analyses</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VGPSiteApp;
