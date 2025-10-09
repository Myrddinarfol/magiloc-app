import React from 'react';

const DeleteConfirmModal = ({ equipment, onClose, onConfirm }) => {
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
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',
        border: '3px solid #dc2626',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(220, 38, 38, 0.5), 0 0 100px rgba(220, 38, 38, 0.3)',
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
            filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.6))'
          }}>
            🗑️
          </div>
          <h2 style={{
            color: '#dc2626',
            fontSize: '28px',
            fontWeight: 'bold',
            marginBottom: '15px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 20px rgba(220, 38, 38, 0.5)'
          }}>
            ⚠️ SUPPRESSION DÉFINITIVE
          </h2>
        </div>

        {/* Message */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.1), rgba(185, 28, 28, 0.2))',
          border: '2px solid rgba(220, 38, 38, 0.3)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <p style={{
            color: '#f3f4f6',
            fontSize: '18px',
            lineHeight: '1.6',
            textAlign: 'center',
            margin: 0
          }}>
            Êtes-vous sûr de vouloir supprimer définitivement le matériel
          </p>
          <p style={{
            color: '#fbbf24',
            fontSize: '22px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: '15px 0',
            textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
          }}>
            "{equipment?.designation} {equipment?.cmu}"
          </p>
          <p style={{
            color: '#f87171',
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: 'center',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            ⚠️ Cette action est irréversible !
          </p>
        </div>

        {/* Boutons */}
        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
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
              letterSpacing: '1px'
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
            ❌ Annuler
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '15px 35px',
              background: 'linear-gradient(135deg, #dc2626, #991b1b)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(220, 38, 38, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 6px 30px rgba(220, 38, 38, 0.7)';
              e.target.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 38, 38, 0.5)';
              e.target.style.background = 'linear-gradient(135deg, #dc2626, #991b1b)';
            }}
          >
            🗑️ Supprimer
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

export default DeleteConfirmModal;
