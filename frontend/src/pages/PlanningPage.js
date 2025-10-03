import React from 'react';
import { useUI } from '../hooks/useUI';

const PlanningPage = () => {
  const { setCurrentPage } = useUI();

  return (
    <div>
      <h1 className="page-title">Planning des locations</h1>
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
