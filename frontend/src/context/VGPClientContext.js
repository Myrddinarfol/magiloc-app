import React, { createContext, useState, useCallback } from 'react';

export const VGPClientContext = createContext();

export const VGPClientProvider = ({ children }) => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Récupérer tous les clients VGP
  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/vgp-clients`);
      if (!response.ok) throw new Error('Erreur chargement clients VGP');
      const data = await response.json();
      setClients(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadClients VGP:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Ajouter un client VGP
  const addClient = useCallback(async (clientData) => {
    try {
      const response = await fetch(`${API_URL}/api/vgp-clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur création client VGP');
      }
      const result = await response.json();
      setClients([...clients, result.client]);
      return result.client;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur addClient VGP:', err);
      throw err;
    }
  }, [clients, API_URL]);

  // Mettre à jour un client VGP
  const updateClient = useCallback(async (id, clientData) => {
    try {
      const response = await fetch(`${API_URL}/api/vgp-clients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur mise à jour client VGP');
      }
      const result = await response.json();
      setClients(clients.map(c => c.id === id ? result.client : c));
      return result.client;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur updateClient VGP:', err);
      throw err;
    }
  }, [clients, API_URL]);

  // Supprimer un client VGP
  const deleteClient = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/vgp-clients/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur suppression client VGP');
      }
      setClients(clients.filter(c => c.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur deleteClient VGP:', err);
      throw err;
    }
  }, [clients, API_URL]);

  // Récupérer un client spécifique
  const getClient = useCallback((id) => {
    return clients.find(c => c.id === id);
  }, [clients]);

  return (
    <VGPClientContext.Provider value={{
      clients,
      isLoading,
      error,
      loadClients,
      addClient,
      updateClient,
      deleteClient,
      getClient,
      setClients
    }}>
      {children}
    </VGPClientContext.Provider>
  );
};
