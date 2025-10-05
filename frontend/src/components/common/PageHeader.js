import React from 'react';
import './PageHeader.css';

const PageHeader = ({ icon, title, subtitle, description }) => {
  return (
    <div className="page-header">
      <div className="page-header-content">
        <div className="page-header-icon">{icon}</div>
        <div className="page-header-text">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
          {description && <p className="page-header-description">{description}</p>}
        </div>
      </div>
      <div className="page-header-glow"></div>
    </div>
  );
};

export default PageHeader;
