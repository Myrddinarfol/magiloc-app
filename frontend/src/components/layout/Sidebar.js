import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEquipment } from '../../hooks/useEquipment';
import { useUI } from '../../hooks/useUI';

const Sidebar = () => {
  const { logout } = useAuth();
  const { stats } = useEquipment();
  const { currentPage, handleNavigate, setShowNotesHistory } = useUI();

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

        <button
          onClick={() => handleNavigate('en-offre')}
          className={`nav-button ${currentPage === 'en-offre' ? 'active' : ''}`}
        >
          <span className="nav-icon">💰</span>
          <span className="nav-text">RÉSERVATION</span>
          <span className="nav-badge">{stats.enOffre}</span>
        </button>

        <button
          onClick={() => handleNavigate('en-location')}
          className={`nav-button ${currentPage === 'en-location' ? 'active' : ''}`}
        >
          <span className="nav-icon">🚚</span>
          <span className="nav-text">LOCATION</span>
          <span className="nav-badge">{stats.enLocation}</span>
        </button>

        <button
          onClick={() => handleNavigate('maintenance')}
          className={`nav-button ${currentPage === 'maintenance' ? 'active' : ''}`}
        >
          <span className="nav-icon">🔧</span>
          <span className="nav-text">MAINTENANCE</span>
          <span className="nav-badge">{stats.enMaintenance}</span>
        </button>

        <button
          onClick={() => handleNavigate('planning')}
          className={`nav-button ${currentPage === 'planning' ? 'active' : ''}`}
        >
          <span className="nav-icon">📅</span>
          <span className="nav-text">PLANNING</span>
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
      </nav>

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
