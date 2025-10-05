import React from 'react';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';

const PlanningPage = () => {
  const { setCurrentPage } = useUI();

  return (
    <div>
      <PageHeader
        icon="📅"
        title="Planning Location"
        subtitle="CALENDRIER"
        description="Vue chronologique des locations"
      />
      <div className="planning-placeholder">
        <h3>Planning interactif</h3>
        <p>Cette fonctionnalité sera développée dans les prochaines étapes</p>
        <button
          onClick={() => setCurrentPage('en-location')}
          className="btn btn-primary"
        >
          Voir les locations en cours
        </button>
      </div>
    </div>
  );
};

export default PlanningPage;
