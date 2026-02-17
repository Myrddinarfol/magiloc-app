import React, { useState } from 'react';
import { useUI } from '../../hooks/useUI';

const ReturnModal = ({ show, equipment, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const today = new Date().toISOString().split('T')[0];
  const [returnDate, setReturnDate] = useState(today);
  const [returnTime, setReturnTime] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [minimumFacturationApply, setMinimumFacturationApply] = useState(equipment?.minimumFacturationApply || false);

  if (!show) return null;

  const validateReturnDate = () => {
    if (!returnDate) {
      showToast('Veuillez saisir la date de retour', 'warning');
      return false;
    }
    // Validate that return date is not before the rental start date
    if (equipment?.debutLocation) {
      const returnDateObj = new Date(returnDate);

      // Convertir la date de début (peut être en format français JJ/MM/AAAA ou ISO AAAA-MM-JJ)
      let startDateObj;
      if (equipment.debutLocation.includes('/')) {
        // Format français: JJ/MM/AAAA
        const [day, month, year] = equipment.debutLocation.split('/');
        startDateObj = new Date(`${year}-${month}-${day}`);
      } else {
        // Format ISO: AAAA-MM-JJ
        startDateObj = new Date(equipment.debutLocation);
      }

      if (returnDateObj < startDateObj) {
        showToast('La date de retour doit être après ou égale à la date de début de location', 'error');
        return false;
      }
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateReturnDate()) {
      return;
    }
    onConfirm(returnDate, returnNotes, returnTime, minimumFacturationApply);
    // Reset pour la prochaine fois
    setReturnDate(today);
    setReturnTime('');
    setReturnNotes('');
    setMinimumFacturationApply(equipment?.minimumFacturationApply || false);
  };

  const handleCancel = () => {
    setReturnDate(today);
    setReturnTime('');
    setReturnNotes('');
    setMinimumFacturationApply(equipment?.minimumFacturationApply || false);
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
        border: '3px solid #3b82f6',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '550px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(59, 130, 246, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '20px',
          animation: 'bounce 0.6s ease-out'
        }}>
          ↩️
        </div>

        {/* Title */}
        <h2 style={{
          color: '#3b82f6',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Effectuer le retour
        </h2>

        {/* Equipment info */}
        {equipment && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
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
            {equipment.client && (
              <div style={{ color: '#fbbf24', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                Client: {equipment.client}
              </div>
            )}
            {equipment.debutLocation && (
              <div style={{ color: '#14b8a6', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                Départ: {equipment.debutLocation}
              </div>
            )}
          </div>
        )}

        {/* Date et Heure input */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Date de retour <span style={{ color: '#f97316' }}>*</span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#fff',
                background: 'rgba(31, 41, 55, 0.8)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Heure de retour <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optionnel)</span>
            </label>
            <input
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#fff',
                background: 'rgba(31, 41, 55, 0.8)',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Notes textarea */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            color: '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Notes de retour
          </label>
          <textarea
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            placeholder="Problèmes constatés, points à vérifier, état du matériel..."
            rows="4"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#fff',
              background: 'rgba(31, 41, 55, 0.8)',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.3s ease',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Minimum Facturation Checkbox */}
        <div style={{
          marginBottom: '20px',
          padding: '14px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#d1d5db',
            fontWeight: '500'
          }}>
            <input
              type="checkbox"
              checked={minimumFacturationApply}
              onChange={(e) => setMinimumFacturationApply(e.target.checked)}
              style={{
                cursor: 'pointer',
                width: '18px',
                height: '18px',
                accentColor: '#fbbf24'
              }}
            />
            <span>💰 Appliquer le minimum de facturation</span>
          </label>
          <small style={{
            color: '#9ca3af',
            marginTop: '8px',
            display: 'block',
            marginLeft: '28px'
          }}>
            Décochez si la durée réelle dépasse amplement le minimum et que vous souhaitez facturer sur la durée réelle
          </small>
        </div>

        {/* Info message */}
        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '24px',
          fontStyle: 'italic'
        }}>
          Le matériel passera en statut <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>EN MAINTENANCE</span> avec le motif "Retour Location, à vérifier"
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
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              border: '2px solid #3b82f6',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #60a5fa, #3b82f6)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #3b82f6, #2563eb)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✅ Valider le retour
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

export default ReturnModal;
