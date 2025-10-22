import React, { useState, useMemo } from 'react';
import { useUI } from '../../hooks/useUI';

const ExchangeModal = ({ show, equipment, equipmentData, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [exchangeReason, setExchangeReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDesignation, setFilterDesignation] = useState('');
  const [filterCMU, setFilterCMU] = useState('');
  const [filterLongueur, setFilterLongueur] = useState('');

  // Récupérer les options de filtres disponibles (matériels Sur Parc)
  const filterOptions = useMemo(() => {
    const surParcEquipment = equipmentData.filter(eq => eq.statut === 'Sur Parc');

    const designations = new Set();
    const cmus = new Set();
    const longueurs = new Set();

    surParcEquipment.forEach(eq => {
      if (eq.designation) designations.add(eq.designation);
      if (eq.cmu) cmus.add(eq.cmu);
      if (eq.longueur) longueurs.add(eq.longueur);
    });

    return {
      designations: Array.from(designations).sort(),
      cmus: Array.from(cmus).sort(),
      longueurs: Array.from(longueurs).sort()
    };
  }, [equipmentData]);

  // Filtrer les matériels disponibles (Sur Parc) avec filtres intelligents
  const availableEquipment = useMemo(() => {
    if (!equipment) return [];

    return equipmentData.filter(eq => {
      // Doit être sur parc
      if (eq.statut !== 'Sur Parc') return false;
      // Ne pas inclure l'équipement actuel
      if (eq.id === equipment.id) return false;

      // Appliquer les filtres
      if (filterDesignation && eq.designation !== filterDesignation) return false;
      if (filterCMU && eq.cmu !== filterCMU) return false;
      if (filterLongueur && eq.longueur !== filterLongueur) return false;

      // Filtre recherche par N° Série, modèle, désignation ou client
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!eq.numeroSerie.toLowerCase().includes(searchLower) &&
            !eq.modele.toLowerCase().includes(searchLower) &&
            !eq.designation.toLowerCase().includes(searchLower) &&
            !(eq.client && eq.client.toLowerCase().includes(searchLower))) {
          return false;
        }
      }
      return true;
    });
  }, [equipment, equipmentData, searchTerm, filterDesignation, filterCMU, filterLongueur]);

  const handleConfirm = () => {
    if (!selectedReplacement) {
      showToast('Veuillez sélectionner un matériel de remplacement', 'warning');
      return;
    }

    // Passer les données de remplacement avec le motif d'échange
    onConfirm({
      ...selectedReplacement,
      exchangeReason: exchangeReason.trim()
    });
    handleClose();
  };

  const handleClose = () => {
    setSelectedReplacement(null);
    setSearchTerm('');
    setExchangeReason('');
    setFilterDesignation('');
    setFilterCMU('');
    setFilterLongueur('');
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

          {/* Filtres intelligents - Même système que SUR PARC */}
          <div style={{
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <select
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '2px solid #1f2937',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '14px',
                minWidth: '200px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <option value="">Toutes les désignations</option>
              {filterOptions.designations?.map(designation => (
                <option key={designation} value={designation}>{designation}</option>
              ))}
            </select>

            <select
              value={filterCMU}
              onChange={(e) => setFilterCMU(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '2px solid #1f2937',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '14px',
                minWidth: '150px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <option value="">Toutes les CMU</option>
              {filterOptions.cmus?.map(cmu => (
                <option key={cmu} value={cmu}>{cmu}</option>
              ))}
            </select>

            <select
              value={filterLongueur}
              onChange={(e) => setFilterLongueur(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '2px solid #1f2937',
                backgroundColor: '#111827',
                color: 'white',
                fontSize: '14px',
                minWidth: '150px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              <option value="">Toutes les longueurs</option>
              {filterOptions.longueurs?.map(longueur => (
                <option key={longueur} value={longueur}>{longueur}</option>
              ))}
            </select>

            {(filterDesignation || filterCMU || filterLongueur) && (
              <button
                onClick={() => {
                  setFilterDesignation('');
                  setFilterCMU('');
                  setFilterLongueur('');
                }}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '2px solid #dc2626',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
              >
                ✕ Effacer filtres
              </button>
            )}
          </div>

          {/* Barre de recherche */}
          <div style={{marginBottom: '20px'}}>
            <input
              type="text"
              placeholder="Rechercher par désignation, modèle, n° série ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                color: '#fff',
                background: 'rgba(31, 41, 55, 0.8)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#64c8ff';
                e.target.style.boxShadow = '0 0 0 3px rgba(100, 200, 255, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Motif d'échange */}
          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px', fontWeight: '600'}}>
              📋 Motif d'Échange
            </label>
            <textarea
              placeholder="Exemple: Matériel défectueux, Calibration nécessaire, Usure..."
              value={exchangeReason}
              onChange={(e) => setExchangeReason(e.target.value)}
              className="form-input"
              rows="3"
              style={{width: '100%', fontFamily: 'inherit', resize: 'vertical'}}
            />
            <small style={{color: '#9ca3af', marginTop: '4px', display: 'block'}}>
              Décrivez le motif de cet échange
            </small>
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
