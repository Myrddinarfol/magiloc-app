// Service de cache intelligent avec expiration

const CACHE_KEY = 'magiloc-equipment-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

export const cacheService = {
  // Sauvegarder les données dans le cache
  set(data) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      version: '1.0'
    };
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      console.log('✅ Données mises en cache:', data.length, 'équipements');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la mise en cache:', error);
    }
  },

  // Récupérer les données du cache si elles sont valides
  get() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) {
        console.log('📭 Pas de cache disponible');
        return null;
      }

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      if (age > CACHE_DURATION) {
        console.log('⏰ Cache expiré (', Math.round(age / 1000), 's) - Suppression');
        this.clear();
        return null;
      }

      console.log('✅ Cache valide ! (', Math.round(age / 1000), 's) -', data.length, 'équipements');
      return data;
    } catch (error) {
      console.warn('⚠️ Erreur lors de la lecture du cache:', error);
      this.clear();
      return null;
    }
  },

  // Vérifier si le cache existe et est valide
  isValid() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return false;

      const { timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      return age <= CACHE_DURATION;
    } catch {
      return false;
    }
  },

  // Supprimer le cache
  clear() {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('🗑️ Cache supprimé');
    } catch (error) {
      console.warn('⚠️ Erreur lors de la suppression du cache:', error);
    }
  },

  // Obtenir l'âge du cache en secondes
  getAge() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const { timestamp } = JSON.parse(cached);
      return Math.round((Date.now() - timestamp) / 1000);
    } catch {
      return null;
    }
  }
};
