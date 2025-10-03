import React from 'react';

const LoadingState = ({ loadingMessage, retryCount }) => {
  return (
    <div className="loading-state">
      {/* Skeleton Loader moderne */}
      <div className="skeleton-container">
        <div className="skeleton-header">
          <div className="skeleton-title"></div>
          <div className="skeleton-subtitle"></div>
        </div>

        <div className="skeleton-stats">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-stat-card">
              <div className="skeleton-number"></div>
              <div className="skeleton-label"></div>
            </div>
          ))}
        </div>

        <div className="skeleton-table">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton-row">
              <div className="skeleton-cell"></div>
              <div className="skeleton-cell"></div>
              <div className="skeleton-cell"></div>
              <div className="skeleton-cell"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Message de chargement */}
      <div className="loading-overlay">
        <div className="loading-spinner"></div>
        <p className="loading-message">{loadingMessage}</p>
        {retryCount > 0 && (
          <div className="loading-info">
            <p>💡 Le serveur gratuit se met en veille après 15 minutes.</p>
            <p>Il redémarre automatiquement, merci de patienter...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .skeleton-container {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .skeleton-header {
          margin-bottom: 30px;
        }

        .skeleton-title {
          height: 40px;
          width: 400px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .skeleton-subtitle {
          height: 20px;
          width: 250px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 4px;
        }

        .skeleton-stats {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .skeleton-stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .skeleton-number {
          height: 50px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 8px;
          margin-bottom: 10px;
        }

        .skeleton-label {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 4px;
        }

        .skeleton-table {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .skeleton-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 15px;
          padding: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .skeleton-cell {
          height: 20px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s ease-in-out infinite;
          border-radius: 4px;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .loading-overlay {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          text-align: center;
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
