import React, { createContext, useState, useCallback } from 'react';

export const SparePartsContext = createContext();

export const SparePartsProvider = ({ children }) => {
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Récupérer toutes les pièces détachées
  const loadSpareParts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/spare-parts`);
      if (!response.ok) throw new Error('Erreur chargement pièces');
      const data = await response.json();
      setSpareParts(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadSpareParts:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Récupérer les pièces d'un équipement
  const loadEquipmentSpareParts = useCallback(async (equipmentId) => {
    try {
      const response = await fetch(`${API_URL}/api/equipment/${equipmentId}/spare-parts`);
      if (!response.ok) throw new Error('Erreur chargement pièces équipement');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadEquipmentSpareParts:', err);
      return [];
    }
  }, [API_URL]);

  // Ajouter une pièce détachée
  const addSparePart = useCallback(async (partData) => {
    try {
      const response = await fetch(`${API_URL}/api/spare-parts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur création pièce');
      }
      const result = await response.json();
      setSpareParts([...spareParts, result.sparePart]);
      return result.sparePart;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur addSparePart:', err);
      throw err;
    }
  }, [spareParts, API_URL]);

  // Mettre à jour une pièce détachée
  const updateSparePart = useCallback(async (id, partData) => {
    try {
      const response = await fetch(`${API_URL}/api/spare-parts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur mise à jour pièce');
      }
      const result = await response.json();
      setSpareParts(spareParts.map(p => p.id === id ? result.sparePart : p));
      return result.sparePart;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur updateSparePart:', err);
      throw err;
    }
  }, [spareParts, API_URL]);

  // Supprimer une pièce détachée
  const deleteSparePart = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/spare-parts/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur suppression pièce');
      }
      setSpareParts(spareParts.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur deleteSparePart:', err);
      throw err;
    }
  }, [spareParts, API_URL]);

  // Enregistrer l'utilisation d'une pièce
  const recordPartUsage = useCallback(async (id, usageData) => {
    try {
      const response = await fetch(`${API_URL}/api/spare-parts/${id}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usageData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur enregistrement utilisation');
      }
      const result = await response.json();
      return result.usage;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur recordPartUsage:', err);
      throw err;
    }
  }, [API_URL]);

  // Récupérer l'historique d'utilisation d'une pièce
  const loadPartUsageHistory = useCallback(async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/spare-parts/${id}/usage`);
      if (!response.ok) throw new Error('Erreur chargement historique utilisation');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadPartUsageHistory:', err);
      return [];
    }
  }, [API_URL]);

  // Récupérer une pièce spécifique
  const getSparePart = useCallback((id) => {
    return spareParts.find(p => p.id === id);
  }, [spareParts]);

  return (
    <SparePartsContext.Provider value={{
      spareParts,
      isLoading,
      error,
      loadSpareParts,
      loadEquipmentSpareParts,
      addSparePart,
      updateSparePart,
      deleteSparePart,
      recordPartUsage,
      loadPartUsageHistory,
      getSparePart,
      setSpareParts
    }}>
      {children}
    </SparePartsContext.Provider>
  );
};
