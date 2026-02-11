import React, { createContext, useState } from 'react';

/**
 * AppContext - Gestion du contexte applicatif
 * Gère le basculement entre deux applications :
 * - 'parc-loc' : Gestion du parc de location
 * - 'vgp-site' : Interventions VGP sur site client
 */

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [activeApp, setActiveApp] = useState(() => {
    try {
      return localStorage.getItem('activeApp') || null;
    } catch (e) {
      console.warn('Erreur lecture localStorage activeApp:', e);
      return null;
    }
  });

  const switchApp = (appName) => {
    if (appName === 'parc-loc' || appName === 'vgp-site' || appName === null) {
      try {
        if (appName === null) {
          localStorage.removeItem('activeApp');
        } else {
          localStorage.setItem('activeApp', appName);
        }
        setActiveApp(appName);
      } catch (e) {
        console.error('Erreur écriture localStorage activeApp:', e);
      }
    }
  };

  const resetAppSelection = () => {
    switchApp(null);
  };

  const value = {
    activeApp,
    switchApp,
    resetAppSelection,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé dans un AppProvider');
  }
  return context;
};
