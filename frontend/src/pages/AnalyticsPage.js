import React from 'react';
import PageHeader from '../components/common/PageHeader';
import CAModule from '../components/analytics/CAModule';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  return (
    <div className="analytics-page">
      <PageHeader
        icon="📈"
        title="Analytics & Performance"
        subtitle="ANALYSE DU PARC"
        description="Analyse de la performance et optimisation de votre parc"
      />

      {/* Modules d'analytics */}
      <div className="analytics-container">
        {/* Module CA */}
        <section className="analytics-module">
          <CAModule />
        </section>

        {/* Autres modules en construction */}
        <div className="construction-capsule-wrapper">
          <div className="construction-capsule alert-capsule alert-info">
            <div className="alert-capsule-icon">
              <span className="icon-animated">🔨</span>
            </div>
            <div className="alert-capsule-content">
              <div className="alert-capsule-number">Autres modules en construction</div>
              <div className="alert-capsule-label">
                Répartition par produit, taux utilisation, clients premium<br/>seront ajoutés progressivement
              </div>
            </div>
            <div className="alert-badge-square" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '2px solid #f59e0b' }}>
              ⚙️
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
