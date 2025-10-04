import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEquipment } from '../../hooks/useEquipment';
import { useUI } from '../../hooks/useUI';

const Sidebar = () => {
  const { logout } = useAuth();
  const { stats } = useEquipment();
  const { currentPage, handleNavigate, setShowNotesHistory, expandedMenus, toggleMenu } = useUI();

  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo">
          <span className="logo-magi">MAGI</span>
          <span className="logo-loc">Loc</span>
        </h1>
      </div>

      <nav>
        <button
          onClick={() => handleNavigate('dashboard')}
          className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">TABLEAU DE BORD</span>
        </button>

        <button
          onClick={() => handleNavigate('sur-parc')}
          className={`nav-button ${currentPage === 'sur-parc' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">SUR PARC</span>
          <span className="nav-badge">{stats.surParc}</span>
        </button>

        {/* LOCATION avec sous-menus */}
        <div className="nav-menu-section">
          <button
            onClick={() => toggleMenu('location')}
            className={`nav-button ${currentPage.startsWith('location-') || currentPage === 'en-offre' ? 'active' : ''}`}
          >
            <span className="nav-icon">🚚</span>
            <span className="nav-text">LOCATION</span>
            <span className="nav-badge">{stats.enLocation}</span>
            <span className={`nav-arrow ${expandedMenus.location ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedMenus.location && (
            <div className="nav-submenu">
              <button
                onClick={() => handleNavigate('en-offre')}
                className={`nav-sub-button ${currentPage === 'en-offre' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">💰</span>
                <span className="nav-sub-text">Réservation</span>
                <span className="nav-badge">{stats.enOffre}</span>
              </button>
              <button
                onClick={() => handleNavigate('location-list')}
                className={`nav-sub-button ${currentPage === 'location-list' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📋</span>
                <span className="nav-sub-text">Locations en cours</span>
              </button>
              <button
                onClick={() => handleNavigate('location-planning')}
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
            className={`nav-button ${currentPage.startsWith('maintenance-') ? 'active' : ''}`}
          >
            <span className="nav-icon">🔧</span>
            <span className="nav-text">MAINTENANCE</span>
            <span className="nav-badge">{stats.enMaintenance}</span>
            <span className={`nav-arrow ${expandedMenus.maintenance ? 'expanded' : ''}`}>▼</span>
          </button>
          {expandedMenus.maintenance && (
            <div className="nav-submenu">
              <button
                onClick={() => handleNavigate('maintenance-dashboard')}
                className={`nav-sub-button ${currentPage === 'maintenance-dashboard' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📊</span>
                <span className="nav-sub-text">Dashboard Maintenance</span>
              </button>
              <button
                onClick={() => handleNavigate('maintenance-list')}
                className={`nav-sub-button ${currentPage === 'maintenance-list' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">🔨</span>
                <span className="nav-sub-text">Matériels en Maintenance</span>
              </button>
              <button
                onClick={() => handleNavigate('maintenance-planning')}
                className={`nav-sub-button ${currentPage === 'maintenance-planning' ? 'active' : ''}`}
              >
                <span className="nav-sub-icon">📅</span>
                <span className="nav-sub-text">Planning Maintenance</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-middle">
        <button
          onClick={() => handleNavigate('analytics')}
          className={`nav-button ${currentPage === 'analytics' ? 'active' : ''}`}
        >
          <span className="nav-icon">📈</span>
          <span className="nav-text">ANALYTICS</span>
        </button>

        <button
          onClick={() => handleNavigate('parc-loc')}
          className={`nav-button ${currentPage === 'parc-loc' ? 'active' : ''}`}
        >
          <span className="nav-icon">🏭</span>
          <span className="nav-text">PARC LOC</span>
        </button>

        <button
          onClick={() => setShowNotesHistory(true)}
          className="nav-button"
        >
          <span className="nav-icon">📋</span>
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
    </div>
  );
};

export default Sidebar;
