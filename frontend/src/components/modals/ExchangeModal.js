import React, { useState, useMemo } from 'react';
import { useUI } from '../../hooks/useUI';

const ExchangeModal = ({ show, equipment, equipmentData, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrer les matériels disponibles (Sur Parc) avec même désignation et CMU
  const availableEquipment = useMemo(() => {
    if (!equipment) return [];

    return equipmentData.filter(eq => {
      // Doit être sur parc
      if (eq.statut !== 'Sur Parc') return false;
      // Ne pas inclure l'équipement actuel
      if (eq.id === equipment.id) return false;
      // Même désignation
      if (eq.designation !== equipment.designation) return false;
      // Même CMU
      if (eq.cmu !== equipment.cmu) return false;
      // Filtre recherche si applicable
      if (searchTerm && !eq.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [equipment, equipmentData, searchTerm]);

  const handleConfirm = () => {
    if (!selectedReplacement) {
      showToast('Veuillez sélectionner un matériel de remplacement', 'warning');
      return;
    }

    onConfirm(selectedReplacement);
    handleClose();
  };

  const handleClose = () => {
    setSelectedReplacement(null);
    setSearchTerm('');
    onCancel();
  };

  if (!show || !equipment) return null;

  return (
    <div className="release-notes-overlay" onClick={handleClose}>
      <div className="exchange-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Échange de Matériel</h2>
          <button onClick={handleClose} className="close-button">✕</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Sélectionnez un matériel <strong>{equipment.designation} {equipment.cmu}</strong> disponible sur parc
          </p>

          {/* Équipement actuellement en location/réservation */}
          <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.3)'}}>
            <p style={{margin: '0 0 10px 0', fontSize: '13px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600'}}>
              Matériel en cours
            </p>
            <p style={{margin: '0', fontSize: '15px', fontWeight: '600', color: '#fff'}}>
              {equipment.designation} {equipment.cmu}
            </p>
            <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#9ca3af'}}>
              N° Série: <strong>{equipment.numeroSerie}</strong>
            </p>
          </div>

          {/* Recherche */}
          <div style={{marginBottom: '15px'}}>
            <input
              type="text"
              placeholder="Rechercher par N° Série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{width: '100%'}}
            />
          </div>

          {/* Liste des matériels disponibles */}
          {availableEquipment.length > 0 ? (
            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
              {availableEquipment.map(eq => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedReplacement(eq)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    backgroundColor: selectedReplacement?.id === eq.id
                      ? 'rgba(100, 200, 255, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedReplacement?.id === eq.id
                      ? '2px solid #64c8ff'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className={selectedReplacement?.id === eq.id ? 'exchange-item-selected' : ''}
                >
                  <p style={{margin: '0 0 6px 0', fontWeight: '600', color: '#fff'}}>
                    {eq.numeroSerie}
                  </p>
                  <p style={{margin: '0', fontSize: '13px', color: '#9ca3af'}}>
                    État: <strong>{eq.etat || 'Non défini'}</strong>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: '30px',
              textAlign: 'center',
              color: '#9ca3af',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px'
            }}>
              <p>Aucun matériel disponible sur parc pour cet équipement</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} className="btn btn-secondary">
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="btn btn-confirm"
            disabled={!selectedReplacement}
            style={{opacity: !selectedReplacement ? 0.5 : 1, cursor: !selectedReplacement ? 'not-allowed' : 'pointer'}}
          >
            ✅ Valider l'Échange
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExchangeModal;
