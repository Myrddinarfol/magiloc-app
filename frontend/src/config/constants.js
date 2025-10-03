// Clés pour le stockage local
export const STORAGE_KEY = 'magiloc-equipment-data';
export const AUTH_KEY = 'magiloc-authenticated';
export const VERSION_KEY = 'magiloc-last-seen-version';

// URL de l'API
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mot de passe
export const AUTH_PASSWORD = 'MAGILOC25';

// Configuration de chargement
export const LOADING_CONFIG = {
  MAX_RETRIES: 12,
  RETRY_DELAY: 5000,
  TIMEOUT: 10000
};
