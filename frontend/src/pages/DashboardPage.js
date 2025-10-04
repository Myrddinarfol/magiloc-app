import React, { useMemo } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';

const DashboardPage = () => {
  const { stats, equipmentData } = useEquipment();
  const { setCurrentPage, setEquipmentFilter } = useUI();

  // Calculer les événements de la semaine
  const weekEvents = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Dimanche

    const returnsThisWeek = equipmentData.filter(eq => {
      if (eq.statut === 'En Location' && eq.fin_location_theorique) {
        const returnDate = new Date(eq.fin_location_theorique);
        return returnDate >= startOfWeek && returnDate <= endOfWeek;
      }
      return false;
    }).sort((a, b) => new Date(a.fin_location_theorique) - new Date(b.fin_location_theorique));

    const reservationsThisWeek = equipmentData.filter(eq => {
      if (eq.statut === 'En Réservation' && eq.debut_location) {
        const startDate = new Date(eq.debut_location);
        return startDate >= startOfWeek && startDate <= endOfWeek;
      }
      return false;
    }).sort((a, b) => new Date(a.debut_location) - new Date(b.debut_location));

    return { returnsThisWeek, reservationsThisWeek };
  }, [equipmentData]);

  // Locations en cours
  const currentLocations = useMemo(() => {
    return equipmentData
      .filter(eq => eq.statut === 'En Location')
      .slice(0, 5); // Top 5
  }, [equipmentData]);

  // VGP à prévoir (en retard + à venir dans 30 jours)
  const upcomingVGP = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate comparison
    const in30Days = new Date(today);
    in30Days.setDate(today.getDate() + 30);

    return equipmentData.filter(eq => {
      if (eq.prochainVGP) {
        // Parse date format DD/MM/YYYY
        const [day, month, year] = eq.prochainVGP.split('/');
        const vgpDate = new Date(year, month - 1, day);
        // Inclure les VGP en retard (< aujourd'hui) ET les VGP à venir (< 30 jours)
        return vgpDate <= in30Days;
      }
      return false;
    }).sort((a, b) => {
      const [dayA, monthA, yearA] = a.prochainVGP.split('/');
      const [dayB, monthB, yearB] = b.prochainVGP.split('/');
      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);
      return dateA - dateB;
    });
  }, [equipmentData]);

  // Retards effectifs
  const lateReturns = useMemo(() => {
    const today = new Date();
    return equipmentData.filter(eq => {
      if (eq.statut === 'En Location' && eq.fin_location_theorique) {
        const returnDate = new Date(eq.fin_location_theorique);
        return returnDate < today;
      }
      return false;
    });
  }, [equipmentData]);

  // Matériels phares - Disponibilité
  const featuredEquipment = useMemo(() => {
    const featured = [
      {
        title: 'TR30S / LM300+',
        subtitle: 'Treuil 300kg',
        models: ['TR30S', 'LM300+', 'LM300'],
        icon: '⚡',
        color: '#f59e0b'
      },
      {
        title: 'TR50 / LM500+',
        subtitle: 'Treuil 500kg',
        models: ['TR50', 'LM500+', 'LM500'],
        icon: '⚡',
        color: '#dc2626'
      },
      {
        title: 'TE3000',
        subtitle: 'Treuil électrique 3000kg',
        models: ['TE3000'],
        icon: '⚡',
        color: '#8b5cf6'
      },
      {
        title: 'TE1600',
        subtitle: 'Treuil électrique 1600kg',
        models: ['TE1600'],
        icon: '⚡',
        color: '#06b6d4'
      }
    ];

    return featured.map(item => {
      const allEquipment = equipmentData.filter(eq =>
        item.models.some(model => eq.modele && eq.modele.toUpperCase().includes(model.toUpperCase()))
      );
      const available = allEquipment.filter(eq => eq.statut === 'Sur Parc');
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
    // Navigation vers Sur Parc avec filtre
    setCurrentPage('sur-parc');
    // Le filtre sera appliqué via un état global si nécessaire
    // Pour l'instant, on navigue juste vers la page
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return `${days[date.getDay()]} ${date.getDate()}/${date.getMonth() + 1}`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Tableau de bord</h1>
        <p className="dashboard-subtitle">Parc Location COUERON</p>
      </div>

      {/* Section Stats + Matériels Phares */}
      <div className="dashboard-top-section">
        {/* Statistiques condensées */}
        <div className="stats-compact">
          <div className="stat-compact-card">
            <div className="stat-compact-left">
              <div className="stat-compact-icon">🏗️</div>
              <div className="stat-compact-label">Total</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number">{stats.total}</div>
            </div>
          </div>

          <div className="stat-compact-card">
            <div className="stat-compact-left">
              <div className="stat-compact-icon">📍</div>
              <div className="stat-compact-label primary">Location</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number primary">{stats.enLocation}</div>
              <div className="stat-compact-percentage primary">{stats.total > 0 ? ((stats.enLocation/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div className="stat-compact-card">
            <div className="stat-compact-left">
              <div className="stat-compact-icon">✅</div>
              <div className="stat-compact-label success">Disponibles</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number success">{stats.surParc}</div>
              <div className="stat-compact-percentage success">{stats.total > 0 ? ((stats.surParc/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div className="stat-compact-card">
            <div className="stat-compact-left">
              <div className="stat-compact-icon">🔧</div>
              <div className="stat-compact-label danger">Maintenance</div>
            </div>
            <div className="stat-compact-right">
              <div className="stat-compact-number danger">{stats.enMaintenance}</div>
              <div className="stat-compact-percentage danger">{stats.total > 0 ? ((stats.enMaintenance/stats.total)*100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div className="stat-compact-card">
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

      {/* Section Cette Semaine */}
      <div className="dashboard-section">
        <h2>📅 Cette Semaine</h2>
        <div className="week-events-grid">
          <div className="event-card">
            <h3>⏰ Retours Prévus ({weekEvents.returnsThisWeek.length})</h3>
            <div className="event-list">
              {weekEvents.returnsThisWeek.length === 0 ? (
                <p className="event-empty">Aucun retour prévu</p>
              ) : (
                weekEvents.returnsThisWeek.map(eq => (
                  <div key={eq.id} className="event-item">
                    <span className="event-date">{formatDate(eq.fin_location_theorique)}</span>
                    <span className="event-name">{eq.nom} - {eq.client}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="event-card">
            <h3>🚀 Départs Prévus ({weekEvents.reservationsThisWeek.length})</h3>
            <div className="event-list">
              {weekEvents.reservationsThisWeek.length === 0 ? (
                <p className="event-empty">Aucun départ prévu</p>
              ) : (
                weekEvents.reservationsThisWeek.map(eq => (
                  <div key={eq.id} className="event-item">
                    <span className="event-date">{formatDate(eq.debut_location)}</span>
                    <span className="event-name">{eq.nom} - {eq.client}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et Locations en cours */}
      <div className="dashboard-grid">
        <div className="dashboard-card alerts">
          <h3>⚠️ Alertes</h3>
          <div className="alert-items">
            <div className={`alert-item ${lateReturns.length > 0 ? 'alert-danger' : ''}`}>
              <span className="alert-icon">⏱️</span>
              <div className="alert-content">
                <span className="alert-label">Retards de retour</span>
                <span className="alert-value">{lateReturns.length}</span>
              </div>
            </div>
            <div className={`alert-item ${upcomingVGP.length > 0 ? 'alert-warning' : ''}`}>
              <span className="alert-icon">🔔</span>
              <div className="alert-content">
                <span className="alert-label">VGP à prévoir (30j)</span>
                <span className="alert-value">{upcomingVGP.length}</span>
              </div>
            </div>
          </div>
          {upcomingVGP.length > 0 && (
            <div className="alert-detail">
              <p className="alert-detail-title">Prochains VGP :</p>
              {upcomingVGP.slice(0, 5).map(eq => {
                const [day, month, year] = eq.prochainVGP.split('/');
                const vgpDate = new Date(year, month - 1, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isLate = vgpDate < today;
                return (
                  <div key={eq.id} className="alert-detail-item" style={{ color: isLate ? '#dc2626' : 'inherit' }}>
                    {isLate ? '⚠️' : '🔔'} {eq.designation} - {eq.prochainVGP} {isLate ? '(EN RETARD)' : ''}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>📍 Locations en Cours</h3>
          <div className="current-locations">
            {currentLocations.length === 0 ? (
              <p className="event-empty">Aucune location en cours</p>
            ) : (
              currentLocations.map(eq => (
                <div key={eq.id} className="location-item">
                  <div className="location-info">
                    <span className="location-name">{eq.nom}</span>
                    <span className="location-client">{eq.client}</span>
                  </div>
                  <div className="location-dates">
                    <span className="location-return">Retour : {formatDate(eq.fin_location_theorique)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setCurrentPage('en-location')}
            className="btn btn-primary btn-full"
          >
            Voir toutes les locations ({stats.enLocation})
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
