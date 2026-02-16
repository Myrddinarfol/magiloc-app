import React, { useState, useEffect } from 'react';
import { useIntervention } from '../../hooks/useIntervention';
import { useUI } from '../../hooks/useUI';
import VGPPageHeader from './VGPPageHeader';
import PlanifierInterventionModal from './modals/PlanifierInterventionModal';
import './VGPInterventionsPage.css';

const VGPInterventionsPage = () => {
  const { interventions, loadInterventions, updateIntervention, deleteIntervention } = useIntervention();
  const { showToast } = useUI();

  const [currentView, setCurrentView] = useState('fiches'); // 'fiches' | 'planning'
  const [showModal, setShowModal] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Load interventions on mount
  useEffect(() => {
    loadInterventions();
  }, []);

  const handleOpenModal = (intervention = null) => {
    setEditingIntervention(intervention);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingIntervention(null);
    // Reload interventions when modal closes
    loadInterventions();
  };

  const handleChangeStatus = async (interventionId, newStatus) => {
    try {
      await updateIntervention(interventionId, { statut: newStatus });
      showToast(`✅ Statut mis à jour en "${getStatusLabel(newStatus)}"`, 'success');
    } catch (err) {
      showToast(`Erreur: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (interventionId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        await deleteIntervention(interventionId);
        showToast('✅ Intervention supprimée', 'success');
      } catch (err) {
        showToast(`Erreur: ${err.message}`, 'error');
      }
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'planifiee': 'Planifiée',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'planifiee': '#3b82f6',     // blue
      'en_cours': '#f59e0b',      // orange
      'terminee': '#10b981',      // green
      'annulee': '#6b7280'        // gray
    };
    return colors[status] || '#9ca3af';
  };

  // Render Fiches View
  const renderFichesView = () => {
    if (interventions.length === 0) {
      return (
        <div className="interventions-empty">
          <div className="empty-icon">📭</div>
          <p>Aucune intervention planifiée pour le moment</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            🗓️ Créer la première intervention
          </button>
        </div>
      );
    }

    return (
      <div className="interventions-grid">
        {interventions.map(intervention => (
          <div key={intervention.id} className="intervention-card">
            <div className="card-header">
              <span
                className="status-badge"
                style={{ backgroundColor: getStatusColor(intervention.statut) }}
              >
                {getStatusLabel(intervention.statut)}
              </span>
              <div className="card-actions">
                <button
                  className="action-btn"
                  onClick={() => handleOpenModal(intervention)}
                  title="Éditer"
                >
                  ✏️
                </button>
                <button
                  className="action-btn delete"
                  onClick={() => handleDelete(intervention.id)}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            </div>

            <div className="card-content">
              <div className="client-info">
                <strong>{intervention.client_nom || '(Client ponctuel)'}</strong>
                {intervention.site_nom && (
                  <span className="site-name">{intervention.site_nom}</span>
                )}
              </div>

              <div className="address-info">
                <span className="address-label">📍</span>
                <span className="address-text">{intervention.adresse_intervention}</span>
              </div>

              {intervention.contact_site && (
                <div className="contact-info">
                  <span className="contact-label">👤</span>
                  <span className="contact-text">
                    {intervention.contact_site.split('\n')[0]}
                    {intervention.contact_site.split('\n').length > 1 && (
                      <span className="contact-plus">
                        +{intervention.contact_site.split('\n').length - 1}
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="intervention-meta">
                <span className="date">
                  📅 {new Date(intervention.date_intervention).toLocaleDateString('fr-FR')}
                </span>
                <span className="duration">
                  ⏱️ {intervention.duree_jours}j
                </span>
              </div>

              {intervention.recommandations && (
                <div className="recommendations">
                  <span className="label">💡 Recommandations:</span>
                  <p className="text">{intervention.recommandations.substring(0, 100)}...</p>
                </div>
              )}
            </div>

            <div className="card-footer">
              <select
                value={intervention.statut}
                onChange={(e) => handleChangeStatus(intervention.id, e.target.value)}
                className="status-select"
              >
                <option value="planifiee">Planifiée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Fonction helper pour vérifier si un jour est dans une intervention
  const isInterventionDay = (intervention, year, month, day) => {
    const [startYear, startMonth, startDay] = intervention.date_intervention.split('-').map(Number);
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const currentDate = new Date(year, month, day);

    // Convertir la durée en nombre et calculer la date de fin
    const durationDays = Math.floor(Number(intervention.duree_jours) || 1);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays - 1);

    // Vérifier si le jour courant est dans l'intervalle
    return currentDate >= startDate && currentDate <= endDate;
  };

  // Render Planning View
  const renderPlanningView = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Create calendar grid
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    const monthName = new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    return (
      <div className="planning-view">
        <div className="planning-header">
          <button
            className="nav-btn"
            onClick={() => setCurrentMonth(new Date(year, month - 1))}
          >
            ◀ Précédent
          </button>
          <h3 className="month-title">{monthName}</h3>
          <button
            className="nav-btn"
            onClick={() => setCurrentMonth(new Date(year, month + 1))}
          >
            Suivant ▶
          </button>
        </div>

        <div className="planning-calendar">
          <div className="calendar-weekdays">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {days.map((day, index) => {
              const dayInterventions = day
                ? interventions.filter(i => isInterventionDay(i, year, month, day))
                : [];
              const isToday = isCurrentMonth && day === today.getDate();

              return (
                <div
                  key={index}
                  className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''}`}
                >
                  {day && <span className="day-number">{day}</span>}
                  <div className="day-interventions">
                    {dayInterventions.map(intervention => (
                      <div
                        key={intervention.id}
                        className="intervention-capsule"
                        style={{
                          backgroundColor: getStatusColor(intervention.statut),
                          borderColor: getStatusColor(intervention.statut)
                        }}
                        title={`${intervention.client_nom || 'Client ponctuel'}\n${intervention.adresse_intervention}\nDurée: ${intervention.duree_jours}j`}
                        onClick={() => handleOpenModal(intervention)}
                      >
                        <div className="capsule-content">
                          <span className="capsule-client">
                            {intervention.client_nom || 'Client'}
                          </span>
                          <span className="capsule-address">
                            {intervention.adresse_intervention}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="planning-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></span>
            <span>Planifiée</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span>
            <span>En cours</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span>
            <span>Terminée</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#6b7280' }}></span>
            <span>Annulée</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="vgp-interventions-page">
      <VGPPageHeader
        icon="🛠️"
        title="Interventions"
        subtitle="Gestion des interventions VGP"
        description="Planifier, suivre et gérer les interventions sur site"
      />

      {/* Navigation Buttons */}
      <div className="interventions-nav">
        <button
          className={`nav-button ${currentView === 'fiches' ? 'active' : ''}`}
          onClick={() => setCurrentView('fiches')}
        >
          📋 Fiches d'interventions
        </button>
        <button
          className={`nav-button ${currentView === 'planning' ? 'active' : ''}`}
          onClick={() => setCurrentView('planning')}
        >
          📅 Planning
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="action-header">
        <button
          className="btn btn-primary btn-large"
          onClick={() => handleOpenModal()}
        >
          🗓️ Planifier une intervention
        </button>
      </div>

      {/* Content */}
      <div className="interventions-content">
        {currentView === 'fiches' ? renderFichesView() : renderPlanningView()}
      </div>

      {/* Modal */}
      {showModal && (
        <PlanifierInterventionModal
          onClose={handleCloseModal}
          intervention={editingIntervention}
          isEditing={!!editingIntervention}
        />
      )}
    </div>
  );
};

export default VGPInterventionsPage;
