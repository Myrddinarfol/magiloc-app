import React from 'react';
import PageHeader from '../components/common/PageHeader';
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

      {/* Capsule de construction */}
      <div className="construction-capsule-wrapper">
        <div className="construction-capsule alert-capsule alert-info">
          <div className="alert-capsule-icon">
            <span className="icon-animated">🔨</span>
          </div>
          <div className="alert-capsule-content">
            <div className="alert-capsule-number">En Construction</div>
            <div className="alert-capsule-label">
              Les modules analytiques seront ajoutés<br/>progressivement
            </div>
          </div>
          <div className="alert-badge-square" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: '2px solid #f59e0b' }}>
            ⚙️
          </div>
        </div>
      </div>

      {/* Les modules d'analytics seront ajoutés ici petit à petit */}
      <div className="analytics-container">
        {/* Modules seront importés et intégrés ici */}
      </div>
    </div>
  );
};

export default AnalyticsPage;
