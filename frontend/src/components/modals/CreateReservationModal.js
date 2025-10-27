import React, { useState } from 'react';
import ClientAutocomplete from '../common/ClientAutocomplete';
import { useUI } from '../../hooks/useUI';

const CreateReservationModal = ({ show, equipment, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    client: '',
    debutLocation: today,
    finLocationTheorique: '',
    departEnlevement: '',
    numeroOffre: '',
    notesLocation: '',
    estLongDuree: false,
    estPret: false,
    minimumFacturationApply: false
  });

  if (!show) return null;

  const validateDateRange = () => {
    if (formData.debutLocation && formData.finLocationTheorique) {
      const debut = new Date(formData.debutLocation);
      const fin = new Date(formData.finLocationTheorique);
      if (debut > fin) {
        showToast('La date de fin théorique doit être après la date de début', 'error');
        return false;
      }
    }
    return true;
  };

  const handleConfirm = () => {
    if (!formData.client) {
      showToast('Le champ CLIENT est obligatoire', 'warning');
      return;
    }
    if (!validateDateRange()) {
      return;
    }
    onConfirm(formData);
    // Reset pour la prochaine fois
    setFormData({
      client: '',
      debutLocation: today,
      finLocationTheorique: '',
      departEnlevement: '',
      numeroOffre: '',
      notesLocation: '',
      estLongDuree: false,
      estPret: false,
      minimumFacturationApply: false
    });
  };

  const handleCancel = () => {
    setFormData({
      client: '',
      debutLocation: today,
      finLocationTheorique: '',
      departEnlevement: '',
      numeroOffre: '',
      notesLocation: '',
      estLongDuree: false,
      estPret: false,
      minimumFacturationApply: false
    });
    onCancel();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        border: '3px solid #fbbf24',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(251, 191, 36, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '20px',
          animation: 'bounce 0.6s ease-out'
        }}>
          📋
        </div>

        {/* Title */}
        <h2 style={{
          color: '#fbbf24',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Créer une réservation
        </h2>

        {/* Equipment info */}
        {equipment && (
          <div style={{
            background: 'rgba(251, 191, 36, 0.1)',
            border: '2px solid rgba(251, 191, 36, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              {equipment.designation} {equipment.cmu}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px' }}>
              {equipment.marque} {equipment.modele}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '14px', marginTop: '4px' }}>
              N° Série: {equipment.numeroSerie}
            </div>
          </div>
        )}

        {/* CLIENT autocomplete input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            CLIENT <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <ClientAutocomplete
            value={formData.client}
            onChange={(clientName) => setFormData({...formData, client: clientName})}
            placeholder="Nom du client (tapez pour chercher)"
          />
        </div>

        {/* DEBUT LOCATION input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            DÉBUT LOCATION
          </label>
          <input
            type="date"
            value={formData.debutLocation}
            onChange={(e) => setFormData({...formData, debutLocation: e.target.value})}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#fff',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* FIN THEORIQUE input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            FIN THÉORIQUE
          </label>
          <input
            type="date"
            value={formData.finLocationTheorique}
            onChange={(e) => setFormData({...formData, finLocationTheorique: e.target.value})}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#fff',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* DEPART/ENLEVEMENT input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            📤 DÉPART/ENLÈVEMENT
          </label>
          <input
            type="date"
            value={formData.departEnlevement}
            onChange={(e) => setFormData({...formData, departEnlevement: e.target.value})}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#fff',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <small style={{color: '#9ca3af', marginTop: '4px', display: 'block'}}>
            Date à titre indicatif (expédition ou enlèvement client)
          </small>
        </div>

        {/* N° OFFRE input */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            N° OFFRE
          </label>
          <input
            type="text"
            value={formData.numeroOffre}
            onChange={(e) => setFormData({...formData, numeroOffre: e.target.value})}
            placeholder="Numéro de l'offre"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              color: '#fff',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* NOTES textarea */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            NOTES
          </label>
          <textarea
            value={formData.notesLocation}
            onChange={(e) => setFormData({...formData, notesLocation: e.target.value})}
            placeholder="Notes de location, instructions spéciales..."
            rows="4"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#fff',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.3s ease',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(251, 191, 36, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* LONG DURATION checkbox */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            color: '#d1d5db'
          }}>
            <input
              type="checkbox"
              checked={formData.estLongDuree}
              onChange={(e) => setFormData({...formData, estLongDuree: e.target.checked})}
              style={{cursor: 'pointer', width: '18px', height: '18px'}}
            />
            <span>📊 Location Longue Durée (-20% remise)</span>
          </label>
        </div>

        {/* LOAN EQUIPMENT checkbox */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            color: '#d1d5db'
          }}>
            <input
              type="checkbox"
              checked={formData.estPret}
              onChange={(e) => setFormData({...formData, estPret: e.target.checked})}
              style={{cursor: 'pointer', width: '18px', height: '18px'}}
            />
            <span>🎁 Matériel en Prêt (Non facturé)</span>
          </label>
          <small style={{color: '#9ca3af', marginTop: '4px', display: 'block', marginLeft: '28px'}}>
            Cochez si le matériel est en prêt (SAV, délai de commande, etc.) - ne sera pas inclus dans le CA
          </small>
        </div>

        {/* MINIMUM FACTURATION checkbox */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '15px',
            color: '#d1d5db'
          }}>
            <input
              type="checkbox"
              checked={formData.minimumFacturationApply}
              onChange={(e) => setFormData({...formData, minimumFacturationApply: e.target.checked})}
              style={{cursor: 'pointer', width: '18px', height: '18px'}}
            />
            <span>💰 Minimum de facturation appliqué ({equipment?.minimumFacturation ? `${equipment.minimumFacturation}€` : 'N/A'})</span>
          </label>
        </div>

        {/* Info message */}
        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '24px',
          fontStyle: 'italic'
        }}>
          Le matériel passera en statut <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>EN RÉSERVATION</span>
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#9ca3af',
              background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.6), rgba(31, 41, 55, 0.6))',
              border: '2px solid rgba(75, 85, 99, 0.8)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(75, 85, 99, 0.8), rgba(55, 65, 81, 0.8))';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, rgba(55, 65, 81, 0.6), rgba(31, 41, 55, 0.6))';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✕ Annuler
          </button>

          <button
            onClick={handleConfirm}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fcd34d, #fbbf24)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(251, 191, 36, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #fbbf24, #f59e0b)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✅ Créer la réservation
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(30px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default CreateReservationModal;
