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

  // Récupérer les options de filtres intelligents et dépendants
  const filterOptions = useMemo(() => {
    const surParcEquipment = equipmentData.filter(eq => eq.statut === 'Sur Parc');

    // Récupérer tous les filtres disponibles initialement
    const allDesignations = new Set();
    const allCMUs = new Set();
    const allLongueurs = new Set();

    // Construire des maps pour les relations Designation -> CMU -> Longueur
    const designationToCMU = {}; // designation -> Set(cmu)
    const cmuToLongueur = {}; // cmu -> Set(longueur)
    const designationToLongueur = {}; // designation -> Set(longueur)

    surParcEquipment.forEach(eq => {
      if (eq.designation) {
        allDesignations.add(eq.designation);
        if (!designationToCMU[eq.designation]) designationToCMU[eq.designation] = new Set();
        if (!designationToLongueur[eq.designation]) designationToLongueur[eq.designation] = new Set();
      }
      if (eq.cmu) {
        allCMUs.add(eq.cmu);
        if (!cmuToLongueur[eq.cmu]) cmuToLongueur[eq.cmu] = new Set();
      }
      if (eq.longueur) allLongueurs.add(eq.longueur);

      // Construire les relations
      if (eq.designation && eq.cmu) {
        designationToCMU[eq.designation].add(eq.cmu);
      }
      if (eq.cmu && eq.longueur) {
        cmuToLongueur[eq.cmu].add(eq.longueur);
      }
      if (eq.designation && eq.longueur) {
        designationToLongueur[eq.designation].add(eq.longueur);
      }
    });

    // Déterminer les options disponibles basées sur les filtres actuels
    let availableDesignations = Array.from(allDesignations).sort();
    let availableCMUs = Array.from(allCMUs).sort();
    let availableLongueurs = Array.from(allLongueurs).sort();

    // Si une Désignation est sélectionnée, filtrer les CMU et Longueurs
    if (filterDesignation) {
      availableCMUs = Array.from(designationToCMU[filterDesignation] || []).sort();
      availableLongueurs = Array.from(designationToLongueur[filterDesignation] || []).sort();

      // Si CMU est aussi sélectionnée, affiner les Longueurs
      if (filterCMU && cmuToLongueur[filterCMU]) {
        availableLongueurs = Array.from(cmuToLongueur[filterCMU]).sort();
      }
    } else if (filterCMU) {
      // Si CMU sans Désignation, affiner les Longueurs
      availableLongueurs = Array.from(cmuToLongueur[filterCMU] || []).sort();
    }

    return {
      designations: availableDesignations,
      cmus: availableCMUs,
      longueurs: availableLongueurs
    };
  }, [equipmentData, filterDesignation, filterCMU]);

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

  const handleDesignationChange = (value) => {
    setFilterDesignation(value);
    // Réinitialiser CMU et Longueur quand on change la Désignation
    // car les anciennes valeurs peuvent ne pas être compatibles
    setFilterCMU('');
    setFilterLongueur('');
  };

  const handleCMUChange = (value) => {
    setFilterCMU(value);
    // Réinitialiser Longueur car elle dépend de la CMU
    setFilterLongueur('');
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
              onChange={(e) => handleDesignationChange(e.target.value)}
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
              onChange={(e) => handleCMUChange(e.target.value)}
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

          {/* Liste des matériels disponibles - Cartes enrichies */}
          <p style={{margin: '0 0 12px 0', fontSize: '13px', color: '#64c8ff', fontWeight: '600', textTransform: 'uppercase'}}>
            Matériels disponibles sur parc
          </p>
          {availableEquipment.length > 0 ? (
            <div style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '8px'}}>
              {availableEquipment.map(eq => (
                <div
                  key={eq.id}
                  onClick={() => setSelectedReplacement(eq)}
                  style={{
                    padding: '14px',
                    marginBottom: '10px',
                    backgroundColor: selectedReplacement?.id === eq.id
                      ? 'rgba(100, 200, 255, 0.15)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: selectedReplacement?.id === eq.id
                      ? '2px solid #64c8ff'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className={selectedReplacement?.id === eq.id ? 'exchange-item-selected' : ''}
                >
                  {/* Ligne 1: N° Série + État */}
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
                    <p style={{margin: '0', fontWeight: '700', color: '#fff', fontSize: '15px'}}>
                      🏷️ {eq.numeroSerie}
                    </p>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: eq.etat === 'Neuf' ? 'rgba(16, 185, 129, 0.2)' :
                                       eq.etat === 'Bon état' ? 'rgba(59, 130, 246, 0.2)' :
                                       eq.etat === 'À réviser' ? 'rgba(251, 191, 36, 0.2)' :
                                       'rgba(156, 163, 175, 0.2)',
                      color: eq.etat === 'Neuf' ? '#10b981' :
                             eq.etat === 'Bon état' ? '#3b82f6' :
                             eq.etat === 'À réviser' ? '#fbbf24' :
                             '#9ca3af'
                    }}>
                      {eq.etat || 'État inconnu'}
                    </span>
                  </div>

                  {/* Ligne 2: Marque + Modèle */}
                  <div style={{marginBottom: '8px', display: 'flex', gap: '12px'}}>
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>Marque</p>
                      <p style={{margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '500'}}>{eq.marque || 'N/A'}</p>
                    </div>
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>Modèle</p>
                      <p style={{margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '500'}}>{eq.modele || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Ligne 3: Longueur + CMU */}
                  <div style={{marginBottom: '8px', display: 'flex', gap: '12px'}}>
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>Longueur</p>
                      <p style={{margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '500'}}>{eq.longueur || 'N/A'}</p>
                    </div>
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>CMU</p>
                      <p style={{margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '500'}}>{eq.cmu || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Ligne 4: VGP + Étalonnage */}
                  <div style={{marginBottom: '8px', display: 'flex', gap: '12px'}}>
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>VGP</p>
                      <p style={{margin: '0', fontSize: '13px', color: eq.prochainVGP ? '#fbbf24' : '#d1d5db', fontWeight: '500'}}>
                        {eq.prochainVGP ? new Date(eq.prochainVGP).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                    <div style={{flex: 1}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>Étalonnage</p>
                      <p style={{margin: '0', fontSize: '13px', color: eq.prochainEtalonnage ? '#fbbf24' : '#d1d5db', fontWeight: '500'}}>
                        {eq.prochainEtalonnage ? new Date(eq.prochainEtalonnage).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Ligne 5: ID Article + Hauteur (si applicable) */}
                  {(eq.idArticle || eq.hauteur) && (
                    <div style={{marginBottom: '8px', display: 'flex', gap: '12px'}}>
                      {eq.idArticle && (
                        <div style={{flex: 1}}>
                          <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>ID Article</p>
                          <p style={{margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '500'}}>{eq.idArticle}</p>
                        </div>
                      )}
                      {eq.hauteur && (
                        <div style={{flex: 1}}>
                          <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>Hauteur</p>
                          <p style={{margin: '0', fontSize: '13px', color: '#d1d5db', fontWeight: '500'}}>{eq.hauteur}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Ligne 6: Observations */}
                  {eq.observations && (
                    <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)'}}>
                      <p style={{margin: '0 0 3px 0', fontSize: '11px', color: '#9ca3af', fontWeight: '600', textTransform: 'uppercase'}}>📝 Observations</p>
                      <p style={{margin: '0', fontSize: '12px', color: '#d1d5db', fontStyle: 'italic'}}>{eq.observations}</p>
                    </div>
                  )}
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
              <p>Aucun matériel disponible sur parc correspondant à vos critères</p>
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
