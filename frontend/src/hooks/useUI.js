import { useContext } from 'react';
import { UIContext } from '../context/UIContext';

// Hook personnalisé pour accéder facilement au contexte UI
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
