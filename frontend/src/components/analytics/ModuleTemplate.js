import React from 'react';

/**
 * Template pour créer un module Analytics
 *
 * À copier et adapter pour chaque nouveau module
 */
const AnalyticsModuleTemplate = ({ title, description }) => {
  return (
    <div className="analytics-module">
      <div className="module-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="module-content">
        {/* Contenu du module ici */}
      </div>
    </div>
  );
};

export default AnalyticsModuleTemplate;
