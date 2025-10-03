import React from 'react';
import { releaseNotes, CURRENT_VERSION } from '../data/releaseNotes';
import { VERSION_KEY } from '../config/constants';
import { useUI } from '../hooks/useUI';

const ReleaseNotesPage = () => {
  const { setShowReleaseNotes } = useUI();
  const currentRelease = releaseNotes[0]; // La version la plus récente

  const handleAccept = () => {
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    setShowReleaseNotes(false);
  };

  return (
    <div className="release-notes-overlay">
      <div className="release-notes-modal">
        <div className="release-notes-header">
          <h2>🚀 MagiLoc v{CURRENT_VERSION} - Notes de mise à jour</h2>
          <p>Nouvelles fonctionnalités et améliorations</p>
        </div>

        <div className="release-notes-content">
          {currentRelease.sections.map((section, index) => (
            <div key={index} className="release-section">
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="release-notes-footer">
          <button onClick={handleAccept} className="btn btn-primary btn-lg">
            Continuer vers l'application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReleaseNotesPage;
