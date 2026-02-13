import React, { useState } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import { useUI } from '../../hooks/useUI';
import './FeedbackModal.css';

const FeedbackModal = ({ app, type, onClose }) => {
  const { addFeedback } = useFeedback();
  const { showToast } = useUI();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = type === 'bug' ? '🐛 Signaler un Bug' : '💡 Suggérer une Amélioration';
  const placeholder = type === 'bug'
    ? 'Décrivez le bug en détail : quand il se produit, quel est le comportement attendu, etc.'
    : 'Partagez votre idée pour améliorer l\'application...';
  const buttonText = type === 'bug' ? 'Signaler le Bug' : 'Envoyer la Suggestion';
  const successMessage = type === 'bug'
    ? '✅ Bug reçu ! Merci pour ton signalement, nous l\'analyserons prochainement.'
    : '✅ Suggestion reçue ! Merci pour ton idée, nous l\'étudierons prochainement.';

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!message.trim()) {
      console.log('❌ Message vide');
      showToast('Veuillez écrire un message', 'error');
      return;
    }

    if (message.trim().length < 10) {
      console.log('❌ Message trop court');
      showToast('Le message doit faire au moins 10 caractères', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📤 Tentative de soumettre feedback...');
      await addFeedback(app, type, message);
      console.log('✅ Feedback soumis avec succès, affichage du toast');
      console.log('Message du toast:', successMessage);
      showToast(successMessage, 'success');
      setMessage('');
      setTimeout(() => onClose(), 500);
    } catch (err) {
      console.error('❌ Erreur lors de la soumission:', err);
      showToast(`❌ Erreur: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>{title}</h2>
          <button className="feedback-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-form-group">
            <label>Votre message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={placeholder}
              rows="6"
              disabled={isSubmitting}
            />
            <div className="feedback-char-count">
              {message.length}/500
            </div>
          </div>

          <div className="feedback-form-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`btn feedback-btn-submit ${type}`}
              disabled={isSubmitting || message.length < 10}
            >
              {isSubmitting ? '⏳ Envoi...' : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
