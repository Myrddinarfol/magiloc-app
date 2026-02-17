import React from 'react';

const ConfirmModal = ({
  show,
  title = 'Confirmation',
  message,
  icon = '❓',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmIcon = '✓',
  cancelIcon = '✕',
  onConfirm,
  onCancel,
  danger = false
}) => {
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
        border: `3px solid ${danger ? '#f97316' : '#fbbf24'}`,
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: `0 20px 60px ${danger ? 'rgba(220, 38, 38, 0.5)' : 'rgba(251, 191, 36, 0.5)'}, 0 0 100px ${danger ? 'rgba(220, 38, 38, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Icône d'alerte animée */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px',
            animation: 'bounce 2s ease-in-out infinite',
            filter: `drop-shadow(0 0 20px ${danger ? 'rgba(220, 38, 38, 0.6)' : 'rgba(251, 191, 36, 0.6)'})`
          }}>
            {icon}
          </div>
          <h2 style={{
            color: danger ? '#f97316' : '#fbbf24',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: `0 0 20px ${danger ? 'rgba(220, 38, 38, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`
          }}>
            {title}
          </h2>
        </div>

        {/* Message */}
        <div style={{
          background: `linear-gradient(135deg, ${danger ? 'rgba(220, 38, 38, 0.1)' : 'rgba(251, 191, 36, 0.1)'}, ${danger ? 'rgba(185, 28, 28, 0.2)' : 'rgba(217, 119, 6, 0.2)'})`,
          border: `2px solid ${danger ? 'rgba(220, 38, 38, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <p style={{
            color: '#f3f4f6',
            fontSize: '18px',
            lineHeight: '1.6',
            textAlign: 'center',
            margin: 0,
            whiteSpace: 'pre-line'
          }}>
            {message}
          </p>
        </div>

        {/* Boutons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '15px 35px',
              background: 'linear-gradient(135deg, #4b5563, #6b7280)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
            }}
          >
            {cancelIcon} {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '15px 35px',
              background: danger ? 'linear-gradient(135deg, #f97316, #991b1b)' : 'linear-gradient(135deg, #16a34a, #15803d)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: danger ? '0 4px 15px rgba(220, 38, 38, 0.5)' : '0 4px 15px rgba(22, 163, 74, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = danger ? '0 6px 30px rgba(220, 38, 38, 0.7)' : '0 6px 30px rgba(22, 163, 74, 0.7)';
              e.target.style.background = danger ? 'linear-gradient(135deg, #fb923c, #f97316)' : 'linear-gradient(135deg, #22c55e, #16a34a)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = danger ? '0 4px 15px rgba(220, 38, 38, 0.5)' : '0 4px 15px rgba(22, 163, 74, 0.5)';
              e.target.style.background = danger ? 'linear-gradient(135deg, #f97316, #991b1b)' : 'linear-gradient(135deg, #16a34a, #15803d)';
            }}
          >
            {confirmIcon} {confirmText}
          </button>
        </div>
      </div>

      {/* Animations CSS */}
      <style>{`
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
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmModal;
