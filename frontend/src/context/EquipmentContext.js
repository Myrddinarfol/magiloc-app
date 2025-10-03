import React, { createContext, useState, useEffect, useContext } from 'react';
import { equipmentService } from '../services/equipmentService';
import { AuthContext } from './AuthContext';
import { LOADING_CONFIG } from '../config/constants';

export const EquipmentContext = createContext();

export const EquipmentProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [equipmentData, setEquipmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Chargement des données...');
  const [retryCount, setRetryCount] = useState(0);

  // Fonction de chargement des équipements
  const loadEquipments = async (attemptNumber = 1) => {
    const { MAX_RETRIES, RETRY_DELAY, TIMEOUT } = LOADING_CONFIG;

    try {
      console.log(`🔍 Tentative ${attemptNumber}/${MAX_RETRIES} - Chargement des équipements`);

      if (attemptNumber === 1) {
        setLoadingMessage('Chargement des données...');
      } else if (attemptNumber <= 3) {
        setLoadingMessage('⏳ Le serveur démarre... (peut prendre 30 secondes)');
      } else {
        setLoadingMessage(`🔄 Nouvelle tentative ${attemptNumber}/${MAX_RETRIES}...`);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const data = await equipmentService.getAll();
      clearTimeout(timeoutId);

      console.log('✅ Données reçues:', data.length, 'équipements');
      setEquipmentData(data);
      setRetryCount(0);
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error(`❌ Erreur tentative ${attemptNumber}:`, error.message);

      if (attemptNumber < MAX_RETRIES) {
        setRetryCount(attemptNumber);
        setTimeout(() => {
          loadEquipments(attemptNumber + 1);
        }, RETRY_DELAY);
      } else {
        console.error('💥 Échec après', MAX_RETRIES, 'tentatives');
        setLoadingMessage('❌ Impossible de charger les données. Le serveur ne répond pas.');
        setEquipmentData([]);
        setIsLoading(false);
      }
    }
  };

  // Chargement initial
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoading(true);
      loadEquipments();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Calcul des statistiques
  const stats = {
    total: equipmentData.length,
    enLocation: equipmentData.filter(eq => eq.statut === 'En Location').length,
    surParc: equipmentData.filter(eq => eq.statut === 'Sur Parc').length,
    enMaintenance: equipmentData.filter(eq => eq.statut === 'En Maintenance').length,
    enOffre: equipmentData.filter(eq => eq.statut === 'En Réservation').length
  };

  return (
    <EquipmentContext.Provider value={{
      equipmentData,
      setEquipmentData,
      isLoading,
      loadingMessage,
      retryCount,
      loadEquipments,
      stats
    }}>
      {children}
    </EquipmentContext.Provider>
  );
};
