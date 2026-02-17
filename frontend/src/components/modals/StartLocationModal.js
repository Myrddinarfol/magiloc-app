import React, { useState, useEffect } from 'react';
import { useUI } from '../../hooks/useUI';

const StartLocationModal = ({ show, equipment, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [startTime, setStartTime] = useState('');
  const [client, setClient] = useState('');
  const [finLocationTheorique, setFinLocationTheorique] = useState('');
  const [numeroOffre, setNumeroOffre] = useState('');
  const [notesLocation, setNotesLocation] = useState('');
  const [estPret, setEstPret] = useState(false);
  const [estLongDuree, setEstLongDuree] = useState(false);
  const [minimumFacturationApply, setMinimumFacturationApply] = useState(false);

  // Initialiser les données depuis equipment quand le modal s'ouvre
  useEffect(() => {
    if (show && equipment) {
      setStartDate(equipment.debutLocation || today);
      setClient(equipment.client || '');
      setFinLocationTheorique(equipment.finLocationTheorique || '');
      setNumeroOffre(equipment.numeroOffre || '');
      setNotesLocation(equipment.notesLocation || '');
      setEstPret(equipment.estPret === true || equipment.estPret === 1);
      setEstLongDuree(equipment.estLongDuree === true || equipment.estLongDuree === 1);
      setMinimumFacturationApply(equipment.minimumFacturationApply === true || equipment.minimumFacturationApply === 1);
      setStartTime('');
    }
  }, [show, equipment]);

  if (!show) return null;

  const validateStartDate = () => {
    if (!startDate) {
      showToast('Veuillez saisir la date de début de location', 'warning');
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (!validateStartDate()) {
      return;
    }
    // Passer les modifications au parent
    onConfirm(startDate, startTime, {
      client,
      finLocationTheorique,
      numeroOffre,
      notesLocation,
      estPret,
      estLongDuree,
      minimumFacturationApply
    });
    setStartDate(today);
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
        border: '3px solid #14b8a6',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '800px',
        width: '95%',
        maxHeight: '95vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.5)',
        animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}>
        {/* Icon */}
        <div style={{
          fontSize: '64px',
          textAlign: 'center',
          marginBottom: '15px',
          animation: 'bounce 0.6s ease-out'
        }}>
          🚀
        </div>

        {/* Title */}
        <h2 style={{
          color: '#14b8a6',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '15px'
        }}>
          Démarrer la location
        </h2>

        {/* Equipment info */}
        {equipment && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ color: '#fff', fontSize: '15px', fontWeight: 'bold', marginBottom: '6px' }}>
              {equipment.designation} {equipment.cmu}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px' }}>
              {equipment.marque} {equipment.modele}
            </div>
            <div style={{ color: '#9ca3af', fontSize: '13px', marginTop: '3px' }}>
              N° Série: {equipment.numeroSerie}
            </div>
          </div>
        )}

        {/* ===== RÉCAPITULATIF RÉSERVATION ===== */}
        <div style={{
          background: 'rgba(251, 191, 36, 0.05)',
          border: '2px solid rgba(251, 191, 36, 0.2)',
          borderRadius: '12px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <h3 style={{
            color: '#fbbf24',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📋 Récapitulatif de réservation
          </h3>

          {/* Grid 2 colonnes pour les infos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* CLIENT */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                CLIENT
              </label>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                {client || 'Non spécifié'}
              </div>
            </div>

            {/* N° OFFRE */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                N° OFFRE
              </label>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                {numeroOffre || 'Non spécifié'}
              </div>
            </div>

            {/* DÉBUT LOCATION */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                DÉBUT PRÉVUE
              </label>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                {equipment?.debutLocation || 'Non défini'}
              </div>
            </div>

            {/* FIN THÉORIQUE */}
            <div>
              <label style={{ display: 'block', color: '#d1d5db', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                FIN THÉORIQUE
              </label>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>
                {finLocationTheorique || 'Non défini'}
              </div>
            </div>
          </div>

          {/* FLAGS */}
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {estPret && (
              <span style={{
                background: 'rgba(168, 85, 247, 0.2)',
                color: '#a855f7',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid rgba(168, 85, 247, 0.3)'
              }}>
                🎁 Prêt
              </span>
            )}
            {estLongDuree && (
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#14b8a6',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                📊 Longue durée (-20%)
              </span>
            )}
            {minimumFacturationApply && (
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#3b82f6',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}>
                💵 Min facturation
              </span>
            )}
          </div>

          {notesLocation && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              background: 'rgba(156, 163, 175, 0.1)',
              borderRadius: '6px',
              borderLeft: '3px solid #fbbf24'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db', marginBottom: '4px' }}>
                📝 Notes
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {notesLocation}
              </div>
            </div>
          )}
        </div>

        {/* ===== INFOS DÉMARRAGE LOCATION ===== */}
        <div style={{ marginBottom: '15px' }}>
          <h3 style={{
            color: '#14b8a6',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            📅 Infos démarrage
          </h3>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'block',
                color: '#d1d5db',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Date de début <span style={{ color: '#f97316' }}>*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#fff',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6';
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
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                Heure d'enlèvement <span style={{ color: '#9ca3af', fontWeight: '400' }}>(opt.)</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  fontSize: '14px',
                  color: '#fff',
                  background: 'rgba(31, 41, 55, 0.8)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Info message */}
        <p style={{
          color: '#9ca3af',
          fontSize: '13px',
          textAlign: 'center',
          marginBottom: '15px',
          fontStyle: 'italic'
        }}>
          Le matériel passera en statut <span style={{ color: '#14b8a6', fontWeight: 'bold' }}>EN LOCATION</span>
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
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#9ca3af',
              background: 'linear-gradient(135deg, rgba(55, 65, 81, 0.6), rgba(31, 41, 55, 0.6))',
              border: '2px solid rgba(75, 85, 99, 0.8)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '130px'
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
              padding: '12px 24px',
              fontSize: '15px',
              fontWeight: 'bold',
              color: '#fff',
              background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
              border: '2px solid #14b8a6',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '130px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #34d399, #14b8a6)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(135deg, #14b8a6, #0d9488)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚀 Démarrer location
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
