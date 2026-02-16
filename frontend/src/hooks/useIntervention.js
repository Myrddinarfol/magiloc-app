import { useContext } from 'react';
import { InterventionContext } from '../context/InterventionContext';

export const useIntervention = () => {
  const context = useContext(InterventionContext);
  if (!context) {
    throw new Error('useIntervention doit être utilisé avec InterventionProvider');
  }
  return context;
};
