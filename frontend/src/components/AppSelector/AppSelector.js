import React from 'react';
import { useApp } from '../../context/AppContext';
import './AppSelector.css';

const AppSelector = () => {
  const { switchApp } = useApp();

  return (
    <div className="app-selector-container">
      <div className="app-selector-content">
        {/* Logo */}
        <div className="app-selector-header">
          <h1 className="app-selector-logo">
            <span className="logo-magi">MAGI</span>
            <span className="logo-apps">-Apps</span>
          </h1>
        </div>

        {/* App Cards */}
        <div className="app-cards-container">
          {/* MAGI-LOC Card */}
          <button
            className="app-card parc-loc-card"
            onClick={() => switchApp('parc-loc')}
          >
            <div className="card-icon">📦</div>
            <div className="card-content">
              <h2 className="card-title">MAGI-LOC</h2>
              <p className="card-description">GESTION DU PARC LOCATION</p>
            </div>
            <div className="card-arrow">
              <svg
                className="arrow-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>

          {/* MAGI-VGP Card */}
          <button
            className="app-card vgp-site-card"
            onClick={() => switchApp('vgp-site')}
          >
            <div className="card-icon">📋</div>
            <div className="card-content">
              <h2 className="card-title">MAGI-VGP</h2>
              <p className="card-description">GESTION DES INTERVENTIONS DE CONTROLE VGP SUR SITE CLIENT</p>
            </div>
            <div className="card-arrow">
              <svg
                className="arrow-svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AppSelector;
