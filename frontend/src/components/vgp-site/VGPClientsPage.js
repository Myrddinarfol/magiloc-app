import React, { useEffect, useState } from 'react';
import { useVGPClient } from '../../hooks/useVGPClient';
import { useUI } from '../../hooks/useUI';
import VGPPageHeader from './VGPPageHeader';
import './VGPClientsPage.css';

const VGPClientsPage = () => {
  const { clients, isLoading, loadClients, addClient, updateClient, deleteClient } = useVGPClient();
  const { showToast } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    contact_principal: '',
    notes: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClick = () => {
    setEditingClient(null);
    setFormData({
      nom: '',
      email: '',
      telephone: '',
      adresse: '',
      contact_principal: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditClick = (client) => {
    setEditingClient(client);
    setFormData(client);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleFormSubmit = async () => {
    if (!formData.nom.trim()) {
      showToast('Le nom du client est requis', 'error');
      return;
    }

    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        showToast('✅ Client mis à jour avec succès', 'success');
      } else {
        await addClient(formData);
        showToast('✅ Client ajouté avec succès', 'success');
      }
      handleModalClose();
    } catch (err) {
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  const handleDelete = (client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteClient(clientToDelete.id);
      showToast('✅ Client supprimé avec succès', 'success');
      setShowDeleteModal(false);
      setClientToDelete(null);
    } catch (err) {
      showToast(`❌ Erreur: ${err.message}`, 'error');
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setClientToDelete(null);
  };

  // Filtrer les clients par terme de recherche
  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone?.includes(searchTerm) ||
    client.contact_principal?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="vgp-clients-loading">Chargement des clients...</div>;
  }

  return (
    <div className="vgp-clients-page">
      <VGPPageHeader
        icon="👥"
        title="Gestion des Clients VGP"
        subtitle="ANNUAIRE VGP"
        description="Gérez vos contacts clients et leurs informations de contact pour les interventions de Grande Périodicité"
      />

      <div className="vgp-client-controls">
        <button className="btn btn-add" onClick={handleAddClick}>
          ➕ Ajouter un Client
        </button>
      </div>

      <div className="vgp-search-bar-container">
        <input
          type="text"
          className="vgp-search-bar-input"
          placeholder="🔍 Rechercher un client (nom, email, téléphone, contact)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="vgp-search-bar-clear"
            onClick={() => setSearchTerm('')}
            title="Effacer la recherche"
          >
            ✕
          </button>
        )}
      </div>

      {clients.length === 0 ? (
        <div className="vgp-empty-state">
          <p>Aucun client enregistré. Cliquez sur le bouton pour en ajouter un.</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="vgp-empty-state">
          <p>Aucun client ne correspond à votre recherche "{searchTerm}"</p>
        </div>
      ) : (
        <div className="vgp-clients-list">
          {filteredClients.map(client => (
            <div key={client.id} className="vgp-client-row">
              {/* Section Infos Compacte - GAUCHE */}
              <div className="vgp-client-info-compact">
                <div className="vgp-info-header">
                  <span className="vgp-icon-name">👤</span>
                  <span className="vgp-client-name">{client.nom}</span>
                </div>

                <div className="vgp-info-fields">
                  <div className="vgp-field-line">
                    <span className="vgp-field-icon">✉️</span>
                    <span className="vgp-field-value">{client.email || '-'}</span>
                  </div>
                  <div className="vgp-field-line">
                    <span className="vgp-field-icon">📞</span>
                    <span className="vgp-field-value">{client.telephone || '-'}</span>
                  </div>
                  <div className="vgp-field-line">
                    <span className="vgp-field-icon">📍</span>
                    <span className="vgp-field-value">{client.adresse || '-'}</span>
                  </div>
                  <div className="vgp-field-line">
                    <span className="vgp-field-icon">🔗</span>
                    <div className="vgp-contacts-compact">
                      {client.contact_principal ? (
                        client.contact_principal.split('\n').map((contact, idx) => (
                          <div key={idx} className="vgp-contact-badge">{contact.trim()}</div>
                        ))
                      ) : (
                        <span className="vgp-contacts-empty">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Capsule Notes - CENTRE */}
              <div className="vgp-client-notes-panel">
                <div className="vgp-notes-title">📝 Notes</div>
                <div className="vgp-notes-content">
                  {client.notes ? (
                    <p>{client.notes}</p>
                  ) : (
                    <p className="vgp-notes-empty">Aucune note</p>
                  )}
                </div>
              </div>

              {/* Panneau Actions - DROITE */}
              <div className="vgp-client-actions-panel">
                <button
                  className="vgp-action-button vgp-client-action-edit"
                  onClick={() => handleEditClick(client)}
                  title="Modifier les informations"
                >
                  ✎
                </button>
                <button
                  className="vgp-action-button vgp-client-action-delete"
                  onClick={() => handleDelete(client)}
                  title="Supprimer ce client"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter/Modifier Client */}
      {showModal && (
        <div className="vgp-modal-overlay" onClick={handleModalClose}>
          <div className="vgp-modal-content vgp-client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vgp-modal-header">
              <h2>{editingClient ? '✏️ Modifier Client' : '➕ Ajouter Client'}</h2>
              <button className="vgp-modal-close" onClick={handleModalClose}>✕</button>
            </div>
            <div className="vgp-modal-body">
              <div className="vgp-form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Nom du client"
                />
              </div>
              <div className="vgp-form-row">
                <div className="vgp-form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="vgp-form-group">
                  <label>Téléphone</label>
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>
              <div className="vgp-form-group">
                <label>Adresse</label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse complète"
                  rows="3"
                />
              </div>
              <div className="vgp-form-group">
                <label>Contacts (un par ligne)</label>
                <textarea
                  name="contact_principal"
                  value={formData.contact_principal}
                  onChange={handleInputChange}
                  placeholder="Ajouter un contact par ligne&#10;Exemple:&#10;Jean Dupont - Directeur&#10;Marie Martin - Assistante"
                  rows="4"
                />
                <small className="vgp-form-hint">Entrez un contact par ligne pour en ajouter plusieurs</small>
              </div>
              <div className="vgp-form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes additionnelles"
                  rows="3"
                />
              </div>
            </div>
            <div className="vgp-modal-footer">
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Annuler
              </button>
              <button className="btn btn-add" onClick={handleFormSubmit}>
                {editingClient ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suppression Client */}
      {showDeleteModal && clientToDelete && (
        <div className="vgp-modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="vgp-modal-content vgp-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="vgp-modal-header">
              <h2>⚠️ Confirmer la suppression</h2>
            </div>
            <div className="vgp-modal-body">
              <p>Êtes-vous sûr de vouloir supprimer le client <strong>{clientToDelete.nom}</strong> ?</p>
              <p className="vgp-delete-warning">Cette action est irréversible.</p>
            </div>
            <div className="vgp-modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseDeleteModal}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VGPClientsPage;
