import { useContext } from 'react';
import { SparePartsContext } from '../context/SparePartsContext';

export const useSpareParts = () => {
  const context = useContext(SparePartsContext);
  if (!context) {
    throw new Error('useSpareParts doit être utilisé avec SparePartsProvider');
  }
  return context;
};
