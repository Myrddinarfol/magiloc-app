/**
 * Service d'authentification
 * Gère les tokens JWT
 */

const TOKEN_KEY = 'magiloc-auth-token';

export const authService = {
  /**
   * Obtient les en-têtes d'authentification avec le token Bearer
   */
  getAuthHeaders() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        'Authorization': `Bearer ${token}`
      };
    }
    return {};
  },

  /**
   * Ajoute les en-têtes d'authentification à un objet d'en-têtes existant
   */
  addAuthHeaders(headers = {}) {
    return {
      ...headers,
      ...this.getAuthHeaders()
    };
  },

  /**
   * Obtient le token brut (sans "Bearer ")
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Définit le token (utilisé par AuthContext)
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  /**
   * Supprime le token (logout)
   */
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('magiloc-token-expiry');
  },

  /**
   * Vérifie si un token existe et est valide
   */
  hasValidToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem('magiloc-token-expiry');
    return token && expiry && new Date().getTime() < parseInt(expiry);
  }
};
