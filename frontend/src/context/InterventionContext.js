import React, { createContext, useState, useCallback } from 'react';

export const InterventionContext = createContext();

export const InterventionProvider = ({ children }) => {
  const [interventions, setInterventions] = useState([]);
  const [clientSites, setClientSites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // =============================================
  // INTERVENTIONS
  // =============================================

  const loadInterventions = useCallback(async (filters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`📡 Chargement interventions depuis: ${API_URL}/api/vgp-interventions`);

      let url = `${API_URL}/api/vgp-interventions`;
      if (filters.statut) {
        url += `?statut=${filters.statut}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setInterventions(data);
      console.log(`✅ Interventions chargées: ${data.length}`);
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadInterventions:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const addIntervention = useCallback(async (interventionData) => {
    setError(null);
    try {
      console.log('📝 Envoi intervention:', interventionData);

      const response = await fetch(`${API_URL}/api/vgp-interventions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interventionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const newIntervention = await response.json();
      console.log('✅ Intervention ajoutée:', newIntervention);

      setInterventions(prev => [...prev, newIntervention]);
      return newIntervention;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur addIntervention:', err.message);
      throw err;
    }
  }, [API_URL]);

  const updateIntervention = useCallback(async (id, updates) => {
    setError(null);
    try {
      console.log(`✏️ Mise à jour intervention ${id}:`, updates);

      const response = await fetch(`${API_URL}/api/vgp-interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const updatedIntervention = await response.json();
      console.log('✅ Intervention mise à jour:', updatedIntervention);

      setInterventions(prev =>
        prev.map(i => i.id === id ? updatedIntervention : i)
      );

      return updatedIntervention;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur updateIntervention:', err.message);
      throw err;
    }
  }, [API_URL, interventions]);

  const deleteIntervention = useCallback(async (id) => {
    setError(null);
    try {
      console.log(`🗑️ Suppression intervention ${id}`);

      const response = await fetch(`${API_URL}/api/vgp-interventions/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log(`✅ Intervention ${id} supprimée`);

      setInterventions(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur deleteIntervention:', err.message);
      throw err;
    }
  }, [API_URL]);

  // =============================================
  // CLIENT SITES
  // =============================================

  const loadClientSites = useCallback(async (clientId) => {
    setError(null);
    try {
      console.log(`🏢 Chargement sites pour client ${clientId}`);

      const response = await fetch(`${API_URL}/api/vgp-client-sites?client_id=${clientId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setClientSites(data);
      console.log(`✅ Sites chargés: ${data.length}`);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadClientSites:', err.message);
      throw err;
    }
  }, [API_URL]);

  const addClientSite = useCallback(async (siteData) => {
    setError(null);
    try {
      console.log('📍 Création site:', siteData);

      const response = await fetch(`${API_URL}/api/vgp-client-sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const newSite = await response.json();
      console.log('✅ Site créé:', newSite);

      setClientSites(prev => [...prev, newSite]);
      return newSite;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur addClientSite:', err.message);
      throw err;
    }
  }, [API_URL]);

  const deleteClientSite = useCallback(async (id) => {
    setError(null);
    try {
      console.log(`🗑️ Suppression site ${id}`);

      const response = await fetch(`${API_URL}/api/vgp-client-sites/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      console.log(`✅ Site ${id} supprimé`);

      setClientSites(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur deleteClientSite:', err.message);
      throw err;
    }
  }, [API_URL]);

  return (
    <InterventionContext.Provider
      value={{
        interventions,
        clientSites,
        isLoading,
        error,
        loadInterventions,
        addIntervention,
        updateIntervention,
        deleteIntervention,
        loadClientSites,
        addClientSite,
        deleteClientSite
      }}
    >
      {children}
    </InterventionContext.Provider>
  );
};
