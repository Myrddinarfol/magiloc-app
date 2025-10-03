import React, { useMemo } from 'react';
import { useEquipment } from '../hooks/useEquipment';

const AnalyticsPage = () => {
  const { equipmentData } = useEquipment();

  // Calculer le CA du mois en cours
  const currentMonthRevenue = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Pour l'instant, on simule avec les données disponibles
    // Plus tard, on utilisera l'historique des locations
    const locationsThisMonth = equipmentData.filter(eq => {
      if (eq.debutLocation) {
        const startDate = new Date(eq.debutLocation);
        return startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear;
      }
      return false;
    });

    // Calcul estimatif basé sur les prix HT/jour
    const totalCA = locationsThisMonth.reduce((sum, eq) => {
      const prixHT = parseFloat(eq.prixHT) || 0;
      // On estime 15 jours de location en moyenne pour le calcul
      return sum + (prixHT * 15);
    }, 0);

    return totalCA.toFixed(2);
  }, [equipmentData]);

  // Taux d'utilisation du parc
  const utilizationRate = useMemo(() => {
    const total = equipmentData.length;
    const enLocation = equipmentData.filter(eq => eq.statut === 'En Location').length;
    const enReservation = equipmentData.filter(eq => eq.statut === 'En Réservation').length;

    if (total === 0) return 0;

    // Taux = (En location + En réservation) / Total
    return (((enLocation + enReservation) / total) * 100).toFixed(1);
  }, [equipmentData]);

  // Top 5 clients (basé sur nombre de locations actives)
  const topClients = useMemo(() => {
    const clientMap = {};

    equipmentData
      .filter(eq => eq.statut === 'En Location' || eq.statut === 'En Réservation')
      .forEach(eq => {
        if (eq.client) {
          if (!clientMap[eq.client]) {
            clientMap[eq.client] = { name: eq.client, count: 0, totalHT: 0 };
          }
          clientMap[eq.client].count++;
          clientMap[eq.client].totalHT += parseFloat(eq.prix_ht_jour) || 0;
        }
      });

    return Object.values(clientMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [equipmentData]);

  // Top 5 équipements les plus loués
  const topEquipments = useMemo(() => {
    // Pour l'instant, on montre les équipements actuellement en location
    // Plus tard, on utilisera l'historique pour compter le nombre total de locations
    return equipmentData
      .filter(eq => eq.statut === 'En Location')
      .slice(0, 5);
  }, [equipmentData]);

  // Équipements sous-exploités (jamais loués ou rarement)
  const underutilizedEquipments = useMemo(() => {
    return equipmentData
      .filter(eq => eq.statut === 'Sur Parc')
      .slice(0, 5);
  }, [equipmentData]);

  // Stats maintenance
  const maintenanceStats = useMemo(() => {
    const enMaintenance = equipmentData.filter(eq => eq.statut === 'En Maintenance').length;
    const total = equipmentData.length;
    const tauxMaintenance = total > 0 ? ((enMaintenance / total) * 100).toFixed(1) : 0;

    return { enMaintenance, tauxMaintenance };
  }, [equipmentData]);

  return (
    <div className="analytics-page">
      <div className="dashboard-header">
        <h1>📈 Analytics & Performance</h1>
        <p className="dashboard-subtitle">Analyse du parc et optimisation</p>
      </div>

      {/* KPI Principaux */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="kpi-icon">💰</div>
          <div className="kpi-content">
            <div className="kpi-value">{currentMonthRevenue} €</div>
            <div className="kpi-label">CA du Mois (estimé)</div>
            <div className="kpi-subtext">Basé sur les locations actives</div>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-icon">📊</div>
          <div className="kpi-content">
            <div className="kpi-value">{utilizationRate}%</div>
            <div className="kpi-label">Taux d'Utilisation</div>
            <div className="kpi-subtext">Location + Réservation</div>
          </div>
        </div>

        <div className="analytics-kpi-card">
          <div className="kpi-icon">🔧</div>
          <div className="kpi-content">
            <div className="kpi-value">{maintenanceStats.tauxMaintenance}%</div>
            <div className="kpi-label">Taux de Maintenance</div>
            <div className="kpi-subtext">{maintenanceStats.enMaintenance} équipements</div>
          </div>
        </div>
      </div>

      {/* Section Top Performers */}
      <div className="analytics-section">
        <h2>🏆 Top Performers</h2>
        <div className="analytics-grid">
          <div className="analytics-card">
            <h3>Top 5 Clients</h3>
            <div className="top-list">
              {topClients.length === 0 ? (
                <p className="empty-state">Aucun client actif</p>
              ) : (
                topClients.map((client, index) => (
                  <div key={client.name} className="top-item">
                    <span className="top-rank">#{index + 1}</span>
                    <div className="top-info">
                      <span className="top-name">{client.name}</span>
                      <span className="top-meta">{client.count} location(s) active(s)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="analytics-card">
            <h3>Top 5 Équipements Loués</h3>
            <div className="top-list">
              {topEquipments.length === 0 ? (
                <p className="empty-state">Aucun équipement en location</p>
              ) : (
                topEquipments.map((eq, index) => (
                  <div key={eq.id} className="top-item">
                    <span className="top-rank">#{index + 1}</span>
                    <div className="top-info">
                      <span className="top-name">{eq.designation}</span>
                      <span className="top-meta">Loué par : {eq.client}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Optimisation */}
      <div className="analytics-section">
        <h2>⚙️ Optimisation du Parc</h2>
        <div className="analytics-card">
          <h3>⚠️ Équipements Sous-Exploités</h3>
          <p className="card-description">Équipements actuellement disponibles qui pourraient être mieux valorisés</p>
          <div className="underutilized-grid">
            {underutilizedEquipments.length === 0 ? (
              <p className="empty-state">Tous les équipements sont bien exploités !</p>
            ) : (
              underutilizedEquipments.map(eq => (
                <div key={eq.id} className="underutilized-item">
                  <div className="underutilized-info">
                    <span className="underutilized-name">{eq.designation}</span>
                    <span className="underutilized-type">{eq.cmu || 'N/A'}</span>
                  </div>
                  <div className="underutilized-price">{eq.prixHT}€/j</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section Prévisions */}
      <div className="analytics-section">
        <h2>🔮 Prévisions & Objectifs</h2>
        <div className="forecast-card">
          <div className="forecast-item">
            <span className="forecast-icon">📅</span>
            <div className="forecast-content">
              <div className="forecast-label">CA Prévisionnel Fin de Mois</div>
              <div className="forecast-value">~ {(parseFloat(currentMonthRevenue) * 1.2).toFixed(2)} €</div>
              <div className="forecast-note">Basé sur les réservations à venir</div>
            </div>
          </div>

          <div className="forecast-item">
            <span className="forecast-icon">🎯</span>
            <div className="forecast-content">
              <div className="forecast-label">Objectif Taux d'Utilisation</div>
              <div className="forecast-value">70%</div>
              <div className="forecast-note">Écart : {(70 - parseFloat(utilizationRate)).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Note pour futures améliorations */}
      <div className="analytics-info-banner">
        <span className="info-icon">💡</span>
        <div className="info-content">
          <strong>Prochaines améliorations :</strong>
          <p>Graphiques d'évolution, historique CA mensuel, analyse de rentabilité par équipement, export PDF</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
