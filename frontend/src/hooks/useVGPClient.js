import { useContext } from 'react';
import { VGPClientContext } from '../context/VGPClientContext';

export const useVGPClient = () => {
  const context = useContext(VGPClientContext);
  if (!context) {
    throw new Error('useVGPClient doit être utilisé avec VGPClientProvider');
  }
  return context;
};
