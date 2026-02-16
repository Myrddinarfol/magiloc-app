import React, { useState, useEffect } from 'react';
import { useVGPClient } from '../../../hooks/useVGPClient';
import { useIntervention } from '../../../hooks/useIntervention';
import { useUI } from '../../../hooks/useUI';
import './PlanifierInterventionModal.css';

const PlanifierInterventionModal = ({ onClose, intervention = null, isEditing = false }) => {
  const { clients, loadClients } = useVGPClient();
  const { clientSites, loadClientSites, addClientSite, addIntervention, updateIntervention } = useIntervention();
  const { showToast } = useUI();

  // Form state
  const [clientType, setClientType] = useState(intervention?.client_id ? 'existing' : 'new');
  const [selectedClient, setSelectedClient] = useState(intervention?.client_id || '');
  const [clientName, setClientName] = useState(intervention?.client_nom || '');
  const [selectedSite, setSelectedSite] = useState(intervention?.site_id || '');
  const [siteName, setSiteName] = useState(intervention?.site_nom || '');
  const [address, setAddress] = useState(intervention?.adresse_intervention || '');
  const [contactSite, setContactSite] = useState(intervention?.contact_site || '');
  const [date, setDate] = useState(intervention?.date_intervention || '');
  const [duration, setDuration] = useState(intervention?.duree_jours || 1);
  const [recommendations, setRecommendations] = useState(intervention?.recommandations || '');
  const [registerSite, setRegisterSite] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Load sites when client is selected
  useEffect(() => {
    if (clientType === 'existing' && selectedClient) {
      loadClientSites(selectedClient).catch(err => {
        console.error('Erreur chargement sites:', err);
      });
    }
  }, [clientType, selectedClient, loadClientSites]);

  // Pre-fill address when site is selected
  useEffect(() => {
    if (selectedSite && clientSites) {
      const site = clientSites.find(s => s.id === parseInt(selectedSite));
      if (site) {
        setAddress(site.adresse);
        setContactSite(site.contact_site || '');
        setSiteName(site.nom);
      }
    }
  }, [selectedSite, clientSites]);

  const validateForm = () => {
    const newErrors = {};

    if (clientType === 'existing' && !selectedClient) {
      newErrors.selectedClient = 'Veuillez sélectionner un client';
    }

    if (clientType === 'new' && !clientName.trim()) {
      newErrors.clientName = 'Veuillez entrer le nom du client';
    }

    if (!address.trim()) {
      newErrors.address = 'Adresse d\'intervention requise';
    }

    if (!date) {
      newErrors.date = 'Date d\'intervention requise';
    }

    if (!duration || duration <= 0) {
      newErrors.duration = 'Durée requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Veuillez remplir tous les champs requis', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let newSiteId = selectedSite ? parseInt(selectedSite) : null;

      // Register new site if checkbox is checked
      if (registerSite && clientType === 'existing' && selectedClient && (!selectedSite || selectedSite === 'other')) {
        if (!siteName.trim()) {
          showToast('Veuillez donner un nom au site', 'error');
          setIsSubmitting(false);
          return;
        }

        const newSite = await addClientSite({
          client_id: parseInt(selectedClient),
          nom: siteName,
          adresse: address,
          contact_site: contactSite || null
        });

        newSiteId = newSite.id;
        showToast('✅ Site enregistré pour ce client', 'success');
      }

      const interventionData = {
        client_id: clientType === 'existing' ? parseInt(selectedClient) : null,
        client_nom: clientType === 'new' ? clientName : null,
        site_id: newSiteId,
        site_nom: siteName || null,
        adresse_intervention: address,
        contact_site: contactSite || null,
        date_intervention: date,
        duree_jours: parseFloat(duration),
        recommandations: recommendations || null
      };

      if (isEditing && intervention) {
        await updateIntervention(intervention.id, interventionData);
        showToast('✅ Intervention mise à jour', 'success');
      } else {
        await addIntervention(interventionData);
        showToast('✅ Intervention planifiée avec succès', 'success');
      }

      onClose();
    } catch (err) {
      console.error('Erreur:', err);
      showToast(`Erreur: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="intervention-modal-overlay" onClick={onClose}>
      <div className="intervention-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="intervention-modal-header">
          <h2>{isEditing ? '✏️ Modifier intervention' : '🗓️ Planifier une intervention'}</h2>
          <button className="intervention-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="intervention-form">
          {/* CLIENT SELECTION */}
          <div className="form-group">
            <label>Client</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="clientType"
                  value="existing"
                  checked={clientType === 'existing'}
                  onChange={(e) => {
                    setClientType(e.target.value);
                    setClientName('');
                  }}
                />
                Client enregistré
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="clientType"
                  value="new"
                  checked={clientType === 'new'}
                  onChange={(e) => {
                    setClientType(e.target.value);
                    setSelectedClient('');
                    setSelectedSite('');
                  }}
                />
                Client ponctuel
              </label>
            </div>

            {clientType === 'existing' ? (
              <>
                <select
                  value={selectedClient}
                  onChange={(e) => {
                    setSelectedClient(e.target.value);
                    setSelectedSite('');
                    setAddress('');
                    setContactSite('');
                  }}
                  className={errors.selectedClient ? 'input-error' : ''}
                >
                  <option value="">— Sélectionner un client —</option>
                  {clients && clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
                {errors.selectedClient && <span className="error-text">{errors.selectedClient}</span>}
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nom du client"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={errors.clientName ? 'input-error' : ''}
                  disabled={isSubmitting}
                />
                {errors.clientName && <span className="error-text">{errors.clientName}</span>}
              </>
            )}
          </div>

          {/* SITE SELECTION (only for existing clients) */}
          {clientType === 'existing' && selectedClient && (
            <div className="form-group">
              <label>Site d'intervention</label>
              <select
                value={selectedSite}
                onChange={(e) => {
                  setSelectedSite(e.target.value);
                  if (e.target.value === 'other') {
                    setAddress('');
                    setContactSite('');
                    setSiteName('');
                  }
                }}
              >
                <option value="">— Sélectionner un site ou créer un nouveau —</option>
                {clientSites.map(site => (
                  <option key={site.id} value={site.id}>
                    {site.nom} - {site.adresse}
                  </option>
                ))}
                <option value="other">➕ Autre adresse / site ponctuel</option>
              </select>
            </div>
          )}

          {/* SITE NAME (show if creating new site) */}
          {clientType === 'existing' && selectedClient && (!selectedSite || selectedSite === 'other') && (
            <div className="form-group">
              <label>Nom du site</label>
              <input
                type="text"
                placeholder="Ex: Usine Paris, Chantier Lyon..."
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* ADDRESS */}
          <div className="form-group">
            <label>Adresse d'intervention *</label>
            <textarea
              placeholder="Adresse complète du site d'intervention"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={errors.address ? 'input-error' : ''}
              rows="3"
              disabled={isSubmitting}
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* CONTACT ON SITE */}
          <div className="form-group">
            <label>Contact sur site</label>
            <textarea
              placeholder="Nom, téléphone, email du contact sur place (un contact par ligne)"
              value={contactSite}
              onChange={(e) => setContactSite(e.target.value)}
              rows="3"
              disabled={isSubmitting}
            />
          </div>

          {/* DATE */}
          <div className="form-group">
            <label>Date d'intervention *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? 'input-error' : ''}
              disabled={isSubmitting}
            />
            {errors.date && <span className="error-text">{errors.date}</span>}
          </div>

          {/* DURATION */}
          <div className="form-group">
            <label>Durée prévue *</label>
            <div className="duration-buttons">
              {[0.5, 1, 1.5, 2, 3, 4, 5].map(d => (
                <button
                  key={d}
                  type="button"
                  className={`duration-btn ${duration === d ? 'active' : ''}`}
                  onClick={() => setDuration(d)}
                  disabled={isSubmitting}
                >
                  {d}j
                </button>
              ))}
            </div>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={duration}
              onChange={(e) => setDuration(parseFloat(e.target.value))}
              className="duration-input"
              disabled={isSubmitting}
            />
            {errors.duration && <span className="error-text">{errors.duration}</span>}
          </div>

          {/* RECOMMENDATIONS */}
          <div className="form-group">
            <label>Recommandations particulières</label>
            <textarea
              placeholder="Consignes spéciales, conditions de sécurité, matériel à apporter..."
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          {/* REGISTER SITE CHECKBOX */}
          {clientType === 'existing' && selectedClient && (!selectedSite || selectedSite === 'other') && address.trim() && (
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={registerSite}
                  onChange={(e) => setRegisterSite(e.target.checked)}
                  disabled={isSubmitting}
                />
                📌 Enregistrer ce site pour ce client
              </label>
            </div>
          )}

          {/* BUTTONS */}
          <div className="form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '⏳ Envoi...' : isEditing ? '✏️ Mettre à jour' : '✅ Planifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanifierInterventionModal;
