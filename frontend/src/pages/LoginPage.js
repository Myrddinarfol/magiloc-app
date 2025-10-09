import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showTourModal, setShowTourModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      setError('');
      // Check if user has seen the tour before
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour) {
        setShowTourModal(true);
      }
    } else {
      setError('Mot de passe incorrect');
      setPassword('');
    }
  };

  const handleTourChoice = (startTour) => {
    localStorage.setItem('hasSeenTour', 'true');
    setShowTourModal(false);
    if (startTour && onLoginSuccess) {
      onLoginSuccess(true); // Pass true to indicate tour should start
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-modal">
        <div className="login-header">
          <h2>🔐 Authentification MagiLoc</h2>
          <p>Accès sécurisé au système de gestion</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="password">Mot de passe :</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="Entrez le mot de passe"
              autoFocus
            />
            {error && (
              <div className="error-message">{error}</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg">
            Se connecter
          </button>
        </form>

        <div className="login-footer">
          <p>© 2025 MagiLoc - Gestion Parc Location COUERON</p>
        </div>
      </div>

      {/* Modal Visite Guidée */}
      {showTourModal && (
        <div className="modal-overlay tour-prompt-overlay">
          <div className="modal-content tour-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tour-prompt-header">
              <span className="tour-prompt-icon">🎯</span>
              <h2>Découvrez MagiLoc !</h2>
            </div>
            <div className="tour-prompt-body">
              <p>C'est votre première connexion !</p>
              <p>Souhaitez-vous démarrer une <strong>visite guidée</strong> pour découvrir toutes les fonctionnalités de l'application ?</p>
              <div className="tour-prompt-benefits">
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Découverte complète de l'interface</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Explication des fonctionnalités principales</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">✓</span>
                  <span>Prise en main rapide et efficace</span>
                </div>
              </div>
            </div>
            <div className="tour-prompt-actions">
              <button
                className="tour-prompt-btn tour-prompt-skip"
                onClick={() => handleTourChoice(false)}
              >
                Plus tard
              </button>
              <button
                className="tour-prompt-btn tour-prompt-start"
                onClick={() => handleTourChoice(true)}
              >
                🚀 Démarrer la visite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
