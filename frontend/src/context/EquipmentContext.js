import React, { createContext, useState, useEffect, useContext } from 'react';
import { equipmentService } from '../services/equipmentService';
import { cacheService } from '../services/cacheService';
import { AuthContext } from './AuthContext';
import { LOADING_CONFIG } from '../config/constants';

export const EquipmentContext = createContext();

// Fonction pour transformer les noms snake_case en camelCase
const transformEquipmentData = (equipment) => {
  if (Array.isArray(equipment)) {
    return equipment.map(item => transformEquipmentData(item));
  }

  return {
    ...equipment,
    numeroSerie: equipment.numero_serie || equipment.numeroSerie,
    prixHT: equipment.prix_ht_jour || equipment.prixHT,
    minimumFacturation: equipment.minimum_facturation || equipment.minimumFacturation,
    minimumFacturationApply: equipment.minimum_facturation_apply !== undefined
      ? equipment.minimum_facturation_apply
      : equipment.minimumFacturationApply,
    idArticle: equipment.id_article || equipment.idArticle,
    cmu: equipment.cmu,
    modele: equipment.modele,
    marque: equipment.marque,
    longueur: equipment.longueur,
    etat: equipment.etat,
    certificat: equipment.certificat,
    infosComplementaires: equipment.infos_complementaires || equipment.infosComplementaires,
    debutLocation: equipment.debut_location || equipment.debutLocation,
    finLocationTheorique: equipment.fin_location_theorique || equipment.finLocationTheorique,
    renteLe: equipment.rentre_le || equipment.renteLe,
    numeroOffre: equipment.numero_offre || equipment.numeroOffre,
    notesLocation: equipment.notes_location || equipment.notesLocation,
    noteRetour: equipment.note_retour || equipment.noteRetour,
    motifMaintenance: equipment.motif_maintenance || equipment.motifMaintenance,
    debutMaintenance: equipment.debut_maintenance || equipment.debutMaintenance
  };
};

export const EquipmentProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [equipmentData, setEquipmentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Chargement des données...');
  const [retryCount, setRetryCount] = useState(0);

  // Fonction de chargement des équipements avec cache
  const loadEquipments = async (attemptNumber = 1, skipCache = false, forceRefresh = false) => {
    const { MAX_RETRIES, RETRY_DELAY, TIMEOUT } = LOADING_CONFIG;

    // 🚀 OPTIMISATION : Essayer d'abord le cache si ce n'est pas un rechargement forcé
    // forceRefresh = true force le chargement depuis l'API
    if (!skipCache && !forceRefresh && attemptNumber === 1) {
      let cachedData = cacheService.get();
      if (cachedData && cachedData.length > 0) {
        console.log('⚡ Chargement depuis le cache !');
        // Transformer les données (snake_case -> camelCase)
        cachedData = transformEquipmentData(cachedData);
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

      let data = await equipmentService.getAll();
      clearTimeout(timeoutId);

      console.log('✅ Données reçues:', data.length, 'équipements');

      // Transformer les données (snake_case -> camelCase)
      data = transformEquipmentData(data);

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
