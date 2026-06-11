import React, { useMemo } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';
import './DashboardPage.css';

const DashboardPage = () => {
  const { stats, equipmentData } = useEquipment();
  const { setCurrentPage, setEquipmentFilter, handleNavigate } = useUI();

  // Calcul des alertes
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Retards de retours de location
    const lateReturns = equipmentData.filter(eq => {
      if (eq.statut === 'En Location' && eq.finLocationTheorique) {
        // Parser date au format DD/MM/YYYY ou YYYY-MM-DD
        let returnDate;
        if (eq.finLocationTheorique.includes('/')) {
          const [day, month, year] = eq.finLocationTheorique.split('/');
          returnDate = new Date(year, month - 1, day);
        } else {
          returnDate = new Date(eq.finLocationTheorique);
        }
        returnDate.setHours(0, 0, 0, 0);
        return returnDate < today;
      }
      return false;
    });

    // 2. VGP en retard
    const lateVGP = equipmentData.filter(eq => {
      if (eq.prochainVGP) {
        const [day, month, year] = eq.prochainVGP.split('/');
        const vgpDate = new Date(year, month - 1, day);
        vgpDate.setHours(0, 0, 0, 0);
        return vgpDate < today;
      }
      return false;
    });

    // 3. VGP à prévoir (< 30 jours mais pas encore en retard)
    const upcomingVGP = equipmentData.filter(eq => {
      if (eq.prochainVGP) {
        const [day, month, year] = eq.prochainVGP.split('/');
        const vgpDate = new Date(year, month - 1, day);
        vgpDate.setHours(0, 0, 0, 0);
        const in30Days = new Date(today);
        in30Days.setDate(today.getDate() + 30);
        return vgpDate >= today && vgpDate <= in30Days;
      }
      return false;
    });

    // 4. Réservations dépassées (date début < aujourd'hui mais toujours en réservation)
    const overdueReservations = equipmentData.filter(eq => {
      if (eq.statut === 'En Réservation' && eq.debutLocation) {
        // Parser date au format DD/MM/YYYY ou YYYY-MM-DD
        let startDate;
        if (eq.debutLocation.includes('/')) {
          const [day, month, year] = eq.debutLocation.split('/');
          startDate = new Date(year, month - 1, day);
        } else {
          startDate = new Date(eq.debutLocation);
        }
        startDate.setHours(0, 0, 0, 0);
        return startDate < today;
      }
      return false;
    });

    // 5. Matériels en maintenance
    const inMaintenance = equipmentData.filter(eq => eq.statut === 'En Maintenance');

    return {
      lateReturns,
      lateVGP,
      upcomingVGP,
      overdueReservations,
      inMaintenance
    };
  }, [equipmentData]);

  // Calcul des ruptures de disponibilité (matériels avec 0 ou 1 exemplaire disponible)
  const stockAlerts = useMemo(() => {
    // Grouper par modèle
    const modelGroups = {};

    equipmentData.forEach(eq => {
      const key = `${eq.designation} ${eq.cmu}`.trim();
      if (!modelGroups[key]) {
        modelGroups[key] = {
          model: key,
          total: 0,
          available: 0
        };
      }
      modelGroups[key].total++;
      if (eq.statut === 'Sur Parc') {
        modelGroups[key].available++;
      }
    });

    // Filtrer pour ne garder que ceux avec 0 disponible (rupture de stock)
    return Object.values(modelGroups)
      .filter(g => g.available === 0)
      .sort((a, b) => b.total - a.total); // Trier par total décroissant
  }, [equipmentData]);

  // Matériels phares - Disponibilité
  const featuredEquipment = useMemo(() => {
    const featured = [
      {
        title: 'TR30S / LM300+',
        subtitle: 'Treuil 300kg',
        models: ['TR30S', 'TR30', 'LM300+', 'LM 300+', 'LM300'],
        icon: '⚡',
        color: '#f59e0b'
      },
      {
        title: 'TR50 / LM500+',
        subtitle: 'Treuil 500kg',
        models: ['TR50', 'LM500+', 'LM 500+', 'LM500'],
        icon: '⚡',
        color: '#dc2626'
      },
      {
        title: 'TE3000',
        subtitle: 'Treuil électrique 3000kg',
        models: ['TE3000', 'TE 3000'],
        icon: '⚡',
        color: '#8b5cf6'
      },
      {
        title: 'TE1600',
        subtitle: 'Treuil électrique 1600kg',
        models: ['TE1600', 'TE 1600'],
        icon: '⚡',
        color: '#06b6d4'
      }
    ];

    return featured.map(item => {
      // Compter tous les équipements de ce modèle dans PARC LOC
      const allEquipment = equipmentData.filter(eq => {
        if (!eq.modele) return false;
        const modeleUpper = eq.modele.toUpperCase().trim();
        return item.models.some(model => {
          const modelUpper = model.toUpperCase().trim();
          // Match exact ou contient le modèle
          return modeleUpper === modelUpper || modeleUpper.includes(modelUpper);
        });
      });

      // Compter ceux qui sont disponibles (Sur Parc)
      const available = allEquipment.filter(eq => eq.statut === 'Sur Parc');

      // Total = nombre total d'équipements de ce modèle dans le parc
      const total = allEquipment.length;
      const availableCount = available.length;
      const percentage = total > 0 ? ((availableCount / total) * 100).toFixed(0) : 0;

      let status = 'success';
      let statusIcon = '🟢';
      if (percentage < 20) {
        status = 'danger';
        statusIcon = '🔴';
      } else if (percentage < 50) {
        status = 'warning';
        statusIcon = '🟡';
      }

      return {
        ...item,
        total,
        available: availableCount,
        percentage,
        status,
        statusIcon
      };
    });
  }, [equipmentData]);

  // Fonction pour filtrer et naviguer vers les matériels phares
  const handleFeaturedClick = (models) => {
    setEquipmentFilter({ models });
    setCurrentPage('sur-parc');
  };

  return (
    <div className="dashboard">
      <PageHeader
        icon="🏠"
        title="Tableau de bord"
        subtitle="PARC LOCATION COUERON"
        description="Vue d'ensemble de votre parc de matériel et des alertes en cours"
      />

      {/* Section Stats + Matériels Phares */}
      <div className="dashboard-top-section">
        {/* Statistiques condensées */}
        <div className="stats-compact">
          <div
            className="stat-compact-card clickable"
            onClick={() => handleNavigate('parc-loc')}
            data-tooltip="Voir tous les équipements"
          >
            <div className="stat-compact-left">
              <div className="stat-compact-icon">Σ</div>
              <div className="stat-compact-label">Total</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number">{stats.total}</div>
            </div>
          </div>

          <div
            className="stat-compact-card clickable"
            onClick={() => handleNavigate('location-list')}
            data-tooltip="Voir les locations en cours"
          >
            <div className="stat-compact-left">
              <div className="stat-compact-icon">🚚</div>
              <div className="stat-compact-label primary">Location</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number primary">{stats.enLocation}</div>
              <div className="stat-compact-percentage primary">{stats.total > 0 ? ((stats.enLocation/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div
            className="stat-compact-card clickable"
            onClick={() => handleNavigate('sur-parc')}
            data-tooltip="Voir les équipements disponibles"
          >
            <div className="stat-compact-left">
              <div className="stat-compact-icon">✅</div>
              <div className="stat-compact-label success">Disponibles</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number success">{stats.surParc}</div>
              <div className="stat-compact-percentage success">{stats.total > 0 ? ((stats.surParc/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div
            className="stat-compact-card clickable"
            onClick={() => handleNavigate('maintenance-list')}
            data-tooltip="Voir les équipements en maintenance"
          >
            <div className="stat-compact-left">
              <div className="stat-compact-icon">🔧</div>
              <div className="stat-compact-label danger">Maintenance</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number danger">{stats.enMaintenance}</div>
              <div className="stat-compact-percentage danger">{stats.total > 0 ? ((stats.enMaintenance/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div
            className="stat-compact-card clickable"
            onClick={() => handleNavigate('en-offre')}
            data-tooltip="Voir les réservations"
          >
            <div className="stat-compact-left">
              <div className="stat-compact-icon">📋</div>
              <div className="stat-compact-label warning">Réservation</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number warning">{stats.enOffre}</div>
              <div className="stat-compact-percentage warning">{stats.total > 0 ? ((stats.enOffre/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>
        </div>

        {/* Matériels Phares */}
        <div className="featured-equipment">
          <h3>🔥 Matériels Phares</h3>
          <p className="featured-subtitle">Équipements les plus demandés</p>
          <div className="featured-list">
            {featuredEquipment.map((item, index) => (
              <div
                key={index}
                className={`featured-item featured-${item.status}`}
                onClick={() => handleFeaturedClick(item.models)}
              >
                <div className="featured-header">
                  <span className="featured-icon">{item.icon}</span>
                  <div className="featured-info">
                    <div className="featured-name">{item.title}</div>
                    <div className="featured-models">{item.subtitle}</div>
                  </div>
                </div>
                <div className="featured-stats">
                  <div className="featured-availability">
                    <span className="featured-status-icon">{item.statusIcon}</span>
                    <span className="featured-count">{item.available}/{item.total}</span>
                    <span className="featured-label">disponibles</span>
                  </div>
                  <div className="featured-gauge">
                    <div className="featured-gauge-bar" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
                  </div>
                  <div className="featured-percentage">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Capsules d'Alertes */}
      <div className="alerts-section">
        <h2>⚠️ Alertes</h2>
        <div className="alerts-grid">
          {/* Alerte 1: Réservations dépassées */}
          <div
            className={`alert-capsule clickable ${alerts.overdueReservations.length > 0 ? 'alert-critical' : ''}`}
            onClick={() => handleNavigate('en-offre')}
            data-tooltip="Voir les réservations"
          >
            <div className="alert-capsule-icon">
              <span className="icon-animated">📅</span>
            </div>
            <div className="alert-capsule-content">
              <div className="alert-capsule-number">{alerts.overdueReservations.length}</div>
              <div className="alert-capsule-label">Réservations<br/>Dépassées</div>
            </div>
            {alerts.overdueReservations.length > 0 ? (
              <div className="alert-badge-round alert-badge-red pulse">!</div>
            ) : (
              <div className="alert-badge-square alert-badge-green">✓</div>
            )}
          </div>

          {/* Alerte 2: Retards de retours de location */}
          <div
            className={`alert-capsule clickable ${alerts.lateReturns.length > 0 ? 'alert-critical' : ''}`}
            onClick={() => handleNavigate('location-list')}
            data-tooltip="Voir les locations en cours"
          >
            <div className="alert-capsule-icon">
              <span className="icon-animated">⏱️</span>
            </div>
            <div className="alert-capsule-content">
              <div className="alert-capsule-number">{alerts.lateReturns.length}</div>
              <div className="alert-capsule-label">Retards Retours<br/>Locations</div>
            </div>
            {alerts.lateReturns.length > 0 ? (
              <div className="alert-badge-round alert-badge-red pulse">!</div>
            ) : (
              <div className="alert-badge-square alert-badge-green">✓</div>
            )}
          </div>

          {/* Alerte 3: VGP en retard + à venir */}
          <div
            className={`alert-capsule clickable ${alerts.lateVGP.length > 0 ? 'alert-critical' : (alerts.upcomingVGP.length > 0 ? 'alert-warning' : '')}`}
            onClick={() => handleNavigate('vgp-management')}
            data-tooltip="Voir la gestion des VGP"
          >
            <div className="alert-capsule-icon">
              <span className="icon-animated">🔔</span>
            </div>
            <div className="alert-capsule-content">
              <div className="alert-capsule-number">
                {alerts.lateVGP.length > 0 && <span style={{color: '#dc2626', fontWeight: 'bold'}}>{alerts.lateVGP.length}</span>}
                {alerts.lateVGP.length > 0 && alerts.upcomingVGP.length > 0 && ' + '}
                {alerts.upcomingVGP.length > 0 && <span style={{color: '#f59e0b', fontWeight: 'bold'}}>{alerts.upcomingVGP.length}</span>}
                {alerts.lateVGP.length === 0 && alerts.upcomingVGP.length === 0 && '0'}
              </div>
              <div className="alert-capsule-label">VGP Retards<br/>{'<'} 30 jours</div>
            </div>
            {alerts.lateVGP.length > 0 ? (
              <div className="alert-badge-round alert-badge-red pulse">!</div>
            ) : alerts.upcomingVGP.length > 0 ? (
              <div className="alert-badge-round alert-badge-orange pulse">!</div>
            ) : (
              <div className="alert-badge-square alert-badge-green">✓</div>
            )}
          </div>

          {/* Alerte 4: Maintenances en cours */}
          <div
            className={`alert-capsule clickable ${alerts.inMaintenance.length > 0 ? 'alert-critical' : ''}`}
            onClick={() => handleNavigate('maintenance-list')}
            data-tooltip="Voir les matériels en maintenance"
          >
            <div className="alert-capsule-icon">
              <span className="icon-animated wrench-spin">🔧</span>
            </div>
            <div className="alert-capsule-content">
              <div className="alert-capsule-number">{alerts.inMaintenance.length}</div>
              <div className="alert-capsule-label">Matériels en<br/>Maintenance</div>
            </div>
            {alerts.inMaintenance.length > 0 ? (
              <div className="alert-badge-round alert-badge-red pulse">!</div>
            ) : (
              <div className="alert-badge-square alert-badge-green">✓</div>
            )}
          </div>
        </div>
      </div>

      {/* Panneau Ruptures de Stock */}
      <div className="dashboard-section">
        <div className="ruptures-panel">
          <h2>📦 Ruptures de Disponibilité</h2>
          <p className="ruptures-subtitle">Matériels avec 0 disponible sur parc</p>
          <div className="ruptures-grid">
            {stockAlerts.length === 0 ? (
              <div className="ruptures-empty">
                <span className="ruptures-empty-icon">✅</span>
                <p>Aucune alerte de disponibilité</p>
              </div>
            ) : (
              stockAlerts.map((item, index) => (
                <div key={index} className={`rupture-item rupture-level-${item.available}`}>
                  <div className="rupture-icon">
                    {item.available === 0 ? '🔴' : '🟠'}
                  </div>
                  <div className="rupture-info">
                    <div className="rupture-model">{item.model}</div>
                    <div className="rupture-stock">
                      <span className="rupture-available">{item.available}</span> / {item.total} disponible{item.available > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="rupture-badge">
                    {item.available === 0 ? 'RUPTURE' : 'CRITIQUE'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
