import React, { useState } from 'react';
import { useUI } from '../../hooks/useUI';

const StartLocationModal = ({ show, equipment, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState('');

  if (!show) return null;

  const validateStartDate = () => {
    if (!startDate) {
      showToast('Veuillez saisir la date de début de location', 'warning');
      return false;
    }
    // Validate that start date is not before the reservation date
    if (equipment?.debutLocationTheorique && startDate < equipment.debutLocationTheorique) {
      showToast('La date de début de location doit être après la date prévue', 'error');
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateStartDate()) {
      return;
    }
    onConfirm(startDate, startTime);
    setStartDate(today); // Reset pour la prochaine fois
    setStartTime('');
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
        border: '3px solid #10b981',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '20px',
          animation: 'bounce 0.6s ease-out'
        }}>
          🚀
        </div>

        {/* Title */}
        <h2 style={{
          color: '#10b981',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Démarrer la location
        </h2>

        {/* Equipment info */}
        {equipment && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
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
          </div>
        )}

        {/* Date et Heure input */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              color: '#d1d5db',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Date de début de location <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#fff',
                background: 'rgba(31, 41, 55, 0.8)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)';
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
              Heure d'enlèvement <span style={{ color: '#9ca3af', fontWeight: '400' }}>(optionnel)</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                color: '#fff',
                background: 'rgba(31, 41, 55, 0.8)',
                border: '2px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Info message */}
        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '24px',
          fontStyle: 'italic'
        }}>
          Le matériel passera en statut <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>EN LOCATION</span>
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => {
              setStartDate(today);
              onCancel();
            }}
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
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: '2px solid #10b981',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #34d399, #10b981)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #10b981, #059669)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Démarrer la location
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

export default StartLocationModal;
