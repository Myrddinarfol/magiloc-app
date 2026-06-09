import React, { useState, useEffect } from 'react';
import { useIntervention } from '../../hooks/useIntervention';
import { useUI } from '../../hooks/useUI';
import AddEquipmentModal from './modals/AddEquipmentModal';
import AddPartModal from './modals/AddPartModal';
import './VGPExecutionPage.css';

const VGPExecutionPage = ({ interventionId, onExit }) => {
  const { interventions, loadExecution, saveExecution, updateIntervention } = useIntervention();
  const { showToast } = useUI();

  // State - Intervention data
  const [intervention, setIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // State - Time tracking
  const [heureDebut, setHeureDebut] = useState('');
  const [heureFin, setHeureFin] = useState('');

  // State - Equipment checklist
  const [equipements, setEquipements] = useState([]);
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);

  // State - Parts changed
  const [pieces, setPieces] = useState([]);
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  // State - Observations
  const [observations, setObservations] = useState([]);
  const [newObservation, setNewObservation] = useState('');
  const [obsType, setObsType] = useState('info');

  // State - Save tracking
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load intervention and execution data on mount
  useEffect(() => {
    loadData();
  }, [interventionId]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges && !isSaving) {
        handleSaveDraft();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hasChanges, isSaving, heureDebut, heureFin, equipements, pieces, observations]);

  // Track changes
  useEffect(() => {
    setHasChanges(true);
  }, [heureDebut, heureFin, equipements, pieces, observations]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load intervention details from context
      const foundIntervention = interventions.find(i => i.id === parseInt(interventionId));
      if (foundIntervention) {
        setIntervention(foundIntervention);
      } else {
        setIntervention({
          id: interventionId,
          client_nom: '(Chargement...)',
          site_nom: '(Chargement...)',
          nature_intervention: ''
        });
      }

      // Try to load existing execution data
      try {
        const existingExecution = await loadExecution(interventionId);
        if (existingExecution) {
          setHeureDebut(existingExecution.heure_debut || '');
          setHeureFin(existingExecution.heure_fin || '');
          setEquipements(Array.isArray(existingExecution.equipements_controles) ? existingExecution.equipements_controles : []);
          setPieces(Array.isArray(existingExecution.pieces_changees) ? existingExecution.pieces_changees : []);
          setObservations(Array.isArray(existingExecution.observations) ? existingExecution.observations : []);
        }
      } catch (err) {
        // No existing execution, start fresh
        console.log('Nouvelle exécution');
      }

      setHasChanges(false);
    } catch (err) {
      showToast(`Erreur chargement: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const calculateDuration = (debut, fin) => {
    if (!debut || !fin) return '—';

    const [h1, m1] = debut.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);

    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMinutes < 0) return '—';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h${String(minutes).padStart(2, '0')}`;
  };

  const calculateDurationHours = (debut, fin) => {
    if (!debut || !fin) return null;

    const [h1, m1] = debut.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);

    const totalMinutes = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (totalMinutes < 0) return null;

    return parseFloat((totalMinutes / 60).toFixed(1));
  };

  const calculatePartsTotal = () => {
    return pieces.reduce((sum, part) => sum + (part.quantite * (part.cout_unitaire || 0)), 0).toFixed(2);
  };

  // Equipment handlers
  const handleAddEquipment = (equipmentData) => {
    const newEquipment = {
      id: Date.now().toString(),
      ...equipmentData,
      timestamp: new Date().toISOString()
    };
    setEquipements([...equipements, newEquipment]);
    setShowAddEquipmentModal(false);
  };

  const removeEquipment = (equipmentId) => {
    setEquipements(equipements.filter(eq => eq.id !== equipmentId));
  };

  const updateEquipmentStatus = (equipmentId, status) => {
    setEquipements(equipements.map(eq =>
      eq.id === equipmentId ? { ...eq, statut: status } : eq
    ));
  };

  const updateEquipmentObservations = (equipmentId, observations) => {
    setEquipements(equipements.map(eq =>
      eq.id === equipmentId ? { ...eq, observations } : eq
    ));
  };

  // Parts handlers
  const handleAddPart = (partData) => {
    const newPart = {
      id: Date.now().toString(),
      ...partData,
      timestamp: new Date().toISOString()
    };
    setPieces([...pieces, newPart]);
    setShowAddPartModal(false);
  };

  const removePart = (partId) => {
    setPieces(pieces.filter(part => part.id !== partId));
  };

  // Observations handlers
  const handleAddObservation = () => {
    if (!newObservation.trim()) {
      showToast('⚠️ Veuillez entrer une observation', 'warning');
      return;
    }

    const observation = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      texte: newObservation,
      type: obsType
    };

    setObservations([observation, ...observations]);
    setNewObservation('');
  };

  const removeObservation = (obsId) => {
    setObservations(observations.filter(obs => obs.id !== obsId));
  };

  // Save handlers
  const handleSaveDraft = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      await saveExecution(interventionId, {
        heure_debut: heureDebut,
        heure_fin: heureFin,
        duree_effective_heures: calculateDurationHours(heureDebut, heureFin),
        equipements_controles: equipements,
        pieces_changees: pieces,
        observations: observations,
        brouillon: true
      });

      setHasChanges(false);
      showToast('💾 Brouillon enregistré', 'success');
    } catch (err) {
      showToast(`❌ Erreur sauvegarde: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    // Validation
    if (!heureDebut || !heureFin) {
      showToast('⚠️ Veuillez renseigner les horaires', 'warning');
      return;
    }

    try {
      setIsSaving(true);

      // Save execution as final
      await saveExecution(interventionId, {
        heure_debut: heureDebut,
        heure_fin: heureFin,
        duree_effective_heures: calculateDurationHours(heureDebut, heureFin),
        equipements_controles: equipements,
        pieces_changees: pieces,
        observations: observations,
        brouillon: false
      });

      // Update intervention status to 'terminee'
      await updateIntervention(interventionId, { statut: 'terminee' });

      showToast('✅ Intervention terminée !', 'success');
      onExit();
    } catch (err) {
      showToast(`❌ Erreur: ${err.message}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="execution-page-loading">
        <div className="spinner">⏳</div>
        <p>Chargement intervention...</p>
      </div>
    );
  }

  return (
    <div className="execution-page-container">
      {/* Sticky Header */}
      <div className="execution-header">
        <div className="execution-info">
          <h2>🔧 Intervention en cours</h2>
          <div className="intervention-details">
            {intervention && (
              <>
                <span>Client: <strong>{intervention.client_nom}</strong></span>
                <span>Site: <strong>{intervention.site_nom}</strong></span>
                {intervention.nature_intervention && (
                  <span>Nature: <strong>{intervention.nature_intervention}</strong></span>
                )}
              </>
            )}
          </div>
        </div>

        <div className="execution-actions">
          <button
            className="btn btn-secondary"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            {isSaving ? '⏳ Enregistrement...' : '💾 Brouillon'}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={isSaving}
          >
            {isSaving ? '⏳ Finition...' : '✅ Terminer'}
          </button>
          <button
            className="btn btn-gray"
            onClick={onExit}
            disabled={isSaving}
          >
            ← Retour
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="execution-content">
        {/* Section: Horaires & Durée */}
        <div className="execution-section">
          <h3>⏰ Horaires & Durée Effective</h3>
          <div className="time-inputs">
            <div className="form-group">
              <label>Heure de début</label>
              <div className="time-input-group">
                <input
                  type="time"
                  value={heureDebut}
                  onChange={(e) => setHeureDebut(e.target.value)}
                />
                <button
                  className="btn-now"
                  onClick={() => setHeureDebut(getCurrentTime())}
                  title="Remplir avec l'heure actuelle"
                >
                  Maintenant
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Heure de fin</label>
              <div className="time-input-group">
                <input
                  type="time"
                  value={heureFin}
                  onChange={(e) => setHeureFin(e.target.value)}
                />
                <button
                  className="btn-now"
                  onClick={() => setHeureFin(getCurrentTime())}
                  title="Remplir avec l'heure actuelle"
                >
                  Maintenant
                </button>
              </div>
            </div>

            <div className="duration-display">
              <label>Durée effective</label>
              <div className="duration-value">{calculateDuration(heureDebut, heureFin)}</div>
            </div>
          </div>
        </div>

        {/* Section: Équipements Contrôlés */}
        <div className="execution-section">
          <h3>🔍 Équipements Contrôlés</h3>
          <button
            className="btn btn-primary btn-add"
            onClick={() => setShowAddEquipmentModal(true)}
          >
            + Ajouter équipement
          </button>

          <div className="equipements-list">
            {equipements.length === 0 ? (
              <p className="empty-message">Aucun équipement ajouté pour le moment</p>
            ) : (
              equipements.map(eq => (
                <div key={eq.id} className="equipment-item">
                  <div className="equipment-header">
                    <div className="equipment-title">
                      <strong>{eq.designation}</strong>
                      {eq.cmu && <span className="cmu">{eq.cmu}</span>}
                    </div>
                    {eq.numero_serie && (
                      <span className="serial">Série: {eq.numero_serie}</span>
                    )}
                    <button
                      className="btn-remove"
                      onClick={() => removeEquipment(eq.id)}
                      title="Supprimer cet équipement"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="status-buttons">
                    <button
                      className={`status-btn conforme ${eq.statut === 'conforme' ? 'active' : ''}`}
                      onClick={() => updateEquipmentStatus(eq.id, 'conforme')}
                    >
                      ✅ Conforme
                    </button>
                    <button
                      className={`status-btn non-conforme ${eq.statut === 'non_conforme' ? 'active' : ''}`}
                      onClick={() => updateEquipmentStatus(eq.id, 'non_conforme')}
                    >
                      ⚠️ Non conforme
                    </button>
                    <button
                      className={`status-btn a-remplacer ${eq.statut === 'a_remplacer' ? 'active' : ''}`}
                      onClick={() => updateEquipmentStatus(eq.id, 'a_remplacer')}
                    >
                      🔴 À remplacer
                    </button>
                  </div>

                  <textarea
                    placeholder="Observations sur cet équipement..."
                    value={eq.observations || ''}
                    onChange={(e) => updateEquipmentObservations(eq.id, e.target.value)}
                    rows="2"
                    className="equipment-notes"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section: Pièces Changées */}
        <div className="execution-section">
          <h3>🔧 Pièces Changées</h3>
          <button
            className="btn btn-primary btn-add"
            onClick={() => setShowAddPartModal(true)}
          >
            + Ajouter pièce
          </button>

          {pieces.length === 0 ? (
            <p className="empty-message">Aucune pièce changée pour le moment</p>
          ) : (
            <div className="parts-table-wrapper">
              <table className="parts-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Désignation</th>
                    <th>Qté</th>
                    <th>Prix U.</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {pieces.map(part => (
                    <tr key={part.id}>
                      <td>{part.reference}</td>
                      <td>{part.designation}</td>
                      <td className="qty">{part.quantite}</td>
                      <td className="price">{part.cout_unitaire}€</td>
                      <td className="total">{(part.quantite * part.cout_unitaire).toFixed(2)}€</td>
                      <td>
                        <button
                          className="btn-remove-small"
                          onClick={() => removePart(part.id)}
                          title="Supprimer cette pièce"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4"><strong>Total</strong></td>
                    <td><strong>{calculatePartsTotal()}€</strong></td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Section: Observations */}
        <div className="execution-section">
          <h3>📝 Observations & Notes</h3>

          <div className="add-observation">
            <textarea
              placeholder="Ajouter une nouvelle observation..."
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              rows="3"
              className="obs-textarea"
            />
            <div className="obs-actions">
              <div className="obs-type-buttons">
                <button
                  className={`type-btn info ${obsType === 'info' ? 'active' : ''}`}
                  onClick={() => setObsType('info')}
                  title="Information générale"
                >
                  ℹ️ Info
                </button>
                <button
                  className={`type-btn warning ${obsType === 'warning' ? 'active' : ''}`}
                  onClick={() => setObsType('warning')}
                  title="Attention requise"
                >
                  ⚠️ Attention
                </button>
                <button
                  className={`type-btn critical ${obsType === 'critical' ? 'active' : ''}`}
                  onClick={() => setObsType('critical')}
                  title="Problème critique"
                >
                  🔴 Critique
                </button>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleAddObservation}
              >
                Ajouter
              </button>
            </div>
          </div>

          <div className="observations-timeline">
            {observations.length === 0 ? (
              <p className="empty-message">Aucune observation pour le moment</p>
            ) : (
              observations.map(obs => (
                <div key={obs.id} className={`observation-item ${obs.type}`}>
                  <div className="obs-header">
                    <span className="obs-icon">
                      {obs.type === 'info' ? 'ℹ️' : obs.type === 'warning' ? '⚠️' : '🔴'}
                    </span>
                    <span className="obs-time">
                      {new Date(obs.timestamp).toLocaleTimeString('fr-FR')}
                    </span>
                    <button
                      className="btn-remove-obs"
                      onClick={() => removeObservation(obs.id)}
                      title="Supprimer cette observation"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="obs-text">{obs.texte}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Spacer for sticky footer */}
        <div className="execution-spacer"></div>
      </div>

      {/* Modals */}
      {showAddEquipmentModal && (
        <AddEquipmentModal
          onClose={() => setShowAddEquipmentModal(false)}
          onAdd={handleAddEquipment}
        />
      )}

      {showAddPartModal && (
        <AddPartModal
          onClose={() => setShowAddPartModal(false)}
          onAdd={handleAddPart}
        />
      )}
    </div>
  );
};

export default VGPExecutionPage;
