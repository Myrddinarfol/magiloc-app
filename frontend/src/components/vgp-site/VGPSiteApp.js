import React, { useState } from 'react';
import VGPSidebar from './VGPSidebar';
import VGPDashboardPage from './VGPDashboardPage';
import VGPInterventionsPage from './VGPInterventionsPage';
import VGPClientsPage from './VGPClientsPage';
import VGPMaterielPage from './VGPMaterielPage';
import VGPRapportsPage from './VGPRapportsPage';
import './VGPSiteApp.css';

const VGPSiteApp = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="vgp-content-container">
            <VGPDashboardPage />
          </div>
        );
      case 'interventions':
        return (
          <div className="vgp-content-container">
            <VGPInterventionsPage />
          </div>
        );
      case 'clients':
        return (
          <div className="vgp-content-container">
            <VGPClientsPage />
          </div>
        );
      case 'materiel':
        return (
          <div className="vgp-content-container">
            <VGPMaterielPage />
          </div>
        );
      case 'rapports':
        return (
          <div className="vgp-content-container">
            <VGPRapportsPage />
          </div>
        );
      default:
        return (
          <div className="vgp-content-container">
            <div className="vgp-construction-message">
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
          </div>
        );
    }
  };

  return (
    <div className="vgp-site-app">
      <VGPSidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="vgp-main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default VGPSiteApp;
