import React from 'react';
import { getVGPDetailStatus } from '../../utils/vgpHelpers';

const VGPBadgeCompact = ({ prochainVGP }) => {
  const vgpStatus = getVGPDetailStatus(prochainVGP);

  return (
    <div className={`vgp-status-card-compact vgp-status-${vgpStatus.color}`}>
      <div className="vgp-status-icon-compact">{vgpStatus.icon}</div>
      <div className="vgp-status-content-compact">
        <div className="vgp-status-label-compact">{vgpStatus.label}</div>
        <div className="vgp-status-date-compact">{prochainVGP || 'Non renseigné'}</div>
      </div>
    </div>
  );
};

export default VGPBadgeCompact;
