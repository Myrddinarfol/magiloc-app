import React from 'react';
import { releaseNotes } from '../data/releaseNotes';

const ReleaseNotesHistory = ({ onClose }) => {
  return (
    <div className="release-notes-overlay">
      <div className="release-notes-modal history-modal">
        <div className="release-notes-header">
          <h2>📋 Historique des mises à jour</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <div className="release-notes-content history-content">
          {releaseNotes.map((release, index) => (
            <div key={release.version} className="release-version-block">
              <div className="version-header">
                <h3>
                  Version {release.version}
                  {index === 0 && <span className="current-badge">Actuelle</span>}
                </h3>
                <span className="version-date">{release.date}</span>
              </div>

              <h4 className="version-title">{release.title}</h4>

              {release.sections.map((section, sIdx) => (
                <div key={sIdx} className="release-section">
                  <h5>{section.title}</h5>
                  <ul>
                    {section.items.map((item, iIdx) => (
                      <li key={iIdx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}

              {index < releaseNotes.length - 1 && <hr className="version-separator" />}
            </div>
          ))}
        </div>

        <div className="release-notes-footer">
          <button onClick={onClose} className="btn btn-primary">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotesHistory;
