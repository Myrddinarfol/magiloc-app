import React, { useEffect, useState } from 'react';
import './CALoadingModal.css';

const CALoadingModal = ({ isOpen, message = 'Calcul du CA en cours...', submessage = 'Cela peut prendre quelques secondes' }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      return;
    }

    // Animation de progression (simule un calcul)
    const interval = setInterval(() => {
      setProgress(prev => {
        // Croissance rapide au début, ralentit à la fin (jamais 100% jusqu'à completion réelle)
        if (prev < 30) return prev + Math.random() * 15;
        if (prev < 70) return prev + Math.random() * 8;
        return Math.min(prev + Math.random() * 3, 95);
      });
    }, 200);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ca-loading-overlay">
      <div className="ca-loading-modal">
        {/* Header */}
        <div className="ca-loading-header">
          <div className="ca-loading-spinner">
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        </div>

        {/* Content */}
        <div className="ca-loading-content">
          <h2 className="ca-loading-title">
            💰 {message}
          </h2>
          <p className="ca-loading-subtitle">{submessage}</p>
        </div>

        {/* Progress Bar */}
        <div className="ca-loading-progress-container">
          <div className="ca-loading-progress-bar">
            <div
              className="ca-loading-progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="ca-loading-progress-text">{Math.round(progress)}%</p>
        </div>

        {/* Footer Message */}
        <div className="ca-loading-footer">
          <p className="ca-loading-hint">
            ⏱️ Ne fermez pas cette fenêtre, veuillez patienter...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CALoadingModal;
