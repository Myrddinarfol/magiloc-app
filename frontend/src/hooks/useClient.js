import { useContext } from 'react';
import { ClientContext } from '../context/ClientContext';

export const useClient = () => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient doit être utilisé avec ClientProvider');
  }
  return context;
};
