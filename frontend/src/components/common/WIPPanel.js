import React from 'react';

const WIPPanel = () => {
  return (
    <div className="wip-panel">
      <div className="wip-header">
        <span className="wip-icon">🚧</span>
        <h2>Fonctionnalité en développement</h2>
      </div>
      <div className="wip-content">
        <p className="wip-message">
          Cette section est actuellement en cours de développement.
        </p>
      </div>
    </div>
  );
};

export default WIPPanel;
