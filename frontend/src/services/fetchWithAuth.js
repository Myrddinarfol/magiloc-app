/**
 * Wrapper autour de fetch() qui ajoute automatiquement le token JWT
 * Utilisation: au lieu de fetch(url, options), utiliser fetchWithAuth(url, options)
 */

import { authService } from './authService';

export const fetchWithAuth = async (url, options = {}) => {
  // Fusionner les en-têtes du token avec les en-têtes existants
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...authService.getAuthHeaders()
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  // Si le serveur retourne 401 (token invalide), clear le token et laisser
  // l'application rediriger vers le login
  if (response.status === 401) {
    authService.clearToken();
    // Optionnel: notifier l'app qu'on doit se reconnecter
    // window.dispatchEvent(new CustomEvent('unauthorized'));
  }

  return response;
};
