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
      </div>
    </div>
  );
};

export default AnalyticsPage;
