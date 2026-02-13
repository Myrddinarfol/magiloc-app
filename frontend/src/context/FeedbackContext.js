import React, { createContext, useState, useCallback } from 'react';

export const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Récupérer tous les feedbacks
  const loadFeedbacks = useCallback(async (app = null) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = app ? `${API_URL}/api/feedbacks/${app}` : `${API_URL}/api/feedbacks`;
      console.log(`📡 Chargement feedbacks depuis: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Réponse HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Réponse non-JSON:', text.substring(0, 200));
        throw new Error('Réponse du serveur non JSON');
      }

      const data = await response.json();
      console.log('✅ Feedbacks chargés:', data);
      setFeedbacks(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur loadFeedbacks:', err.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  // Ajouter un feedback
  const addFeedback = useCallback(async (app, type, message) => {
    try {
      console.log(`📝 Envoi feedback: app=${app}, type=${type}`);
      const response = await fetch(`${API_URL}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app, type, message })
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorMessage = 'Erreur création feedback';
        try {
          if (contentType?.includes('application/json')) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const errorText = await response.text();
            console.error('❌ Réponse erreur non-JSON:', errorText.substring(0, 200));
            errorMessage = `HTTP ${response.status}: ${errorText.substring(0, 100)}`;
          }
        } catch (parseErr) {
          console.error('❌ Impossible de parser réponse erreur:', parseErr);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Feedback ajouté:', result.feedback);
      setFeedbacks([result.feedback, ...feedbacks]);
      return result.feedback;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur addFeedback:', err.message);
      throw err;
    }
  }, [feedbacks, API_URL]);

  // Mettre à jour status/priority
  const updateFeedback = useCallback(async (id, updates) => {
    try {
      console.log(`🔄 Mise à jour feedback ${id}:`, updates);
      const response = await fetch(`${API_URL}/api/feedbacks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
      const result = await response.json();
      console.log('✅ Feedback mis à jour:', result.feedback);
      setFeedbacks(feedbacks.map(f => f.id === id ? result.feedback : f));
      return result.feedback;
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur updateFeedback:', err.message);
      throw err;
    }
  }, [feedbacks, API_URL]);

  // Supprimer un feedback (soft delete)
  const deleteFeedback = useCallback(async (id) => {
    try {
      console.log(`🗑️ Suppression feedback ${id}`);
      const response = await fetch(`${API_URL}/api/feedbacks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Erreur HTTP ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }
      console.log('✅ Feedback supprimé');
      setFeedbacks(feedbacks.filter(f => f.id !== id));
    } catch (err) {
      setError(err.message);
      console.error('❌ Erreur deleteFeedback:', err.message);
      throw err;
    }
  }, [feedbacks, API_URL]);

  // Compter feedbacks non validés
  const getUnvalidatedCount = useCallback(() => {
    return feedbacks.filter(f => f.status === 'pending').length;
  }, [feedbacks]);

  return (
    <FeedbackContext.Provider value={{
      feedbacks,
      isLoading,
      error,
      loadFeedbacks,
      addFeedback,
      updateFeedback,
      deleteFeedback,
      getUnvalidatedCount
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};
