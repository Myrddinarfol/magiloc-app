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
            <span className="logo-magi">MAGI</span><span className="logo-loc">Loc</span>
          </h1>
          <p className="app-selector-subtitle">Sélectionner une application</p>
        </div>

        {/* App Cards */}
        <div className="app-cards-container">
          {/* PARC LOC Card */}
          <button
            className="app-card parc-loc-card"
            onClick={() => switchApp('parc-loc')}
          >
            <div className="card-icon">🏗️</div>
            <h2 className="card-title">PARC LOC</h2>
            <p className="card-subtitle">Gestion du parc de location</p>
            <p className="card-description">
              Équipements, locations, maintenance, pièces détachées et bien plus
            </p>
            <div className="card-arrow">→</div>
          </button>

          {/* VGP SITE Card */}
          <button
            className="app-card vgp-site-card"
            onClick={() => switchApp('vgp-site')}
          >
            <div className="card-icon">🔧</div>
            <h2 className="card-title">VGP SITE</h2>
            <p className="card-subtitle">Interventions sur site client</p>
            <p className="card-description">
              Gestion des interventions et parcs matériel des clients
            </p>
            <div className="card-arrow">→</div>
          </button>
        </div>

        {/* Footer */}
        <div className="app-selector-footer">
          <p>Vous pourrez changer d'application via les paramètres à tout moment</p>
        </div>
      </div>
    </div>
  );
};

export default AppSelector;
