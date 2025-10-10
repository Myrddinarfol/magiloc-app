import React, { useMemo, useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';

const VGPManagementPage = () => {
  const { equipmentData } = useEquipment();
  const { handleOpenEquipmentDetail } = useUI();
  const [sortBy, setSortBy] = useState('status'); // 'status', 'designation', 'vgp_date'

  // Calculer les VGP par catégorie
  const vgpCategories = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in30Days = new Date(today);
    in30Days.setDate(today.getDate() + 30);

    const overdue = [];
    const upcoming = [];
    const notSet = [];

    equipmentData.forEach(eq => {
      // VGP non renseignés
      if (!eq.prochainVGP || eq.prochainVGP === '') {
        notSet.push({ ...eq, vgpStatus: 'not-set', daysUntilVGP: null });
        return;
      }

      // Parser la date VGP (format DD/MM/YYYY)
      const [day, month, year] = eq.prochainVGP.split('/');
      const vgpDate = new Date(year, month - 1, day);
      vgpDate.setHours(0, 0, 0, 0);

      const diffTime = vgpDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (vgpDate < today) {
        // VGP dépassés
        overdue.push({ ...eq, vgpStatus: 'overdue', daysUntilVGP: diffDays });
      } else if (vgpDate <= in30Days) {
        // VGP dans moins de 30 jours
        upcoming.push({ ...eq, vgpStatus: 'upcoming', daysUntilVGP: diffDays });
      }
    });

    // Trier par jours restants (du plus urgent au moins urgent)
    overdue.sort((a, b) => a.daysUntilVGP - b.daysUntilVGP);
    upcoming.sort((a, b) => a.daysUntilVGP - b.daysUntilVGP);

    return { overdue, upcoming, notSet };
  }, [equipmentData]);

  // Combiner toutes les catégories dans l'ordre souhaité
  const allVGPEquipment = useMemo(() => {
    return [
      ...vgpCategories.overdue,
      ...vgpCategories.upcoming,
      ...vgpCategories.notSet
    ];
  }, [vgpCategories]);

  const getVGPBadge = (equipment) => {
    if (equipment.vgpStatus === 'overdue') {
      return (
        <span className="vgp-badge vgp-overdue" title="VGP dépassé">
          ⚠️ DÉPASSÉ ({Math.abs(equipment.daysUntilVGP)}j)
        </span>
      );
    } else if (equipment.vgpStatus === 'upcoming') {
      return (
        <span className="vgp-badge vgp-upcoming" title="VGP à prévoir sous 30 jours">
          ⏰ {equipment.daysUntilVGP}j restants
        </span>
      );
    } else {
      return (
        <span className="vgp-badge vgp-not-set" title="VGP non renseigné">
          ❓ NON RENSEIGNÉ
        </span>
      );
    }
  };

  return (
    <div className="vgp-management">
      <PageHeader
        icon="✅"
        title="Gestion VGP"
        subtitle="VÉRIFICATIONS GÉNÉRALES PÉRIODIQUES"
        description="Suivi des VGP dépassés, à venir et non renseignés"
      />

      {/* Statistiques VGP */}
      <div className="vgp-stats-grid">
        <div className="vgp-stat-card vgp-stat-overdue">
          <div className="vgp-stat-icon">⚠️</div>
          <div className="vgp-stat-content">
            <div className="vgp-stat-number">{vgpCategories.overdue.length}</div>
            <div className="vgp-stat-label">VGP Dépassés</div>
          </div>
        </div>

        <div className="vgp-stat-card vgp-stat-upcoming">
          <div className="vgp-stat-icon">⏰</div>
          <div className="vgp-stat-content">
            <div className="vgp-stat-number">{vgpCategories.upcoming.length}</div>
            <div className="vgp-stat-label">VGP {'<'} 30 jours</div>
          </div>
        </div>

        <div className="vgp-stat-card vgp-stat-not-set">
          <div className="vgp-stat-icon">❓</div>
          <div className="vgp-stat-content">
            <div className="vgp-stat-number">{vgpCategories.notSet.length}</div>
            <div className="vgp-stat-label">VGP Non Renseignés</div>
          </div>
        </div>

        <div className="vgp-stat-card vgp-stat-total">
          <div className="vgp-stat-icon">📋</div>
          <div className="vgp-stat-content">
            <div className="vgp-stat-number">{allVGPEquipment.length}</div>
            <div className="vgp-stat-label">Total à Gérer</div>
          </div>
        </div>
      </div>

      {/* Table VGP */}
      <div className="equipment-section">
        <div className="equipment-section-header">
          <h3>📋 Liste des Équipements</h3>
          <p className="section-subtitle">
            Ordre : VGP dépassés → VGP {'<'} 30 jours → VGP non renseignés
          </p>
        </div>

        {allVGPEquipment.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <p className="empty-title">Tous les VGP sont à jour !</p>
            <p className="empty-subtitle">Aucun VGP dépassé, à venir ou non renseigné</p>
          </div>
        ) : (
          <div className="equipment-table-container">
            <table className="equipment-table">
              <thead>
                <tr>
                  <th>Statut VGP</th>
                  <th>Désignation</th>
                  <th>CMU</th>
                  <th>Modèle</th>
                  <th>N° Série</th>
                  <th>Dernier VGP</th>
                  <th>Prochain VGP</th>
                  <th>Certificat</th>
                  <th>Statut Équipement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allVGPEquipment.map((eq) => (
                  <tr key={eq.id} className={`vgp-row-${eq.vgpStatus}`}>
                    <td>{getVGPBadge(eq)}</td>
                    <td className="designation-cell">
                      <strong>{eq.designation}</strong>
                    </td>
                    <td>{eq.cmu || '-'}</td>
                    <td>{eq.modele || '-'}</td>
                    <td className="numero-serie-cell">{eq.numeroSerie}</td>
                    <td>{eq.dernierVGP || '-'}</td>
                    <td>
                      <span className={`vgp-date-${eq.vgpStatus}`}>
                        {eq.prochainVGP || 'Non renseigné'}
                      </span>
                    </td>
                    <td>{eq.certificat || '-'}</td>
                    <td>
                      <span className={`status-badge status-${eq.statut?.toLowerCase().replace(/ /g, '-')}`}>
                        {eq.statut}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenEquipmentDetail(eq)}
                        className="btn-icon"
                        title="Voir détails"
                      >
                        📜
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VGPManagementPage;
