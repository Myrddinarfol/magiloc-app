import React from 'react';
import VGPPageHeader from './VGPPageHeader';
import './VGPDashboardPage.css';

const VGPDashboardPage = () => {
  return (
    <div className="vgp-dashboard-page">
      <VGPPageHeader
        icon="📊"
        title="Tableau de Bord VGP"
        subtitle="VUE D'ENSEMBLE"
        description="Suivez les statistiques et la performance de vos interventions VGP"
      />

      <div className="vgp-dashboard-grid">
        <div className="vgp-dashboard-card">
          <div className="vgp-card-icon">📋</div>
          <div className="vgp-card-content">
            <h3>Interventions en Cours</h3>
            <p className="vgp-card-stat">--</p>
            <p className="vgp-card-subtitle">À venir</p>
          </div>
        </div>

        <div className="vgp-dashboard-card">
          <div className="vgp-card-icon">👥</div>
          <div className="vgp-card-content">
            <h3>Clients VGP</h3>
            <p className="vgp-card-stat">--</p>
            <p className="vgp-card-subtitle">À venir</p>
          </div>
        </div>

        <div className="vgp-dashboard-card">
          <div className="vgp-card-icon">📦</div>
          <div className="vgp-card-content">
            <h3>Équipements Gérés</h3>
            <p className="vgp-card-stat">--</p>
            <p className="vgp-card-subtitle">À venir</p>
          </div>
        </div>

        <div className="vgp-dashboard-card">
          <div className="vgp-card-icon">✅</div>
          <div className="vgp-card-content">
            <h3>Interventions Complétées</h3>
            <p className="vgp-card-stat">--</p>
            <p className="vgp-card-subtitle">À venir</p>
          </div>
        </div>
      </div>

      <div className="vgp-dashboard-placeholder">
        <div className="vgp-placeholder-icon">🚧</div>
        <h3>Dashboard en développement</h3>
        <p>Les statistiques et graphiques seront bientôt disponibles</p>
      </div>
    </div>
  );
};

export default VGPDashboardPage;
