import React, { createContext, useState, useEffect, useCallback } from 'react';

/**
 * ThemeContext - Gestion centralisée du thème clair/sombre
 *
 * Fonctionnalités:
 * - Toggle thème clair/sombre
 * - Persistence via localStorage
 * - Application automatique via classe CSS sur body
 * - Callback pour réactions aux changements
 */

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Récupérer le thème depuis localStorage ou utiliser défaut 'dark'
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved || 'dark';
    } catch (e) {
      console.warn('Erreur lecture localStorage theme:', e);
      return 'dark';
    }
  });

  // Appliquer le thème au body quand il change
  useEffect(() => {
    try {
      const htmlElement = document.documentElement;
      const bodyElement = document.body;

      if (theme === 'light') {
        // Mode clair
        bodyElement.classList.add('light-theme');
        bodyElement.classList.remove('anthracite-theme', 'marine-theme');
        htmlElement.style.colorScheme = 'light';
      } else if (theme === 'anthracite') {
        // Mode anthracite
        bodyElement.classList.add('anthracite-theme');
        bodyElement.classList.remove('light-theme', 'marine-theme');
        htmlElement.style.colorScheme = 'dark';
      } else if (theme === 'marine') {
        // Mode marine
        bodyElement.classList.add('marine-theme');
        bodyElement.classList.remove('light-theme', 'anthracite-theme');
        htmlElement.style.colorScheme = 'dark';
      } else {
        // Mode sombre (défaut)
        bodyElement.classList.remove('light-theme', 'anthracite-theme', 'marine-theme');
        htmlElement.style.colorScheme = 'dark';
      }

      // Persister le choix
      localStorage.setItem('theme', theme);

      // Log pour debug
      const themeLabel = theme === 'light' ? '☀️ Clair' : theme === 'anthracite' ? '🪨 Anthracite' : theme === 'marine' ? '⚓ Marine' : '🌙 Sombre';
      console.log(`🎨 Thème changé: ${themeLabel}`);
    } catch (e) {
      console.error('Erreur application thème:', e);
    }
  }, [theme]);

  /**
   * Basculer entre thème clair et sombre
   */
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  /**
   * Définir un thème spécifique
   */
  const setThemeMode = useCallback((mode) => {
    if (mode === 'light' || mode === 'dark' || mode === 'anthracite' || mode === 'marine') {
      setTheme(mode);
    }
  }, []);

  /**
   * Vérifier si c'est le mode clair
   */
  const isLightTheme = theme === 'light';

  /**
   * Vérifier si c'est le mode sombre
   */
  const isDarkTheme = theme === 'dark';

  /**
   * Vérifier si c'est le mode anthracite
   */
  const isAnthraciteTheme = theme === 'anthracite';

  /**
   * Vérifier si c'est le mode marine
   */
  const isMarineTheme = theme === 'marine';

  const value = {
    theme,
    toggleTheme,
    setThemeMode,
    isLightTheme,
    isDarkTheme,
    isAnthraciteTheme,
    isMarineTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook personnalisé pour utiliser le ThemeContext
 */
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};
