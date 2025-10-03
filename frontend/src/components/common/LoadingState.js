import React from 'react';
import './LoadingState.css';

const LoadingState = ({ loadingMessage, retryCount }) => {
  return (
    <div className="loading-state-overlay">
      <div className="loading-content">
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
        </div>
        <p className="loading-message">{loadingMessage || '⏳ Chargement des données...'}</p>
        {retryCount > 0 && (
          <div className="loading-info">
            <p>💡 Le serveur gratuit se met en veille après 15 minutes.</p>
            <p>Il redémarre automatiquement, merci de patienter...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
