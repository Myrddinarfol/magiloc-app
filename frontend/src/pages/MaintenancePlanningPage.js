import React, { useMemo } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import PageHeader from '../components/common/PageHeader';
import WIPPanel from '../components/common/WIPPanel';

const MaintenancePlanningPage = () => {
  const { equipmentData } = useEquipment();

  // Tri des maintenances par date de début
  const maintenanceTimeline = useMemo(() => {
    const maintenances = equipmentData
      .filter(eq => eq.statut === 'En Maintenance' && eq.debutMaintenance)
      .map(eq => {
        const startDate = new Date(eq.debutMaintenance);
        const today = new Date();
        const durationDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

        return {
          ...eq,
          startDate,
          durationDays,
          estimatedEndDate: new Date(startDate.getTime() + (14 * 24 * 60 * 60 * 1000)) // Estimation: 14 jours
        };
      })
      .sort((a, b) => a.startDate - b.startDate);

    return maintenances;
  }, [equipmentData]);

  // Calcul de la plage de dates pour l'affichage
  const dateRange = useMemo(() => {
    if (maintenanceTimeline.length === 0) return { start: new Date(), end: new Date() };

    const today = new Date();
    const futureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // +30 jours

    return {
      start: today,
      end: futureDate
    };
  }, [maintenanceTimeline]);

  // Fonction pour calculer la position et la largeur d'une barre de maintenance
  const getBarPosition = (maintenance) => {
    const totalDuration = dateRange.end - dateRange.start;
    const startOffset = maintenance.startDate - dateRange.start;
    const duration = maintenance.estimatedEndDate - maintenance.startDate;

    const left = Math.max(0, (startOffset / totalDuration) * 100);
    const width = Math.min(100 - left, (duration / totalDuration) * 100);

    return { left: `${left}%`, width: `${width}%` };
  };

  // Génération des marqueurs de dates (semaines)
  const generateWeekMarkers = () => {
    const markers = [];
    const totalDuration = dateRange.end - dateRange.start;
    const weekInMs = 7 * 24 * 60 * 60 * 1000;

    for (let i = 0; i <= 4; i++) {
      const markerDate = new Date(dateRange.start.getTime() + (i * weekInMs));
      const position = ((markerDate - dateRange.start) / totalDuration) * 100;

      markers.push({
        date: markerDate,
        position: `${position}%`,
        label: markerDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
      });
    }

    return markers;
  };

  const weekMarkers = generateWeekMarkers();

  return (
    <div className="maintenance-planning">
      <PageHeader
        icon="🛠️"
        title="Planning Maintenance"
        subtitle="VUE CALENDRIER"
        description="Suivi chronologique des maintenances et interventions"
      />

      <WIPPanel />

      {/* Statistiques rapides */}
      <div className="planning-stats">
        <div className="planning-stat-card">
          <span className="planning-stat-value">{maintenanceTimeline.length}</span>
          <span className="planning-stat-label">Maintenances en cours</span>
        </div>
        <div className="planning-stat-card">
          <span className="planning-stat-value">
            {maintenanceTimeline.filter(m => m.durationDays > 7).length}
          </span>
          <span className="planning-stat-label">Maintenances longues (&gt;7j)</span>
        </div>
        <div className="planning-stat-card">
          <span className="planning-stat-value">
            {maintenanceTimeline.filter(m =>
              m.motifMaintenance && m.motifMaintenance.toLowerCase().includes('urgent')
            ).length}
          </span>
          <span className="planning-stat-label">Urgentes</span>
        </div>
      </div>

      {/* Timeline visuelle */}
      <div className="planning-timeline-container">
        <div className="timeline-header">
          <h2>🗓️ Timeline des Maintenances</h2>
          <div className="timeline-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: 'rgba(220, 38, 38, 0.6)' }}></span>
              <span>En cours</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: 'rgba(251, 146, 60, 0.6)' }}></span>
              <span>Estimation fin</span>
            </div>
          </div>
        </div>

        {maintenanceTimeline.length === 0 ? (
          <div className="planning-empty">
            <p>✅ Aucune maintenance en cours</p>
          </div>
        ) : (
          <>
            {/* Marqueurs de dates */}
            <div className="timeline-dates">
              {weekMarkers.map((marker, index) => (
                <div
                  key={index}
                  className="timeline-date-marker"
                  style={{ left: marker.position }}
                >
                  <div className="timeline-date-line"></div>
                  <span className="timeline-date-label">{marker.label}</span>
                </div>
              ))}
            </div>

            {/* Barres de maintenance */}
            <div className="timeline-bars">
              {maintenanceTimeline.map((maintenance, index) => {
                const position = getBarPosition(maintenance);
                const isUrgent = maintenance.motifMaintenance &&
                               maintenance.motifMaintenance.toLowerCase().includes('urgent');
                const isLong = maintenance.durationDays > 7;

                return (
                  <div
                    key={maintenance.id}
                    className="timeline-row"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="timeline-label">
                      <strong>{maintenance.reference}</strong>
                      <span className="timeline-label-model">{maintenance.modele}</span>
                      {isUrgent && <span className="urgent-badge">🚨 URGENT</span>}
                      {isLong && <span className="long-badge">⚠️ &gt;7j</span>}
                    </div>
                    <div className="timeline-bar-container">
                      <div
                        className={`timeline-bar ${isUrgent ? 'urgent' : ''} ${isLong ? 'long' : ''}`}
                        style={position}
                        title={`${maintenance.reference} - ${maintenance.durationDays} jours`}
                      >
                        <div className="timeline-bar-content">
                          <span className="timeline-bar-duration">{maintenance.durationDays}j</span>
                          {maintenance.motifMaintenance && (
                            <span className="timeline-bar-motif">{maintenance.motifMaintenance}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Liste détaillée */}
      <div className="planning-details">
        <h2>📋 Détails des Maintenances</h2>
        <div className="planning-table">
          <div className="planning-table-header">
            <div className="planning-th">Référence</div>
            <div className="planning-th">Modèle</div>
            <div className="planning-th">Début</div>
            <div className="planning-th">Durée</div>
            <div className="planning-th">Fin estimée</div>
            <div className="planning-th">Motif</div>
          </div>
          {maintenanceTimeline.map(maintenance => (
            <div key={maintenance.id} className="planning-table-row">
              <div className="planning-td">
                <strong>{maintenance.reference}</strong>
              </div>
              <div className="planning-td">{maintenance.modele}</div>
              <div className="planning-td">
                {maintenance.startDate.toLocaleDateString('fr-FR')}
              </div>
              <div className="planning-td">
                <span className={`duration-badge ${maintenance.durationDays > 7 ? 'long' : ''}`}>
                  {maintenance.durationDays} jours
                </span>
              </div>
              <div className="planning-td">
                {maintenance.estimatedEndDate.toLocaleDateString('fr-FR')}
              </div>
              <div className="planning-td">
                {maintenance.motifMaintenance || 'Non renseigné'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MaintenancePlanningPage;
