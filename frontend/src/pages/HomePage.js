import React from 'react';
import { useApp } from '../context/AppContext';
import FeedbackPanel from '../components/Feedback/FeedbackPanel';
import FeedbackButtonsGroup from '../components/Feedback/FeedbackButtonsGroup';
import './HomePage.css';

export default function HomePage() {
  const { switchApp } = useApp();

  return (
    <div className="home-page">
      <FeedbackPanel />
      <div className="home-container">
        {/* Logo et titre */}
        <div className="home-header">
          <div className="home-logo">✨</div>
          <h1>MagiApps</h1>
          <p className="home-subtitle">Gestion complète de votre matériel de location</p>
        </div>

        {/* Grille d'applications */}
        <div className="apps-grid">
          {/* MagiLoc */}
          <div
            className="app-card magiloc-card"
            onClick={() => switchApp('parc-loc')}
          >
            <div className="app-icon">📦</div>
            <h2 className="app-name">MagiLoc</h2>
            <p className="app-description">
              Gestion du parc de matériel en location
            </p>
            <ul className="app-features">
              <li>📋 Inventaire du parc</li>
              <li>💰 Tarification</li>
              <li>🔧 Maintenance</li>
              <li>📊 Tableaux de bord</li>
            </ul>
            <button className="app-btn">Accéder →</button>
          </div>

          {/* Magi VGP */}
          <div
            className="app-card magigvp-card"
            onClick={() => switchApp('vgp-site')}
          >
            <div className="app-icon">🔍</div>
            <h2 className="app-name">Magi VGP</h2>
            <p className="app-description">
              Visite générale périodique et interventions
            </p>
            <ul className="app-features">
              <li>📅 Planification d'interventions</li>
              <li>🎯 Exécution sur le terrain</li>
              <li>📋 Bons d'intervention</li>
              <li>📊 Planning calendrier</li>
            </ul>
            <button className="app-btn">Accéder →</button>
          </div>
        </div>

        {/* Footer */}
        <div className="home-footer">
          <p>v1.0.0 • Système de gestion intégré</p>
        </div>
      </div>
    </div>
  );
}
