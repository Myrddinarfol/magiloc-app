import React, { useState, useEffect } from 'react';
import { useFeedback } from '../../hooks/useFeedback';
import './FeedbackPanel.css';

const FeedbackPanel = () => {
  const { feedbacks, loadFeedbacks, updateFeedback, deleteFeedback, getUnvalidatedCount } = useFeedback();
  const [isOpen, setIsOpen] = useState(false);
  const [unvalidatedCount, setUnvalidatedCount] = useState(0);
  const [expandedApps, setExpandedApps] = useState({ 'parc-loc': true, 'vgp-site': true });

  useEffect(() => {
    loadFeedbacks();
    updateUnvalidatedCount();
  }, []);

  useEffect(() => {
    updateUnvalidatedCount();
  }, [feedbacks]);

  const updateUnvalidatedCount = () => {
    const count = getUnvalidatedCount();
    setUnvalidatedCount(count);
  };

  const toggleApp = (app) => {
    setExpandedApps(prev => ({
      ...prev,
      [app]: !prev[app]
    }));
  };

  const handleValidate = (id) => {
    updateFeedback(id, { status: 'validated' });
  };

  const handleDelete = (id) => {
    deleteFeedback(id);
  };

  const handlePriority = (id, currentPriority) => {
    const priorities = ['low', 'medium', 'high'];
    const nextPriority = priorities[(priorities.indexOf(currentPriority) + 1) % priorities.length];
    updateFeedback(id, { priority: nextPriority });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#fb923c';
      case 'medium':
        return '#f59e0b';
      case 'low':
      default:
        return '#6b7280';
    }
  };

  const getAppName = (app) => {
    return app === 'parc-loc' ? 'MAGI-LOC' : 'MAGI-VGP';
  };

  const getTypeIcon = (type) => {
    return type === 'bug' ? '🔴' : '⭐';
  };

  const getTypeColor = (type) => {
    return type === 'bug' ? '#fb923c' : '#14b8a6';
  };

  const getAppIcon = (app) => {
    return app === 'parc-loc' ? '📦' : '🔍';
  };

  const getAppColor = (app) => {
    return app === 'parc-loc' ? '#f97316' : '#14b8a6';
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return '⏳ En attente';
      case 'validated':
        return '✅ Validé';
      case 'deleted':
        return '🗑️ Supprimé';
      default:
        return status;
    }
  };

  const getFeedbacksByApp = (app) => {
    return feedbacks.filter(f => f.app === app && f.status !== 'deleted');
  };

  const parcLocFeedbacks = getFeedbacksByApp('parc-loc');
  const vgpFeedbacks = getFeedbacksByApp('vgp-site');
  const totalFeedbacks = parcLocFeedbacks.length + vgpFeedbacks.length;

  return (
    <div className="feedback-panel-wrapper">
      <button
        className="feedback-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Panel de feedbacks"
      >
        <span className="feedback-toggle-icon">💬</span>
        {unvalidatedCount > 0 && (
          <span className="feedback-badge">{unvalidatedCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="feedback-panel">
          <div className="feedback-panel-header">
            <h3>Feedbacks & Suggestions</h3>
            <button
              className="feedback-panel-close"
              onClick={() => setIsOpen(false)}
              title="Fermer"
            >
              ✕
            </button>
          </div>

          <div className="feedback-panel-content">
            {totalFeedbacks === 0 ? (
              <div className="feedback-panel-empty">
                <div className="empty-icon">📭</div>
                <p>Aucun feedback pour le moment</p>
              </div>
            ) : (
              <>
                {/* MAGI-LOC Feedbacks */}
                <div className="feedback-app-section" style={{ borderTopColor: getAppColor('parc-loc') }}>
                  <button
                    className="feedback-app-header"
                    onClick={() => toggleApp('parc-loc')}
                    style={{ backgroundColor: `${getAppColor('parc-loc')}08` }}
                  >
                    <span className="feedback-app-toggle">
                      {expandedApps['parc-loc'] ? '▼' : '▶'}
                    </span>
                    <span className="feedback-app-icon">{getAppIcon('parc-loc')}</span>
                    <span className="feedback-app-name">MAGI-LOC</span>
                    <span className="feedback-app-count">{parcLocFeedbacks.length}</span>
                  </button>

                  {expandedApps['parc-loc'] && (
                    <div className="feedback-list">
                      {parcLocFeedbacks.length === 0 ? (
                        <div className="feedback-empty-app">
                          <p>Aucun feedback pour MAGI-LOC</p>
                        </div>
                      ) : (
                        parcLocFeedbacks.map(feedback => (
                          <div key={feedback.id} className="feedback-item">
                            <div className="feedback-item-header">
                              <span className="feedback-type" style={{ color: getTypeColor(feedback.type) }}>
                                {getTypeIcon(feedback.type)} {feedback.type === 'bug' ? 'Bug' : 'Suggestion'}
                              </span>
                              <span className="feedback-status" style={{ color: getTypeColor(feedback.type) }}>
                                {getStatusLabel(feedback.status)}
                              </span>
                            </div>

                            <div className="feedback-item-message">
                              {feedback.message}
                            </div>

                            <div className="feedback-item-footer">
                              <span className="feedback-date">
                                {formatDate(feedback.created_at)}
                              </span>
                              <span className="feedback-priority" style={{ backgroundColor: getPriorityColor(feedback.priority) }}>
                                {feedback.priority === 'low' ? 'Basse' : feedback.priority === 'medium' ? 'Moyenne' : 'Haute'} priorité
                              </span>
                            </div>

                            <div className="feedback-item-actions">
                              {feedback.status === 'pending' && (
                                <button
                                  className="feedback-action-btn validate"
                                  onClick={() => handleValidate(feedback.id)}
                                  title="Marquer comme validé"
                                >
                                  ✅
                                </button>
                              )}
                              <button
                                className="feedback-action-btn priority"
                                onClick={() => handlePriority(feedback.id, feedback.priority)}
                                title="Changer la priorité"
                              >
                                ⚡
                              </button>
                              <button
                                className="feedback-action-btn delete"
                                onClick={() => handleDelete(feedback.id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* VGP-SITE Feedbacks */}
                <div className="feedback-app-section" style={{ borderTopColor: getAppColor('vgp-site') }}>
                  <button
                    className="feedback-app-header"
                    onClick={() => toggleApp('vgp-site')}
                    style={{ backgroundColor: `${getAppColor('vgp-site')}08` }}
                  >
                    <span className="feedback-app-toggle">
                      {expandedApps['vgp-site'] ? '▼' : '▶'}
                    </span>
                    <span className="feedback-app-icon">{getAppIcon('vgp-site')}</span>
                    <span className="feedback-app-name">MAGI-VGP</span>
                    <span className="feedback-app-count">{vgpFeedbacks.length}</span>
                  </button>

                  {expandedApps['vgp-site'] && (
                    <div className="feedback-list">
                      {vgpFeedbacks.length === 0 ? (
                        <div className="feedback-empty-app">
                          <p>Aucun feedback pour MAGI-VGP</p>
                        </div>
                      ) : (
                        vgpFeedbacks.map(feedback => (
                          <div key={feedback.id} className="feedback-item">
                            <div className="feedback-item-header">
                              <span className="feedback-type" style={{ color: getTypeColor(feedback.type) }}>
                                {getTypeIcon(feedback.type)} {feedback.type === 'bug' ? 'Bug' : 'Suggestion'}
                              </span>
                              <span className="feedback-status" style={{ color: getTypeColor(feedback.type) }}>
                                {getStatusLabel(feedback.status)}
                              </span>
                            </div>

                            <div className="feedback-item-message">
                              {feedback.message}
                            </div>

                            <div className="feedback-item-footer">
                              <span className="feedback-date">
                                {formatDate(feedback.created_at)}
                              </span>
                              <span className="feedback-priority" style={{ backgroundColor: getPriorityColor(feedback.priority) }}>
                                {feedback.priority === 'low' ? 'Basse' : feedback.priority === 'medium' ? 'Moyenne' : 'Haute'} priorité
                              </span>
                            </div>

                            <div className="feedback-item-actions">
                              {feedback.status === 'pending' && (
                                <button
                                  className="feedback-action-btn validate"
                                  onClick={() => handleValidate(feedback.id)}
                                  title="Marquer comme validé"
                                >
                                  ✅
                                </button>
                              )}
                              <button
                                className="feedback-action-btn priority"
                                onClick={() => handlePriority(feedback.id, feedback.priority)}
                                title="Changer la priorité"
                              >
                                ⚡
                              </button>
                              <button
                                className="feedback-action-btn delete"
                                onClick={() => handleDelete(feedback.id)}
                                title="Supprimer"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
