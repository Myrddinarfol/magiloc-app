import React from 'react';
import { getCertificatLink, getVGPDetailStatus } from '../../utils/vgpHelpers';

const VGPSection = ({ equipment, onEditCertificat }) => {
  const vgpStatus = getVGPDetailStatus(equipment.prochainVGP);

  return (
    <div className="vgp-section">
      <div className="vgp-section-header">
        <h3>Contrôles VGP</h3>
        <button
          onClick={onEditCertificat}
          className="btn btn-secondary btn-sm"
        >
          📎 {equipment.certificat ? 'Modifier' : 'Ajouter'} certificat
        </button>
      </div>

      <div className="vgp-detail-grid">
        <div className="vgp-info-item">
          <span className="vgp-info-label">Certificat:</span>
          {getCertificatLink(equipment.certificat) ? (
            <a
              href={getCertificatLink(equipment.certificat)}
              target="_blank"
              rel="noopener noreferrer"
              className="certificat-link"
            >
              {equipment.certificat} 🔗
            </a>
          ) : (
            <span className="vgp-info-value">{equipment.certificat || 'Non renseigné'}</span>
          )}
        </div>
      </div>

      {/* Indicateur VGP stylé */}
      <div className={`vgp-status-card vgp-status-${vgpStatus.color}`}>
        <div className="vgp-status-icon">{vgpStatus.icon}</div>
        <div className="vgp-status-content">
          <div className="vgp-status-label">{vgpStatus.label}</div>
          <div className="vgp-status-date">{equipment.prochainVGP || 'Non renseigné'}</div>
          <div className="vgp-status-sublabel">{vgpStatus.subLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default VGPSection;
