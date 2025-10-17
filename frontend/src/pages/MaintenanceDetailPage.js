import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUI } from '../hooks/useUI';
import MaintenanceManagementPanel from '../components/maintenance/MaintenanceManagementPanel';
import ValidateMaintenanceModal from '../components/modals/ValidateMaintenanceModal';
import './MaintenanceDetailPage.css';

// Helper pour convertir une date française DD/MM/YYYY en Date object
const parseFrenchDate = (dateStr) => {
  if (!dateStr) return null;

  // Si c'est au format français DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return new Date(`${year}-${month}-${day}T00:00:00Z`);
  }

  // Sinon, essayer de parser comme ISO ou autre format
  return new Date(dateStr);
};

// Helper pour obtenir les détails du VGP
const getVGPDetails = (date) => {
  if (!date) {
    return {
      color: 'gray',
      icon: '❓',
      label: 'Non renseigné',
      subLabel: 'Veuillez renseigner la date'
    };
  }

  const today = new Date();
  const vgpDate = parseFrenchDate(date);

  // Vérifier si la date est valide
  if (isNaN(vgpDate.getTime())) {
    return {
      color: 'gray',
      icon: '❌',
      label: 'Date invalide',
      subLabel: 'Format de date non reconnu'
    };
  }

  const daysUntil = Math.ceil((vgpDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) {
    return {
      color: 'red',
      icon: '⚠️',
      label: 'DÉPASSÉ',
      subLabel: `Depuis ${Math.abs(daysUntil)} jour${Math.abs(daysUntil) > 1 ? 's' : ''}`
    };
  }

  if (daysUntil < 30) {
    return {
      color: 'orange',
      icon: '⏰',
      label: 'BIENTÔT',
      subLabel: `Plus que ${daysUntil} jour${daysUntil > 1 ? 's' : ''}`
    };
  }

  return {
    color: 'green',
    icon: '✅',
    label: 'VALIDE',
    subLabel: `Valide pour ${daysUntil} jours`
  };
};

const MaintenanceDetailPage = ({ equipmentData = [] }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, maintenanceData: contextMaintenanceData, setMaintenanceData: setContextMaintenanceData } = useUI();

  const [equipment, setEquipment] = useState(null);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState({});
  const [loading, setLoading] = useState(true);

  // Trouver l'équipement
  useEffect(() => {
    if (id && equipmentData.length > 0) {
      const found = equipmentData.find(eq => eq.id === parseInt(id));
      setEquipment(found || null);
      setLoading(false);

      // Initialize maintenance data with existing motif from equipment
      if (found && found.motifMaintenance) {
        setMaintenanceData(prev => ({
          ...prev,
          motif_maintenance: found.motifMaintenance
        }));
      }
    }
  }, [id, equipmentData]);

  // Auto-populate maintenance data from UIContext (when returning from location or putting in maintenance)
  // This takes priority over equipment's existing motif
  useEffect(() => {
    if (contextMaintenanceData && (contextMaintenanceData.motif || contextMaintenanceData.noteRetour)) {
      setMaintenanceData(prev => ({
        ...prev,
        motif_maintenance: contextMaintenanceData.motif || prev.motif_maintenance || '',
        note_retour: contextMaintenanceData.noteRetour || prev.note_retour || ''
      }));
      // Clear the context data after using it (prevent cross-equipment data leakage)
      setContextMaintenanceData({ motif: '', noteRetour: '' });
    }
  }, [contextMaintenanceData, setContextMaintenanceData]);

  const handleConfirmMaintenance = async (data) => {
    try {
      if (!equipment) return;

      console.log('📤 Envoi données maintenance:', data);

      // Mapper les données du formulaire aux clés attendues par le backend
      const maintenancePayload = {
        motif: data.motif_maintenance || '',
        notes: data.notes_maintenance || '',
        pieces: data.pieces_utilisees || [],
        tempsHeures: data.main_oeuvre_heures || 0,
        vgpEffectuee: data.vgp_effectuee || false,
        technicien: data.technicien || ''
      };

      console.log('📦 Payload envoyé:', maintenancePayload);

      const response = await fetch(`http://localhost:5000/api/equipment/${equipment.id}/maintenance/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintenancePayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Réponse erreur:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Maintenance validée:', result);
      showToast('✅ Maintenance validée avec succès', 'success');
      setShowValidateModal(false);

      setTimeout(() => navigate('/maintenance'), 1000);
    } catch (err) {
      console.error('❌ Erreur sauvegarde maintenance:', err);
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="maintenance-page-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="maintenance-page-error">
        <div className="error-container">
          <h2>❌ Équipement non trouvé</h2>
          <p>L'équipement n° {id} n'existe pas ou n'est pas disponible.</p>
          <button onClick={() => navigate('/maintenance')} className="btn btn-primary">
            ← Retour à la maintenance
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-page">
      {/* HEADER - FULL WIDTH */}
      <div className="maintenance-header">
        <div className="maintenance-header-content">
          <div className="maintenance-header-icon">🔧</div>
          <div className="maintenance-header-text">
            <h1>Maintenance de l'appareil :</h1>
            <p>Gestion complète de la maintenance - {equipment.designation}</p>
          </div>
        </div>
      </div>

      {/* BODY - 25/75 LAYOUT */}
      <div className="maintenance-body">
        {/* Left Sidebar - Equipment Info (25%) */}
        <div className="maintenance-sidebar">
          {/* Back Button */}
          <div className="sidebar-header">
            <button
              onClick={() => navigate('/maintenance')}
              className="sidebar-back-btn"
              title="Retour"
            >
              <span className="back-arrow">←</span>
              <span>Retour</span>
            </button>
          </div>

          {/* Equipment Title */}
          <div className="sidebar-title-section">
            <h2 className="sidebar-equipment-name">{equipment.designation}</h2>
            <p className="sidebar-equipment-cmu">{equipment.cmu}</p>
          </div>

        {/* Equipment Specs */}
        <div className="sidebar-specs-section">
          <div className="specs-grid">
            <div className="spec-card">
              <div className="spec-icon">🏷️</div>
              <div className="spec-content">
                <span className="spec-label">N° Série</span>
                <span className="spec-value">{equipment.numeroSerie}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">🏭</div>
              <div className="spec-content">
                <span className="spec-label">Marque</span>
                <span className="spec-value">{equipment.marque || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">📦</div>
              <div className="spec-content">
                <span className="spec-label">Modèle</span>
                <span className="spec-value">{equipment.modele || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">📏</div>
              <div className="spec-content">
                <span className="spec-label">Longueur</span>
                <span className="spec-value">{equipment.longueur || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">✨</div>
              <div className="spec-content">
                <span className="spec-label">État</span>
                <span className="spec-value">{equipment.etat || 'N/A'}</span>
              </div>
            </div>

            <div className="spec-card">
              <div className="spec-icon">💰</div>
              <div className="spec-content">
                <span className="spec-label">Prix/j</span>
                <span className="spec-value">{equipment.prixHT ? `${equipment.prixHT}€` : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VGP Section - Exact copy from fiches matériels */}
        <div className="sidebar-vgp-section">
          <div className="vgp-section-header-sidebar">
            <h4 className="vgp-section-title">Contrôles VGP</h4>
          </div>

          {/* Certificat Info */}
          <div className="vgp-detail-grid">
            <div className="vgp-info-item">
              <span className="vgp-info-label">Certificat:</span>
              {equipment.certificat ? (
                <a
                  href={`https://www.google.com/search?q=${equipment.certificat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="certificat-link"
                >
                  {equipment.certificat} 🔗
                </a>
              ) : (
                <span className="vgp-info-value">Non renseigné</span>
              )}
            </div>
          </div>

          {/* VGP Status Card */}
          <div className={`vgp-status-card vgp-status-${getVGPDetails(equipment.prochainVGP).color}`}>
            <div className="vgp-status-icon">{getVGPDetails(equipment.prochainVGP).icon}</div>
            <div className="vgp-status-content">
              <div className="vgp-status-label">{getVGPDetails(equipment.prochainVGP).label}</div>
              <div className="vgp-status-date">{equipment.prochainVGP || 'Non renseigné'}</div>
              <div className="vgp-status-sublabel">{getVGPDetails(equipment.prochainVGP).subLabel}</div>
            </div>
          </div>
        </div>

        {/* Validate Button */}
        <button
          className="btn-validate-maintenance-sidebar"
          onClick={() => {
            setShowValidateModal(true);
          }}
        >
          ✅ VALIDER MAINTENANCE
        </button>

      </div>

      {/* Right Content Area - Maintenance Management (75%) */}
      <div className="maintenance-content">
        <div className="content-panel">
          <MaintenanceManagementPanel
            equipment={equipment}
            onValidateMaintenance={(data) => {
              setMaintenanceData(data);
              setShowValidateModal(true);
            }}
            maintenanceData={maintenanceData}
          />
        </div>
      </div>
      </div>

      {/* Validation Modal */}
      {showValidateModal && (
        <ValidateMaintenanceModal
          equipment={equipment}
          maintenance={maintenanceData}
          onConfirm={handleConfirmMaintenance}
          onCancel={() => setShowValidateModal(false)}
        />
      )}
    </div>
  );
};

export default MaintenanceDetailPage;
