import React, { useMemo, useState, useEffect } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';
import FeaturedEquipmentCustomizer from '../components/FeaturedEquipmentCustomizer';
import { getTopRentalModels, DEFAULT_FEATURED_MODELS } from '../utils/featuredEquipmentUtils';
import './DashboardPage.css';

const DashboardPage = () => {
  const { stats, equipmentData } = useEquipment();
  const { setCurrentPage, setEquipmentFilter, handleNavigate } = useUI();
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [selectedFeaturedModels, setSelectedFeaturedModels] = useState(() => {
    // Charger depuis localStorage ou utiliser les defaults
    const saved = localStorage.getItem('featuredEquipmentModels');
    return saved ? JSON.parse(saved) : DEFAULT_FEATURED_MODELS;
  });

  // Sauvegarder les matériels sélectionnés
  const handleSaveFeatured = (models) => {
    setSelectedFeaturedModels(models);
    localStorage.setItem('featuredEquipmentModels', JSON.stringify(models));
  };

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
    // Tous les modèles disponibles avec leurs informations
    const allAvailableModels = {};

    equipmentData.forEach(eq => {
      const modelUpper = eq.modele?.toUpperCase().trim();
      if (modelUpper && !allAvailableModels[modelUpper]) {
        allAvailableModels[modelUpper] = {
          title: eq.designation || modelUpper,
          subtitle: modelUpper,
          models: [modelUpper],
          icon: '⚡',
          cmu: eq.cmu || '',
          longueur: eq.longueur || ''
        };
      }
    });

    // Filtrer pour ne garder que les modèles sélectionnés
    return selectedFeaturedModels
      .map(modelName => {
        const modelUpper = modelName.toUpperCase().trim();
        const itemInfo = allAvailableModels[modelUpper] || {
          title: modelUpper,
          subtitle: modelUpper,
          models: [modelUpper],
          icon: '⚡'
        };

        // Compter les équipements pour ce modèle
        const allEquipment = equipmentData.filter(eq => {
          if (!eq.modele) return false;
          const eqModelUpper = eq.modele.toUpperCase().trim();
          return itemInfo.models.some(model => {
            const m = model.toUpperCase().trim();
            return eqModelUpper === m || eqModelUpper.includes(m);
          });
        });

        const available = allEquipment.filter(eq => eq.statut === 'Sur Parc');
        const total = allEquipment.length;
        const percentage = total > 0 ? ((available.length / total) * 100).toFixed(0) : 0;

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
          ...itemInfo,
          total,
          available: available.length,
          percentage,
          status,
          statusIcon
        };
      });
  }, [equipmentData, selectedFeaturedModels]);

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
          <div className="featured-equipment-header">
            <div>
              <h3>🔥 Matériels Phares</h3>
              <p className="featured-subtitle">Équipements les plus demandés</p>
            </div>
            <button
              className="featured-customize-btn"
              onClick={() => setShowCustomizer(true)}
              data-tooltip="Personnaliser"
            >
              ⚙️
            </button>
          </div>
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
                    {(item.cmu || item.longueur) && (
                      <div className="featured-specs">
                        {item.cmu && <span className="spec-badge">CMU: {item.cmu}</span>}
                        {item.longueur && <span className="spec-badge">L: {item.longueur}</span>}
                      </div>
                    )}
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

      {/* Panneau Ruptures de Disponibilité */}
      <div className="ruptures-section">
        <h2>📦 Ruptures de Disponibilité</h2>
        <div className="ruptures-grid">
          {stockAlerts.length === 0 ? (
            <div className="ruptures-empty">
              <span className="ruptures-empty-icon">✅</span>
              <p>Aucune alerte de disponibilité</p>
            </div>
          ) : (
            stockAlerts.map((item, index) => (
              <div key={index} className={`rupture-capsule rupture-level-${item.available}`}>
                <div className="rupture-icon">
                  {item.available === 0 ? '🔴' : '🟠'}
                </div>
                <div className="rupture-content">
                  <div className="rupture-model">{item.model}</div>
                  <div className="rupture-stock">
                    <span className="rupture-available">{item.available}</span> / {item.total}
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

      {/* Customizer Modal */}
      <FeaturedEquipmentCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        equipmentData={equipmentData}
        selectedModels={selectedFeaturedModels}
        onSave={handleSaveFeatured}
      />
    </div>
  );
};

export default DashboardPage;
