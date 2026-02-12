import React from 'react';
import './VGPPageHeader.css';

const VGPPageHeader = ({ icon, title, subtitle, description }) => {
  return (
    <div className="vgp-page-header">
      <div className="vgp-page-header-content">
        <div className="vgp-page-header-icon">{icon}</div>
        <div className="vgp-page-header-text">
          <h1 className="vgp-page-header-title">{title}</h1>
          {subtitle && <p className="vgp-page-header-subtitle">{subtitle}</p>}
          {description && <p className="vgp-page-header-description">{description}</p>}
        </div>
      </div>
      <div className="vgp-page-header-glow"></div>
    </div>
  );
};

export default VGPPageHeader;
