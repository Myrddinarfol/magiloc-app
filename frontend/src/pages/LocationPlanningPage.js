import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';

// ============================================================================
// FONCTIONS UTILITAIRES POUR CALCULS EN JOURS (évite les problèmes de timezone)
// ============================================================================

// Convertit une date en "jour numéro X depuis l'époque" (minuit local)
const dateToDay = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const normalized = new Date(year, month, day, 0, 0, 0, 0);
  return Math.floor(normalized.getTime() / (24 * 60 * 60 * 1000));
};

// Convertit un "jour numéro X" en Date (minuit local)
const dayToDate = (dayNumber) => {
  return new Date(dayNumber * 24 * 60 * 60 * 1000);
};

// Ajoute/soustrait des jours à une date (retourne une nouvelle Date)
const addDays = (date, days) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day + days, 0, 0, 0, 0);
};

// Calcule le nombre de jours entre deux dates
const daysBetween = (date1, date2) => {
  return dateToDay(date2) - dateToDay(date1);
};

const LocationPlanningPage = () => {
  const { equipmentData } = useEquipment();
  const { handleOpenEquipmentDetail } = useUI();
  const [viewMode, setViewMode] = useState('month'); // 'month' ou 'year'
  const [timelineOffset, setTimelineOffset] = useState(0); // Décalage en jours par rapport à aujourd'hui
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, offset: 0 });
  const [showHistory, setShowHistory] = useState(false); // Afficher l'historique des locations terminées

  // États pour les filtres
  const [filters, setFilters] = useState({
    showReservations: true,
    showLocations: true,
    showOverdue: true
  });

  // Fonction pour ouvrir la fiche de l'équipement depuis le planning
  const handleOpenEquipment = (equipment) => {
    handleOpenEquipmentDetail(equipment, 'location-planning'); // Mémoriser qu'on vient du planning
  };

  // Date "aujourd'hui" normalisée à minuit local
  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    return new Date(year, month, day, 0, 0, 0, 0);
  }, []);

  // Fonction pour parser les dates (supporte DD/MM/YYYY et YYYY-MM-DD)
  // IMPORTANT: Crée toujours une date à minuit HEURE LOCALE (pas UTC)
  const parseDate = (dateStr) => {
    if (!dateStr) return null;

    // Si format DD/MM/YYYY
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    // Si format YYYY-MM-DD (ISO date only)
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split('-');
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    }

    // Si format ISO complet avec timestamp
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Tri des locations ET réservations par date de début
  const locationTimeline = useMemo(() => {

    const locations = equipmentData
      .filter(eq => {
        if (!eq.debutLocation) return false;

        // Inclure les locations en cours ET les réservations
        const isLocation = eq.statut === 'En Location';
        const isReservation = eq.statut === 'En Réservation';

        // Si l'historique est activé, inclure aussi les locations terminées récemment
        if (showHistory) {
          const isRecentlyCompleted = eq.statut === 'Disponible' && eq.finLocationActuelle;
          if (isRecentlyCompleted) {
            const endDate = parseDate(eq.finLocationActuelle);
            if (endDate) {
              const daysSinceEnd = daysBetween(endDate, today);
              // Inclure si terminé il y a moins de 30 jours
              return daysSinceEnd <= 30 && daysSinceEnd >= 0;
            }
          }
        }

        return isLocation || isReservation;
      })
      .map(eq => {
        const isReservation = eq.statut === 'En Réservation';
        const isCompleted = eq.statut === 'Disponible'; // Location terminée (historique)
        const startDate = parseDate(eq.debutLocation);
        const endDate = eq.finLocationTheorique ? parseDate(eq.finLocationTheorique) : null;

        // Vérifier que les dates sont valides
        if (!startDate || isNaN(startDate.getTime())) {
          console.warn(`Date de début invalide pour ${eq.reference}:`, eq.debutLocation);
          return null;
        }

        // Déterminer si c'est en cours ou à venir
        const isFuture = startDate > today;

        // Calcul des dates et durées
        let endDateTheorique = endDate && !isNaN(endDate.getTime()) ? endDate : null;
        let endDateActuelle; // Date de fin réelle (fin théorique OU aujourd'hui si en retard)
        let plannedDays; // Durée prévue (début → fin théorique)
        let actualDays; // Durée totale actuelle (début → aujourd'hui si en retard, sinon → fin théorique)
        let lateDays = 0;
        let isLate = false;

        if (endDateTheorique) {
          plannedDays = Math.ceil((endDateTheorique - startDate) / (1000 * 60 * 60 * 24));

          // Pour les locations en cours (pas les réservations), vérifier le retard
          if (!isReservation && today > endDateTheorique) {
            // En retard : la barre continue jusqu'à aujourd'hui
            isLate = true;
            lateDays = Math.floor((today - endDateTheorique) / (1000 * 60 * 60 * 24));
            actualDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            endDateActuelle = today;
          } else {
            // Pas en retard : durée = durée prévue
            actualDays = plannedDays;
            endDateActuelle = endDateTheorique;
          }
        } else {
          // Pas de fin théorique
          if (isReservation) {
            // Pour les réservations sans fin : durée minimale de 1 jour
            plannedDays = 1;
            actualDays = 1;
            endDateActuelle = addDays(startDate, 1);
          } else {
            // Pour les locations : durée = depuis début jusqu'à aujourd'hui
            plannedDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            actualDays = plannedDays;
            endDateActuelle = today;
          }
        }

        return {
          ...eq,
          startDate,
          endDateTheorique,
          endDateActuelle,
          plannedDays: Math.max(plannedDays, 1),
          actualDays: Math.max(actualDays, 1),
          isLate,
          lateDays,
          isFuture,
          isReservation,
          isCompleted
        };
      })
      .filter(loc => loc !== null) // Filtrer les dates invalides
      .filter(loc => {
        // Appliquer les filtres
        if (loc.isReservation && !filters.showReservations) return false;
        if (!loc.isReservation && !loc.isLate && !filters.showLocations) return false;
        if (loc.isLate && !filters.showOverdue) return false;
        return true;
      })
      .sort((a, b) => a.startDate - b.startDate);

    return locations;
  }, [equipmentData, today, showHistory, filters]);

  // Calcul de la plage de dates pour l'affichage selon le mode (en jours)
  const dateRange = useMemo(() => {
    if (viewMode === 'week') {
      // Vue semaine : 7 jours passés à 7 jours futurs (+ offset)
      return {
        start: addDays(today, -7 + timelineOffset),
        end: addDays(today, 7 + timelineOffset),
        totalDays: 14
      };
    } else if (viewMode === 'month') {
      // Vue mois : 30 jours passés à 30 jours futurs (+ offset)
      return {
        start: addDays(today, -30 + timelineOffset),
        end: addDays(today, 30 + timelineOffset),
        totalDays: 60
      };
    } else {
      // Vue année : 180 jours passés à 180 jours futurs (+ offset)
      return {
        start: addDays(today, -180 + timelineOffset),
        end: addDays(today, 180 + timelineOffset),
        totalDays: 360
      };
    }
  }, [viewMode, today, timelineOffset]);

  // Fonction pour calculer la position et la largeur de la barre principale (bleue) - CALCULS EN JOURS
  const getBarPosition = (location) => {
    // Déterminer où la barre bleue se termine
    const endPoint = location.isLate && location.endDateTheorique
      ? location.endDateTheorique
      : location.endDateActuelle;

    // Si la fin est avant la période visible, pas de barre bleue
    const endDay = dateToDay(endPoint);
    const rangeStartDay = dateToDay(dateRange.start);
    if (endDay < rangeStartDay) {
      return { left: '0%', width: '0%' };
    }

    // La barre bleue va du max(startDate, rangeStart) au min(endPoint, rangeEnd)
    const startDay = Math.max(dateToDay(location.startDate), rangeStartDay);
    const endDayVisible = Math.min(endDay, dateToDay(dateRange.end));

    const daysFromStart = startDay - rangeStartDay;
    const durationInDays = endDayVisible - startDay;

    const left = (daysFromStart / dateRange.totalDays) * 100;
    const width = (durationInDays / dateRange.totalDays) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.max(0, width)}%` };
  };

  // Fonction pour calculer la position de la barre orange (retard) - CALCULS EN JOURS
  const getOvertimePosition = (location) => {
    if (!location.isLate || !location.endDateTheorique) return null;

    // La barre orange va de endDateTheorique jusqu'à TODAY
    const overtimeStartDay = Math.max(dateToDay(location.endDateTheorique), dateToDay(dateRange.start));
    const overtimeEndDay = Math.min(dateToDay(today), dateToDay(dateRange.end));

    const daysFromStart = overtimeStartDay - dateToDay(dateRange.start);
    const durationInDays = overtimeEndDay - overtimeStartDay;

    const left = (daysFromStart / dateRange.totalDays) * 100;
    const width = (durationInDays / dateRange.totalDays) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.max(0, width)}%` };
  };

  // Génération des marqueurs de dates selon le mode (calculs en jours)
  const generateDateMarkers = () => {
    const weekMarkers = [];
    const monthMarkers = [];
    const eventMarkers = [];

    // 1. MARQUEURS DE MOIS (barres verticales avec nom du mois)
    let currentDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    while (currentDate <= endDate) {
      const firstOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1, 0, 0, 0, 0);
      const daysFromStart = daysBetween(dateRange.start, firstOfMonth);
      const position = (daysFromStart / dateRange.totalDays) * 100;

      if (position >= 0 && position <= 100) {
        monthMarkers.push({
          date: firstOfMonth,
          position: `${position}%`,
          label: firstOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          type: 'month'
        });
      }

      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // 2. MARQUEURS DE SEMAINE (lundis)
    currentDate = new Date(dateRange.start);
    while (currentDate <= endDate) {
      // Trouver le prochain lundi
      const dayOfWeek = currentDate.getDay();
      const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7;
      const nextMonday = addDays(currentDate, daysUntilMonday);

      if (nextMonday <= endDate) {
        const daysFromStart = daysBetween(dateRange.start, nextMonday);
        const position = (daysFromStart / dateRange.totalDays) * 100;

        if (position >= 0 && position <= 100) {
          const isTodayMarker = dateToDay(nextMonday) === dateToDay(today);
          weekMarkers.push({
            date: nextMonday,
            position: `${position}%`,
            label: nextMonday.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
            isToday: isTodayMarker,
            type: 'week'
          });
        }
      }

      currentDate = addDays(nextMonday, 1);
    }

    // 3. MARQUEURS D'ÉVÉNEMENTS (débuts/fins de location)
    locationTimeline.forEach(location => {
      // Début de location
      const startDays = daysBetween(dateRange.start, location.startDate);
      const startPos = (startDays / dateRange.totalDays) * 100;
      if (startPos >= 0 && startPos <= 100) {
        eventMarkers.push({
          position: `${startPos}%`,
          type: 'start',
          icon: '🚀',
          tooltip: `Début: ${location.modele || location.designation}`
        });
      }

      // Fin de location
      if (location.endDateTheorique) {
        const endDays = daysBetween(dateRange.start, location.endDateTheorique);
        const endPos = (endDays / dateRange.totalDays) * 100;
        if (endPos >= 0 && endPos <= 100) {
          eventMarkers.push({
            position: `${endPos}%`,
            type: location.isLate ? 'overdue' : 'end',
            icon: location.isLate ? '⚠️' : '🏁',
            tooltip: `Fin: ${location.modele || location.designation}`
          });
        }
      }
    });

    return { weekMarkers, monthMarkers, eventMarkers };
  };

  const dateMarkers = generateDateMarkers();

  // Position de la ligne "aujourd'hui" - CALCULS EN JOURS
  const getTodayPosition = () => {
    const daysFromStart = daysBetween(dateRange.start, today);
    const position = (daysFromStart / dateRange.totalDays) * 100;
    return `${position}%`;
  };

  // Gestion du drag pour faire défiler la timeline
  const handleMouseDown = useCallback((e) => {
    // Ignorer si c'est un clic sur un élément cliquable (capsule, etc.)
    if (e.target.closest('.timeline-label')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, offset: timelineOffset });
    e.preventDefault();
  }, [timelineOffset]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    // Calculer le déplacement en pixels
    const deltaX = e.clientX - dragStart.x;

    // Convertir les pixels en jours (ajusté selon le mode de vue)
    const sensitivity = viewMode === 'week' ? 0.1 : viewMode === 'month' ? 0.3 : 0.8;
    const deltaDays = Math.round(-deltaX * sensitivity); // Négatif car déplacement inverse

    setTimelineOffset(dragStart.offset + deltaDays);
  }, [isDragging, dragStart, viewMode]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Ajouter les listeners globaux pour le drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Fonction pour revenir à aujourd'hui
  const resetTimeline = useCallback(() => {
    setTimelineOffset(0);
  }, []);

  return (
    <div className="location-planning">
      <PageHeader
        icon="📅"
        title="Planning Location"
        subtitle="VUE CALENDRIER"
        description="Visualisation chronologique de toutes vos locations"
      />

      {/* Boutons de filtres */}
      <div className="planning-filters">
        <h3 style={{ margin: '0 20px 0 0', color: '#9ca3af', fontSize: '16px' }}>🔍 Filtres :</h3>
        <button
          className={`filter-btn ${filters.showReservations ? 'active' : 'inactive'}`}
          onClick={() => setFilters(prev => ({ ...prev, showReservations: !prev.showReservations }))}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: filters.showReservations ? '2px solid #22c55e' : '2px solid #374151',
            background: filters.showReservations ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))' : 'linear-gradient(135deg, #1f2937, #111827)',
            color: filters.showReservations ? '#22c55e' : '#6b7280',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📋</span>
          <span>Réservations</span>
          <span style={{
            background: filters.showReservations ? 'rgba(34, 197, 94, 0.3)' : 'rgba(107, 114, 128, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {equipmentData.filter(eq => eq.statut === 'En Réservation').length}
          </span>
        </button>

        <button
          className={`filter-btn ${filters.showLocations ? 'active' : 'inactive'}`}
          onClick={() => setFilters(prev => ({ ...prev, showLocations: !prev.showLocations }))}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: filters.showLocations ? '2px solid #3b82f6' : '2px solid #374151',
            background: filters.showLocations ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))' : 'linear-gradient(135deg, #1f2937, #111827)',
            color: filters.showLocations ? '#3b82f6' : '#6b7280',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🚚</span>
          <span>Locations en cours</span>
          <span style={{
            background: filters.showLocations ? 'rgba(59, 130, 246, 0.3)' : 'rgba(107, 114, 128, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {equipmentData.filter(eq => eq.statut === 'En Location').length}
          </span>
        </button>

        <button
          className={`filter-btn ${filters.showOverdue ? 'active' : 'inactive'}`}
          onClick={() => setFilters(prev => ({ ...prev, showOverdue: !prev.showOverdue }))}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: filters.showOverdue ? '2px solid #fb923c' : '2px solid #374151',
            background: filters.showOverdue ? 'linear-gradient(135deg, rgba(251, 146, 60, 0.2), rgba(251, 146, 60, 0.1))' : 'linear-gradient(135deg, #1f2937, #111827)',
            color: filters.showOverdue ? '#fb923c' : '#6b7280',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚠️</span>
          <span>Dépassements</span>
          <span style={{
            background: filters.showOverdue ? 'rgba(251, 146, 60, 0.3)' : 'rgba(107, 114, 128, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px'
          }}>
            {equipmentData.filter(eq => {
              if (eq.statut !== 'En Location' || !eq.finLocationTheorique) return false;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              let returnDate;
              if (eq.finLocationTheorique.includes('/')) {
                const [day, month, year] = eq.finLocationTheorique.split('/');
                returnDate = new Date(year, month - 1, day);
              } else {
                returnDate = new Date(eq.finLocationTheorique);
              }
              returnDate.setHours(0, 0, 0, 0);
              return returnDate < today;
            }).length}
          </span>
        </button>
      </div>

      {/* Timeline visuelle */}
      <div className="planning-timeline-container">
        <div className="timeline-header">
          <div className="timeline-header-left">
            <h2>🗓️ Timeline des Locations</h2>
            <div className="timeline-view-selector">
              <button
                className={`view-selector-btn ${viewMode === 'week' ? 'active' : ''}`}
                onClick={() => setViewMode('week')}
              >
                📋 Semaine
              </button>
              <button
                className={`view-selector-btn ${viewMode === 'month' ? 'active' : ''}`}
                onClick={() => setViewMode('month')}
              >
                📅 Mois
              </button>
              <button
                className={`view-selector-btn ${viewMode === 'year' ? 'active' : ''}`}
                onClick={() => setViewMode('year')}
              >
                📆 Année
              </button>
              <button
                className="view-selector-btn today-btn"
                onClick={resetTimeline}
                title="Revenir à aujourd'hui"
              >
                🎯 Aujourd'hui
              </button>
            </div>
          </div>
          <div className="timeline-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: 'rgba(59, 130, 246, 0.6)' }}></span>
              <span>Location en cours</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: 'rgba(34, 197, 94, 0.6)' }}></span>
              <span>Réservation</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: 'rgba(251, 146, 60, 0.6)' }}></span>
              <span>Dépassement</span>
            </div>
            <div className="legend-item">
              <span className="legend-color today-indicator" style={{ background: '#f97316' }}></span>
              <span>Aujourd'hui</span>
            </div>
          </div>
        </div>

        {locationTimeline.length === 0 ? (
          <div className="planning-empty">
            <p>✅ Aucune location en cours</p>
          </div>
        ) : (
          <>
            {/* Marqueurs de dates - Nouvelle structure */}
            <div
              className="timeline-dates-container"
              onMouseDown={handleMouseDown}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {/* Barres de séparation des mois */}
              {dateMarkers.monthMarkers.map((marker, index) => (
                <div
                  key={`month-${index}`}
                  className="timeline-month-separator"
                  style={{ left: marker.position }}
                >
                  <div className="timeline-month-line"></div>
                  <span className="timeline-month-label">{marker.label}</span>
                </div>
              ))}

              {/* Marqueurs hebdomadaires (lundis) */}
              {dateMarkers.weekMarkers.map((marker, index) => (
                <div
                  key={`week-${index}`}
                  className={`timeline-week-marker ${marker.isToday ? 'today' : ''}`}
                  style={{ left: marker.position }}
                >
                  <div className="timeline-week-line"></div>
                  <span className="timeline-week-label">{marker.label}</span>
                </div>
              ))}

              {/* Ligne verticale rouge AUJOURD'HUI */}
              <div
                className="timeline-today-line"
                style={{ left: getTodayPosition() }}
              >
                <div className="timeline-today-indicator">
                  <span className="today-label">🕐 AUJOURD'HUI</span>
                </div>
              </div>

              {/* Marqueurs d'événements (débuts/fins de location) */}
              <div className="timeline-events">
                {dateMarkers.eventMarkers.map((marker, index) => (
                  <div
                    key={`event-${index}`}
                    className={`timeline-event-marker ${marker.type}`}
                    style={{ left: marker.position }}
                    title={marker.tooltip}
                  >
                    <span className="timeline-event-icon">{marker.icon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barres de location */}
            <div
              className={`timeline-bars ${isDragging ? 'dragging' : ''}`}
              onMouseDown={handleMouseDown}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              {locationTimeline.map((location, index) => {
                const position = getBarPosition(location);
                const overtimePosition = getOvertimePosition(location);
                const todayPosition = getTodayPosition();

                return (
                  <div
                    key={location.id}
                    className="timeline-row"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div
                      className="timeline-label"
                      onClick={() => handleOpenEquipment(location)}
                      title="Cliquer pour voir la fiche complète"
                    >
                      <div className="timeline-label-header">
                        <span className="timeline-label-name">
                          {location.modele || location.designation || 'Équipement'}
                        </span>
                        <div className="timeline-label-badges">
                          <span className="duration-badge-blue" title="Durée prévue">
                            {location.plannedDays}j
                          </span>
                          {location.isLate && (
                            <span className="duration-badge-orange" title="Dépassement">
                              +{location.lateDays}j
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="timeline-label-client">{location.client}</span>
                    </div>
                    <div className="timeline-bar-container">
                      {/* Marqueur "Aujourd'hui" sur cette ligne */}
                      <div className="timeline-today-marker" style={{ left: todayPosition }}></div>

                      {/* Barre principale (bleu pour location, vert pour réservation, gris pour terminée) */}
                      <div
                        className={`timeline-bar ${
                          location.isCompleted ? 'completed' :
                          location.isReservation ? 'reservation' : 'location'
                        } ${!location.isReservation && (location.isFuture ? 'future' : 'current')}`}
                        style={position}
                        title={`${location.modele || location.designation || 'Équipement'} - ${location.client} - ${location.actualDays} jours${location.isLate ? ` (${location.lateDays}j de retard)` : ''}${location.isReservation ? ' (RÉSERVATION)' : ''}${location.isCompleted ? ' (TERMINÉE)' : ''}`}
                      >
                        <div className="timeline-bar-content">
                          <span className="timeline-bar-duration">
                            {location.isReservation && '📅 '}
                            {location.plannedDays}j
                          </span>
                          <span className="timeline-bar-client">{location.client}</span>
                        </div>
                      </div>

                      {/* Barre de dépassement (orange) si en retard */}
                      {location.isLate && overtimePosition && (
                        <div
                          className="timeline-bar location overtime"
                          style={overtimePosition}
                          title={`Dépassement: ${location.lateDays} jours`}
                        >
                          <div className="timeline-bar-content">
                            <span className="timeline-bar-overtime">+{location.lateDays}j</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LocationPlanningPage;
