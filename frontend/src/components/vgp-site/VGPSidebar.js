import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import './VGPSidebar.css';

const VGPSidebar = ({ currentPage, onNavigate }) => {
  const { resetAppSelection } = useApp();
  const { theme, setThemeMode } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleThemeChange = (newTheme) => {
    setThemeMode(newTheme);
    setShowSettings(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const handleMobileNavigate = (page) => {
    onNavigate(page);
    closeMobileMenu();
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className={`hamburger-menu ${isMobileOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay pour fermer la sidebar sur mobile */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
        onClick={closeMobileMenu}
      />

      <div className={`vgp-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="logo-container">
          <h1 className="logo">
            <span className="logo-magi">MAGI</span>
            <span className="logo-vgp">VGP</span>
          </h1>
          <div className="logo-actions">
            <button
              onClick={resetAppSelection}
              className="action-button"
              title="Retour au panneau d'accueil"
            >
              🏠
            </button>
            <button
              onClick={toggleFullscreen}
              className="action-button"
              title={isFullscreen ? 'Quitter le plein écran' : 'Mode plein écran'}
            >
              {isFullscreen ? '📥' : '📤'}
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="action-button"
              title="Paramètres"
            >
              ⚙️
            </button>
          </div>
        </div>

        <nav>
          <button
            onClick={() => handleMobileNavigate('dashboard')}
            className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">TABLEAU DE BORD</span>
          </button>

          <button
            onClick={() => handleMobileNavigate('interventions')}
            className={`nav-button ${currentPage === 'interventions' ? 'active' : ''}`}
          >
            <span className="nav-icon">🛠️</span>
            <span className="nav-text">INTERVENTIONS</span>
          </button>

          <button
            onClick={() => handleMobileNavigate('clients')}
            className={`nav-button ${currentPage === 'clients' ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">CLIENTS</span>
          </button>

          <button
            onClick={() => handleMobileNavigate('materiel')}
            className={`nav-button ${currentPage === 'materiel' ? 'active' : ''}`}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">MATÉRIEL</span>
          </button>

          <button
            onClick={() => handleMobileNavigate('rapports')}
            className={`nav-button ${currentPage === 'rapports' ? 'active' : ''}`}
          >
            <span className="nav-icon">📝</span>
            <span className="nav-text">RAPPORTS</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button
            onClick={resetAppSelection}
            className="logout-button"
          >
            🔄 Retour à la sélection
          </button>
        </div>

        {/* Modal Paramètres */}
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>⚙️ Paramètres</h2>
                <button className="modal-close" onClick={() => setShowSettings(false)}>✕</button>
              </div>
              <div className="modal-body">
                <div className="settings-section">
                  <h3>🎨 Thème de l'application</h3>
                  <div className="theme-options">
                    <button
                      className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <div className="theme-preview dark"></div>
                      <span>Mode Sombre</span>
                      {theme === 'dark' && <span className="check-icon">✓</span>}
                    </button>
                    <button
                      className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('light')}
                    >
                      <div className="theme-preview light"></div>
                      <span>Mode Clair</span>
                      {theme === 'light' && <span className="check-icon">✓</span>}
                    </button>
                  </div>
                </div>

                {/* Application Switcher */}
                <div className="settings-section">
                  <h3 className="settings-label">Application</h3>
                  <button
                    className="switch-app-button"
                    onClick={resetAppSelection}
                    title="Retourner à la sélection d'application"
                  >
                    🔄 Changer d'application
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default VGPSidebar;
