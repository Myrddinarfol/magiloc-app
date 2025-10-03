import { useContext } from 'react';
import { EquipmentContext } from '../context/EquipmentContext';

// Hook personnalisé pour accéder facilement au contexte des équipements
export const useEquipment = () => {
  const context = useContext(EquipmentContext);
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
};
