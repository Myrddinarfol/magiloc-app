import React, { useState, useMemo } from 'react';
import { useUI } from '../../hooks/useUI';

const ExchangeModal = ({ show, equipment, equipmentData, onConfirm, onCancel }) => {
  const { showToast } = useUI();
  const [selectedReplacement, setSelectedReplacement] = useState(null);
  const [exchangeReason, setExchangeReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEtat, setFilterEtat] = useState(''); // Filtre par état
  const [filterMarque, setFilterMarque] = useState(''); // Filtre par marque

  // Récupérer les valeurs uniques pour les filtres
  const uniqueEtats = useMemo(() => {
    const etats = new Set();
    equipmentData.forEach(eq => {
      if (eq.statut === 'Sur Parc' && eq.designation === equipment?.designation && eq.cmu === equipment?.cmu) {
        if (eq.etat) etats.add(eq.etat);
      }
    });
    return Array.from(etats).sort();
  }, [equipment, equipmentData]);

  const uniqueMarques = useMemo(() => {
    const marques = new Set();
    equipmentData.forEach(eq => {
      if (eq.statut === 'Sur Parc' && eq.designation === equipment?.designation && eq.cmu === equipment?.cmu) {
        if (eq.marque) marques.add(eq.marque);
      }
    });
    return Array.from(marques).sort();
  }, [equipment, equipmentData]);

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
      // Filtre par état
      if (filterEtat && eq.etat !== filterEtat) return false;
      // Filtre par marque
      if (filterMarque && eq.marque !== filterMarque) return false;
      // Filtre recherche par N° Série ou modèle
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!eq.numeroSerie.toLowerCase().includes(searchLower) &&
            !eq.modele.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      return true;
    });
  }, [equipment, equipmentData, searchTerm, filterEtat, filterMarque]);

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
    setFilterEtat('');
    setFilterMarque('');
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

          {/* Recherche intelligente par filtres */}
          <div style={{marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(100, 150, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(100, 150, 255, 0.2)'}}>
            <p style={{margin: '0 0 12px 0', fontSize: '13px', color: '#64c8ff', fontWeight: '600', textTransform: 'uppercase'}}>
              🔍 Filtres de recherche
            </p>

            {/* Filtre par État */}
            <div style={{marginBottom: '12px'}}>
              <label style={{display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px', fontWeight: '600'}}>
                État
              </label>
              <select
                value={filterEtat}
                onChange={(e) => setFilterEtat(e.target.value)}
                className="form-input"
                style={{width: '100%', cursor: 'pointer'}}
              >
                <option value="">Tous les états</option>
                {uniqueEtats.map(etat => (
                  <option key={etat} value={etat}>{etat}</option>
                ))}
              </select>
            </div>

            {/* Filtre par Marque */}
            <div style={{marginBottom: '12px'}}>
              <label style={{display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px', fontWeight: '600'}}>
                Marque
              </label>
              <select
                value={filterMarque}
                onChange={(e) => setFilterMarque(e.target.value)}
                className="form-input"
                style={{width: '100%', cursor: 'pointer'}}
              >
                <option value="">Toutes les marques</option>
                {uniqueMarques.map(marque => (
                  <option key={marque} value={marque}>{marque}</option>
                ))}
              </select>
            </div>

            {/* Recherche par N° Série ou Modèle */}
            <div>
              <label style={{display: 'block', fontSize: '13px', color: '#d1d5db', marginBottom: '6px', fontWeight: '600'}}>
                Recherche
              </label>
              <input
                type="text"
                placeholder="Chercher par N° Série ou Modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{width: '100%'}}
              />
            </div>
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
