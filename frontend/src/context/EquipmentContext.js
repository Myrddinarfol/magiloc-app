import React, { createContext, useState, useEffect, useContext } from 'react';
import { equipmentService } from '../services/equipmentService';
import { cacheService } from '../services/cacheService';
import { AuthContext } from './AuthContext';
import { LOADING_CONFIG } from '../config/constants';

export const EquipmentContext = createContext();

export const EquipmentProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [equipmentData, setEquipmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Chargement des données...');
  const [retryCount, setRetryCount] = useState(0);

  // Fonction de chargement des équipements avec cache
  const loadEquipments = async (attemptNumber = 1, skipCache = false) => {
    const { MAX_RETRIES, RETRY_DELAY, TIMEOUT } = LOADING_CONFIG;

    // 🚀 OPTIMISATION : Essayer d'abord le cache si ce n'est pas un rechargement forcé
    if (!skipCache && attemptNumber === 1) {
      const cachedData = cacheService.get();
      if (cachedData && cachedData.length > 0) {
        console.log('⚡ Chargement depuis le cache !');
        setEquipmentData(cachedData);
        setIsLoading(false);
        setLoadingMessage('Données chargées depuis le cache');

        // Rafraîchir en arrière-plan pour avoir les données à jour
        setTimeout(() => {
          console.log('🔄 Rafraîchissement en arrière-plan...');
          loadEquipmentsFromAPI(1, true);
        }, 100);

        return cachedData;
      }
    }

    return loadEquipmentsFromAPI(attemptNumber);
  };

  // Fonction de chargement depuis l'API
  const loadEquipmentsFromAPI = async (attemptNumber = 1, silent = false) => {
    const { MAX_RETRIES, RETRY_DELAY, TIMEOUT } = LOADING_CONFIG;

    try {
      console.log(`🔍 Tentative ${attemptNumber}/${MAX_RETRIES} - Chargement des équipements`);

      if (!silent) {
        if (attemptNumber === 1) {
          setLoadingMessage('Chargement des données...');
        } else if (attemptNumber <= 3) {
          setLoadingMessage('⏳ Le serveur démarre... (peut prendre 30 secondes)');
        } else {
          setLoadingMessage(`🔄 Nouvelle tentative ${attemptNumber}/${MAX_RETRIES}...`);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

      const data = await equipmentService.getAll();
      clearTimeout(timeoutId);

      console.log('✅ Données reçues:', data.length, 'équipements');

      // 💾 Sauvegarder dans le cache
      cacheService.set(data);

      setEquipmentData(data);
      setRetryCount(0);
      if (!silent) {
        setIsLoading(false);
      }
      return data;
    } catch (error) {
      console.error(`❌ Erreur tentative ${attemptNumber}:`, error.message);

      if (attemptNumber < MAX_RETRIES) {
        setRetryCount(attemptNumber);
        setTimeout(() => {
          loadEquipmentsFromAPI(attemptNumber + 1, silent);
        }, RETRY_DELAY);
      } else {
        console.error('💥 Échec après', MAX_RETRIES, 'tentatives');
        if (!silent) {
          setLoadingMessage('❌ Impossible de charger les données. Le serveur ne répond pas.');
          setEquipmentData([]);
          setIsLoading(false);
        }
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
