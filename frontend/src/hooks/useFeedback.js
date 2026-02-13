import { useContext } from 'react';
import { FeedbackContext } from '../context/FeedbackContext';

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback doit être utilisé avec FeedbackProvider');
  }
  return context;
};
