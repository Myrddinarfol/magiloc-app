import React from 'react';

const LoadingState = ({ loadingMessage, retryCount }) => {
  return (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p className="loading-message">{loadingMessage}</p>
      {retryCount > 0 && (
        <div className="loading-info">
          <p>💡 Le serveur gratuit se met en veille après 15 minutes.</p>
          <p>Il redémarre automatiquement, merci de patienter...</p>
        </div>
      )}
    </div>
  );
};

export default LoadingState;
