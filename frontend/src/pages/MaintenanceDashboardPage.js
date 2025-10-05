import React, { useMemo } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import PageHeader from '../components/common/PageHeader';

const MaintenanceDashboardPage = () => {
  const { equipmentData } = useEquipment();

  // 📊 KPI 1: Nombre de matériels en maintenance
  const materialsInMaintenance = useMemo(() => {
    return equipmentData.filter(eq => eq.statut === 'En Maintenance').length;
  }, [equipmentData]);

  // 📊 KPI 2: Durée moyenne des maintenances (en jours)
  const averageMaintenanceDuration = useMemo(() => {
    const maintenanceEquipments = equipmentData.filter(eq =>
      eq.statut === 'En Maintenance' && eq.debutMaintenance
    );

    if (maintenanceEquipments.length === 0) return 0;

    const totalDays = maintenanceEquipments.reduce((sum, eq) => {
      const startDate = new Date(eq.debutMaintenance);
      const today = new Date();
      const durationDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      return sum + durationDays;
    }, 0);

    return (totalDays / maintenanceEquipments.length).toFixed(1);
  }, [equipmentData]);

  // 📊 KPI 3: Coût total estimé des maintenances en cours
  const totalMaintenanceCost = useMemo(() => {
    const maintenanceEquipments = equipmentData.filter(eq =>
      eq.statut === 'En Maintenance'
    );

    const total = maintenanceEquipments.reduce((sum, eq) => {
      // Estimation: 500€ par maintenance en moyenne
      return sum + 500;
    }, 0);

    return total.toFixed(0);
  }, [equipmentData]);

  // 📊 KPI 4: Taux de disponibilité du parc (%)
  const availabilityRate = useMemo(() => {
    const total = equipmentData.length;
    const available = equipmentData.filter(eq =>
      eq.statut === 'Sur Parc' || eq.statut === 'En Location'
    ).length;

    if (total === 0) return 100;
    return ((available / total) * 100).toFixed(1);
  }, [equipmentData]);

  // 🚨 Maintenances longues (> 7 jours)
  const longMaintenances = useMemo(() => {
    return equipmentData.filter(eq => {
      if (eq.statut !== 'En Maintenance' || !eq.debutMaintenance) return false;

      const startDate = new Date(eq.debutMaintenance);
      const today = new Date();
      const durationDays = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

      return durationDays > 7;
    }).map(eq => ({
      ...eq,
      duration: Math.floor((new Date() - new Date(eq.debutMaintenance)) / (1000 * 60 * 60 * 24))
    }));
  }, [equipmentData]);

  // 🚨 Matériels bloquants (prioritaires)
  const blockingMaterials = useMemo(() => {
    return equipmentData.filter(eq =>
      eq.statut === 'En Maintenance' &&
      eq.motifMaintenance &&
      eq.motifMaintenance.toLowerCase().includes('urgent')
    );
  }, [equipmentData]);

  // 📋 Interventions récentes (5 dernières)
  const recentInterventions = useMemo(() => {
    const maintenanceEquipments = equipmentData
      .filter(eq => eq.statut === 'En Maintenance' && eq.debutMaintenance)
      .sort((a, b) => new Date(b.debutMaintenance) - new Date(a.debutMaintenance))
      .slice(0, 5);

    return maintenanceEquipments.map(eq => ({
      ...eq,
      duration: Math.floor((new Date() - new Date(eq.debutMaintenance)) / (1000 * 60 * 60 * 24))
    }));
  }, [equipmentData]);

  // 🎯 Matériels à sortir en priorité
  const priorityExits = useMemo(() => {
    return equipmentData
      .filter(eq => eq.statut === 'En Maintenance' && eq.debutMaintenance)
      .sort((a, b) => new Date(a.debutMaintenance) - new Date(b.debutMaintenance))
      .slice(0, 3);
  }, [equipmentData]);

  return (
    <div className="maintenance-dashboard">
      <PageHeader
        icon="📊"
        title="Dashboard Maintenance"
        subtitle="SUIVI & ANALYSE"
        description="Vue d'ensemble des maintenances et interventions en cours"
      />

      {/* KPIs */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Matériels en Maintenance</div>
          <div className="stat-value">{materialsInMaintenance}</div>
          <div className="stat-sublabel">équipements</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Durée Moyenne</div>
          <div className="stat-value">{averageMaintenanceDuration}</div>
          <div className="stat-sublabel">jours</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Coût Total Estimé</div>
          <div className="stat-value">{totalMaintenanceCost}€</div>
          <div className="stat-sublabel">en cours</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Taux de Disponibilité</div>
          <div className="stat-value">{availabilityRate}%</div>
          <div className="stat-sublabel">du parc</div>
        </div>
      </div>

      {/* Alertes et Priorités */}
      <div className="dashboard-grid">
        {/* Maintenances longues */}
        <div className="dashboard-section">
          <div className="section-header alert-header">
            <span className="section-icon">⚠️</span>
            <h2>Maintenances Longues (&gt; 7 jours)</h2>
          </div>
          <div className="section-content">
            {longMaintenances.length === 0 ? (
              <p className="empty-message">✅ Aucune maintenance longue détectée</p>
            ) : (
              <div className="alert-list">
                {longMaintenances.map(eq => (
                  <div key={eq.id} className="alert-item">
                    <div className="alert-item-header">
                      <strong>{eq.reference}</strong>
                      <span className="alert-badge danger">{eq.duration} jours</span>
                    </div>
                    <div className="alert-item-details">
                      <span>📦 {eq.modele}</span>
                      {eq.motifMaintenance && (
                        <span className="alert-motif">🔧 {eq.motifMaintenance}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Matériels bloquants */}
        <div className="dashboard-section">
          <div className="section-header alert-header">
            <span className="section-icon">🚨</span>
            <h2>Matériels Bloquants</h2>
          </div>
          <div className="section-content">
            {blockingMaterials.length === 0 ? (
              <p className="empty-message">✅ Aucun matériel bloquant</p>
            ) : (
              <div className="alert-list">
                {blockingMaterials.map(eq => (
                  <div key={eq.id} className="alert-item urgent">
                    <div className="alert-item-header">
                      <strong>{eq.reference}</strong>
                      <span className="alert-badge urgent">URGENT</span>
                    </div>
                    <div className="alert-item-details">
                      <span>📦 {eq.modele}</span>
                      <span className="alert-motif">🔧 {eq.motifMaintenance}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interventions récentes et priorités de sortie */}
      <div className="dashboard-grid">
        {/* Interventions récentes */}
        <div className="dashboard-section">
          <div className="section-header">
            <span className="section-icon">🛠️</span>
            <h2>Interventions Récentes</h2>
          </div>
          <div className="section-content">
            {recentInterventions.length === 0 ? (
              <p className="empty-message">Aucune intervention récente</p>
            ) : (
              <div className="intervention-list">
                {recentInterventions.map(eq => (
                  <div key={eq.id} className="intervention-item">
                    <div className="intervention-header">
                      <strong>{eq.reference}</strong>
                      <span className="intervention-date">
                        {new Date(eq.debutMaintenance).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="intervention-details">
                      <span>📦 {eq.modele}</span>
                      <span className="duration-badge">{eq.duration} jours</span>
                    </div>
                    {eq.motifMaintenance && (
                      <div className="intervention-motif">
                        🔧 {eq.motifMaintenance}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priorités de sortie */}
        <div className="dashboard-section">
          <div className="section-header priority-header">
            <span className="section-icon">🎯</span>
            <h2>À Sortir en Priorité</h2>
          </div>
          <div className="section-content">
            {priorityExits.length === 0 ? (
              <p className="empty-message">Aucun matériel en maintenance</p>
            ) : (
              <div className="priority-list">
                {priorityExits.map((eq, index) => (
                  <div key={eq.id} className="priority-item">
                    <div className="priority-rank">#{index + 1}</div>
                    <div className="priority-info">
                      <div className="priority-header">
                        <strong>{eq.reference}</strong>
                      </div>
                      <div className="priority-details">
                        <span>📦 {eq.modele}</span>
                        <span>📅 {new Date(eq.debutMaintenance).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceDashboardPage;
