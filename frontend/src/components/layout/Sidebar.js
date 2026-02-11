import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEquipment } from '../../hooks/useEquipment';
import { useUI } from '../../hooks/useUI';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import GuidedTour from '../common/GuidedTour';

const Sidebar = () => {
  const { logout } = useAuth();
  const { stats } = useEquipment();
  const { currentPage, handleNavigate, setShowNotesHistory, expandedMenus, toggleMenu } = useUI();
  const { theme, toggleTheme, setThemeMode, isLightTheme } = useTheme();
  const { resetAppSelection } = useApp();

  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTour, setShowTour] = useState(false);
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
    handleNavigate(page);
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

      <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="logo-container">
        <h1 className="logo">
          <span className="logo-magi">MAGI</span>
          <span className="logo-loc">Loc</span>
        </h1>
        <div className="logo-actions">
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
          <button
            onClick={() => setShowTour(true)}
            className="action-button tour-button"
            title="Visite Guidée"
          >
            🎯
          </button>
        </div>
      </div>

      <nav>
        <button
          onClick={() => handleMobileNavigate('dashboard')}
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏠</span>
          <span className="nav-text">TABLEAU DE BORD</span>
        </button>

        <button
          onClick={() => handleMobileNavigate('sur-parc')}
          className={`nav-button ${currentPage === 'sur-parc' ? 'active' : ''}`}
        >
          <span className="nav-icon">✅</span>
          <span className="nav-text">SUR PARC</span>
          <span className="nav-badge">{stats.surParc}</span>
        </button>

        {/* LOCATION avec sous-menus */}
        <div className="nav-menu-section">
          <button
            onClick={() => toggleMenu('location')}
            className={`nav-button has-submenu ${currentPage.startsWith('location-') || currentPage === 'en-offre' ? 'active' : ''}`}
          >
            <span className="nav-icon">🚚</span>
            <span className="nav-text">LOCATION</span>
            <span className="nav-badge">{stats.enLocation + stats.enOffre}</span>
            <span className={`nav-arrow-bottom ${expandedMenus.location ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedMenus.location && (
            <div className="nav-submenu">
              <button
                onClick={() => handleMobileNavigate('en-offre')}
                className={`nav-sub-button ${currentPage === 'en-offre' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📋</span>
                <span className="nav-sub-text">Réservation</span>
                <span className="nav-badge">{stats.enOffre}</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('location-list')}
                className={`nav-sub-button ${currentPage === 'location-list' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📦</span>
                <span className="nav-sub-text">Locations en cours</span>
                <span className="nav-badge">{stats.enLocation}</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('location-planning')}
                className={`nav-sub-button ${currentPage === 'location-planning' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📅</span>
                <span className="nav-sub-text">Planning Location</span>
              </button>
            </div>
          )}
        </div>

        {/* MAINTENANCE avec sous-menus */}
        <div className="nav-menu-section">
          <button
            onClick={() => toggleMenu('maintenance')}
            className={`nav-button has-submenu ${currentPage.startsWith('maintenance-') ? 'active' : ''}`}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">MAINTENANCE</span>
            <span className="nav-badge">{stats.enMaintenance}</span>
            <span className={`nav-arrow-bottom ${expandedMenus.maintenance ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedMenus.maintenance && (
            <div className="nav-submenu">
              <button
                onClick={() => handleMobileNavigate('maintenance-dashboard')}
                className={`nav-sub-button ${currentPage === 'maintenance-dashboard' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📊</span>
                <span className="nav-sub-text">Dashboard Maintenance</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('maintenance-list')}
                className={`nav-sub-button ${currentPage === 'maintenance-list' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">🛠️</span>
                <span className="nav-sub-text">Matériels en Maintenance</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('maintenance-planning')}
                className={`nav-sub-button ${currentPage === 'maintenance-planning' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📆</span>
                <span className="nav-sub-text">Planning Maintenance</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('vgp-management')}
                className={`nav-sub-button ${currentPage === 'vgp-management' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">✅</span>
                <span className="nav-sub-text">VGP</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('spare-parts')}
                className={`nav-sub-button ${currentPage === 'spare-parts' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">🔩</span>
                <span className="nav-sub-text">Pièces Détachées</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-middle">
        {/* GESTION PARC avec sous-menus */}
        <div className="nav-menu-section">
          <button
            onClick={() => toggleMenu('gestion-parc')}
            className={`nav-button has-submenu ${currentPage === 'parc-loc' || currentPage === 'tarifs' || currentPage === 'analytics' ? 'active' : ''}`}
          >
            <span className="nav-icon">🛠️</span>
            <span className="nav-text">GESTION PARC</span>
            <span className={`nav-arrow-bottom ${expandedMenus['gestion-parc'] ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedMenus['gestion-parc'] && (
            <div className="nav-submenu">
              <button
                onClick={() => handleMobileNavigate('clients')}
                className={`nav-sub-button ${currentPage === 'clients' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">👥</span>
                <span className="nav-sub-text">Clients</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('parc-loc')}
                className={`nav-sub-button ${currentPage === 'parc-loc' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">🏪</span>
                <span className="nav-sub-text">Parc Loc</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('tarifs')}
                className={`nav-sub-button ${currentPage === 'tarifs' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">💰</span>
                <span className="nav-sub-text">Tarifs</span>
              </button>
              <button
                onClick={() => handleMobileNavigate('analytics')}
                className={`nav-sub-button ${currentPage === 'analytics' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📊</span>
                <span className="nav-sub-text">Analytics</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => { setShowNotesHistory(true); closeMobileMenu(); }}
          className="nav-button"
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">NOTES MAJ</span>
        </button>
      </div>

      <div className="sidebar-bottom">
        <button
          onClick={logout}
          className="logout-button"
        >
          🚪 Déconnexion
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
                  <button
                    className={`theme-option ${theme === 'anthracite' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('anthracite')}
                  >
                    <div className="theme-preview anthracite"></div>
                    <span>🪨 Mode Anthracite</span>
                    {theme === 'anthracite' && <span className="check-icon">✓</span>}
                  </button>
                  <button
                    className={`theme-option ${theme === 'marine' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('marine')}
                  >
                    <div className="theme-preview marine"></div>
                    <span>⚓ Mode Marine</span>
                    {theme === 'marine' && <span className="check-icon">✓</span>}
                  </button>
                  <button
                    className={`theme-option ${theme === 'forest' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('forest')}
                  >
                    <div className="theme-preview forest"></div>
                    <span>🌿 Mode Forêt</span>
                    {theme === 'forest' && <span className="check-icon">✓</span>}
                  </button>
                  <button
                    className={`theme-option ${theme === 'ruby' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('ruby')}
                  >
                    <div className="theme-preview ruby"></div>
                    <span>💎 Mode Rubis</span>
                    {theme === 'ruby' && <span className="check-icon">✓</span>}
                  </button>
                  <button
                    className={`theme-option ${theme === 'cyber' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('cyber')}
                  >
                    <div className="theme-preview cyber"></div>
                    <span>⚡ Mode Cyber</span>
                    {theme === 'cyber' && <span className="check-icon">✓</span>}
                  </button>
                  <button
                    className={`theme-option ${theme === 'cafe' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('cafe')}
                  >
                    <div className="theme-preview cafe"></div>
                    <span>☕ Mode Café</span>
                    {theme === 'cafe' && <span className="check-icon">✓</span>}
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

      {/* Guided Tour */}
      <GuidedTour isActive={showTour} onClose={() => setShowTour(false)} />
    </div>
    </>
  );
};

export default Sidebar;
