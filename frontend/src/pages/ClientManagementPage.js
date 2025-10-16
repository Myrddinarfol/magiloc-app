import React, { useEffect, useState } from 'react';
import { useClient } from '../hooks/useClient';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';
import '../pages/ClientManagementPage.css';

const ClientManagementPage = () => {
  const { clients, isLoading, loadClients, addClient, updateClient, deleteClient } = useClient();
  const { equipmentData } = useEquipment();
  const { showToast } = useUI();
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
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

  const handleDelete = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await deleteClient(clientId);
        showToast('✅ Client supprimé avec succès', 'success');
      } catch (err) {
        showToast(`❌ Erreur: ${err.message}`, 'error');
      }
    }
  };

  // Extraire les clients uniques des réservations et locations
  const getUniqueClientsFromEquipment = () => {
    const clientsSet = new Set();
    const clientsList = [];

    equipmentData.forEach(eq => {
      // Ajouter les clients des réservations et locations en cours
      if ((eq.statut === 'En Réservation' || eq.statut === 'En Location') && eq.client && eq.client.trim()) {
        if (!clientsSet.has(eq.client.toLowerCase())) {
          clientsSet.add(eq.client.toLowerCase());
          clientsList.push(eq.client);
        }
      }
    });

    return clientsList;
  };

  // Importer les clients depuis les réservations et locations
  const handleImportClientsFromEquipment = async () => {
    const newClientsToImport = getUniqueClientsFromEquipment();
    const existingClientNames = clients.map(c => c.nom.toLowerCase());
    const clientsToAdd = newClientsToImport.filter(name => !existingClientNames.includes(name.toLowerCase()));

    if (clientsToAdd.length === 0) {
      showToast('✅ Tous les clients des réservations/locations sont déjà dans la base', 'info');
      return;
    }

    try {
      let addedCount = 0;
      for (const clientName of clientsToAdd) {
        try {
          await addClient({ nom: clientName.trim() });
          addedCount++;
        } catch (err) {
          console.error(`Erreur ajout client ${clientName}:`, err);
        }
      }

      showToast(`✅ ${addedCount} client${addedCount > 1 ? 's' : ''} importé${addedCount > 1 ? 's' : ''} avec succès`, 'success');
      await loadClients();
    } catch (err) {
      showToast(`❌ Erreur lors de l'import: ${err.message}`, 'error');
    }
  };

  if (isLoading) {
    return <div className="loading-state">Chargement des clients...</div>;
  }

  return (
    <div className="client-management-page">
      <PageHeader
        icon="👥"
        title="Gestion des Clients"
        subtitle="ANNUAIRE CLIENT"
        description="Gérez vos contacts clients, leurs informations de contact et leurs historiques de réservations"
      />

      <div className="client-controls">
        <button className="btn btn-primary" onClick={handleAddClick}>
          ➕ Ajouter un Client
        </button>
        <button
          className="btn btn-success"
          onClick={handleImportClientsFromEquipment}
          title="Importe automatiquement tous les clients présents dans les réservations et locations en cours"
        >
          📥 Importer des Réservations/Locations
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>Aucun client enregistré. Cliquez sur le bouton pour en ajouter un.</p>
        </div>
      ) : (
        <div className="clients-table-container">
          <table className="clients-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Contact Principal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td className="client-name">{client.nom}</td>
                  <td className="client-email">{client.email || '-'}</td>
                  <td className="client-phone">{client.telephone || '-'}</td>
                  <td className="client-contact">{client.contact_principal || '-'}</td>
                  <td className="actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEditClick(client)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(client.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Ajouter/Modifier Client */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? '✏️ Modifier Client' : '➕ Ajouter Client'}</h2>
              <button className="modal-close" onClick={handleModalClose}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nom *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  placeholder="Nom du client"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email@exemple.com"
                  />
                </div>
                <div className="form-group">
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
              <div className="form-group">
                <label>Adresse</label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse complète"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Contact Principal</label>
                <input
                  type="text"
                  name="contact_principal"
                  value={formData.contact_principal}
                  onChange={handleInputChange}
                  placeholder="Nom du contact"
                />
              </div>
              <div className="form-group">
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
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={handleModalClose}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleFormSubmit}>
                {editingClient ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagementPage;
