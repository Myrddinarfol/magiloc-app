import React from 'react';

const CancelReservationModal = ({ show, equipment, onConfirm, onCancel }) => {
  if (!show) return null;

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
        border: '3px solid #dc2626',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(220, 38, 38, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '20px',
          animation: 'bounce 0.6s ease-out'
        }}>
          ⚠️
        </div>

        {/* Title */}
        <h2 style={{
          color: '#dc2626',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Annuler la réservation
        </h2>

        {/* Equipment info */}
        {equipment && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '2px solid rgba(220, 38, 38, 0.3)',
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

        {/* Message */}
        <p style={{
          color: '#d1d5db',
          fontSize: '16px',
          lineHeight: '1.6',
          textAlign: 'center',
          marginBottom: '30px',
          whiteSpace: 'pre-line'
        }}>
          Êtes-vous sûr de vouloir annuler cette réservation ?
          {'\n\n'}
          Le matériel sera remis <span style={{ color: '#10b981', fontWeight: 'bold' }}>SUR PARC</span>.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onCancel}
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
            ✕ Retour
          </button>

          <button
            onClick={onConfirm}
            style={{
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
              border: '2px solid #dc2626',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(220, 38, 38, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✓ Annuler la réservation
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

export default CancelReservationModal;
