import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import './FeedbackButtonsGroup.css';

const FeedbackButtonsGroup = ({ app }) => {
  const [showBugModal, setShowBugModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  return (
    <>
      <div className="feedback-buttons-group">
        <button
          className="feedback-btn-icon bug-btn"
          onClick={() => setShowBugModal(true)}
          title="Signaler un bug"
        >
          <span className="feedback-btn-icon-emoji">🐛</span>
          <span className="feedback-btn-icon-label">Bug</span>
        </button>
        <button
          className="feedback-btn-icon suggestion-btn"
          onClick={() => setShowSuggestionModal(true)}
          title="Suggérer une amélioration"
        >
          <span className="feedback-btn-icon-emoji">💡</span>
          <span className="feedback-btn-icon-label">Suggestion</span>
        </button>
      </div>

      {showBugModal && (
        <FeedbackModal
          app={app}
          type="bug"
          onClose={() => setShowBugModal(false)}
        />
      )}

      {showSuggestionModal && (
        <FeedbackModal
          app={app}
          type="suggestion"
          onClose={() => setShowSuggestionModal(false)}
        />
      )}
    </>
  );
};

export default FeedbackButtonsGroup;
