import React from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';

const DashboardPage = () => {
  const { stats, equipmentData } = useEquipment();
  const { setCurrentPage } = useUI();

  return (
    <div className="dashboard">
      <h1>Tableau de bord - Parc Location COUERON</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total Équipements</div>
        </div>

        <div className="stat-card">
          <div className="stat-number primary">{stats.enLocation}</div>
          <div className="stat-label">En Location</div>
          <div className="stat-percentage primary">{stats.total > 0 ? ((stats.enLocation/stats.total)*100).toFixed(1) : 0}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-number success">{stats.surParc}</div>
          <div className="stat-label">Disponibles</div>
          <div className="stat-percentage success">{stats.total > 0 ? ((stats.surParc/stats.total)*100).toFixed(1) : 0}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-number danger">{stats.enMaintenance}</div>
          <div className="stat-label">En Maintenance</div>
          <div className="stat-percentage danger">{stats.total > 0 ? ((stats.enMaintenance/stats.total)*100).toFixed(1) : 0}%</div>
        </div>

        <div className="stat-card">
          <div className="stat-number warning">{stats.enOffre}</div>
          <div className="stat-label">En Réservation</div>
          <div className="stat-percentage warning">{stats.total > 0 ? ((stats.enOffre/stats.total)*100).toFixed(1) : 0}%</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card alerts">
          <h3>⚠️ Alertes</h3>
          <div className="alert-item">
            <span className="alert-label">Retards de retour: </span>
            {equipmentData.filter(eq => eq.statut === 'En Location' && eq.finLocationTheorique).length}
          </div>
          <div className="alert-item">
            <span className="alert-label">VGP à prévoir: </span>
            {equipmentData.filter(eq => eq.prochainVGP).length}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>🚀 Actions rapides</h3>
          <div className="actions-grid">
            <button
              onClick={() => setCurrentPage('en-location')}
              className="btn btn-primary"
            >
              Voir les locations en cours
            </button>
            <button
              onClick={() => setCurrentPage('maintenance')}
              className="btn btn-danger"
            >
              Gérer la maintenance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
