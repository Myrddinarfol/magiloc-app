import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ResponsiveContainer
} from 'chart.js';
import analyticsService from '../../services/analyticsService';
import { useEquipment } from '../../hooks/useEquipment';
import CADetailsModal from './CADetailsModal';
import MissingPricesModal from './MissingPricesModal';
import './CAModule.css';
import './CADetailsModal.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const CAModule = () => {
  const { equipmentData } = useEquipment();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [yearlyCA, setYearlyCA] = useState(0);
  const [loading, setLoading] = useState(true);
  const [missingPrices, setMissingPrices] = useState([]);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalType, setDetailsModalType] = useState('estimated'); // 'estimated' ou 'confirmed'
  const [monthLocationBreakdown, setMonthLocationBreakdown] = useState(null);
  const [showMissingPricesModal, setShowMissingPricesModal] = useState(false);

  console.log('🔍 CAModule rendu - Equipment:', equipmentData?.length, 'Loading:', loading, 'Stats:', stats);

  // Détection du thème
  const isDarkTheme = !document.body.classList.contains('light-theme');
  const textColor = isDarkTheme ? '#d1d5db' : '#4b5563';
  const gridColor = isDarkTheme ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.05)';
  const pointBorderColor = isDarkTheme ? '#262626' : '#ffffff';

  // Liste des mois disponibles
  const today = new Date();
  const availableYears = [today.getFullYear() - 1, today.getFullYear()];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📍 Début fetchData - Equipment count:', equipmentData?.length);

        // Vérifier s'il y a des équipements
        if (!equipmentData || equipmentData.length === 0) {
          console.warn('⚠️ Aucun équipement disponible');
          setStats({ estimatedCA: 0, confirmedCA: 0, activeLocations: 0, avgDaysPerLocation: 0 });
          setChartData({ labels: [], datasets: [] });
          setLoading(false);
          return;
        }

        // Vérifier les équipements en location sans tarif (en excluant les TEST)
        const filteredEquipment = analyticsService.filterTestData(equipmentData);
        const locationsMissingPrice = filteredEquipment.filter(
          eq => eq.statut === 'En Location' && (!eq.prixHT || eq.prixHT === 0)
        );
        console.log('🏷️ Équipements sans tarif:', locationsMissingPrice.length);
        setMissingPrices(locationsMissingPrice);

        // Calcul des stats et historique en parallèle
        console.log('📊 Calcul stats pour', selectedMonth, '/', selectedYear);
        console.log('📈 Récupération historique CA...');

        const [caHistory, yearlyCAData, breakdown] = await Promise.all([
          analyticsService.getAllMonthsCAData(equipmentData),
          analyticsService.getYearlyCAData(equipmentData),
          analyticsService.getMonthLocationBreakdown(equipmentData, selectedMonth, selectedYear)
        ]);

        // IMPORTANT: Utiliser le summary de getMonthLocationBreakdown pour cohérence
        // Car getMonthLocationBreakdown répartit correctement le CA par mois pour tous les chevauches
        const monthStats = {
          estimatedCA: breakdown.summary.totalCAEstimated,
          confirmedCA: breakdown.summary.totalCAConfirmed,
          activeLocations: breakdown.summary.ongoingCount + breakdown.summary.closedCount,
          avgDaysPerLocation: Math.round(
            (breakdown.ongoingLocations.reduce((sum, loc) => sum + loc.businessDaysThisMonth, 0) +
             breakdown.closedLocations.reduce((sum, loc) => sum + loc.businessDaysThisMonth, 0)) /
            (breakdown.summary.ongoingCount + breakdown.summary.closedCount || 1)
          ),
          historicalCA: breakdown.closedLocations.reduce((sum, loc) => sum + loc.caThisMonth, 0),
          historicalLocationsCount: breakdown.summary.closedCount,
          historicalLocations: breakdown.closedLocations
        };

        console.log('✅ Stats calculées (depuis breakdown):', monthStats);
        console.log('✅ Historique récupéré:', Object.keys(caHistory).length, 'mois');
        console.log('📋 Clés caHistory:', Object.keys(caHistory).sort());
        console.log('📊 Breakdown locations:', breakdown);
        setStats(monthStats);
        setMonthLocationBreakdown(breakdown);

        // Calcul du CA annuel pour l'année en cours (utilise yearlyCAData qui est la source de vérité)
        const currentYear = new Date().getFullYear();
        const yearlyCATotal = analyticsService.calculateYearlyConfirmedCA(yearlyCAData, currentYear);
        setYearlyCA(yearlyCATotal);
        console.log('💰 CA annuel 2025 (depuis yearlyCAData):', yearlyCATotal);

        // Prépare les données du graphique DEPUIS LA SOURCE DE VÉRITÉ (yearlyCAData)
        const labels = [];
        const estimatedValues = [];
        const confirmedValues = [];

        // Trie tous les mois par date (chronologiquement)
        const sortedMonths = Object.entries(yearlyCAData).sort((a, b) => {
          const [, dataA] = a;
          const [, dataB] = b;
          return dataA.month - dataB.month;
        });

        console.log(`📊 Graphique tendance: ${sortedMonths.length} mois trouvés (depuis ${sortedMonths[0]?.[0]} jusqu'à ${sortedMonths[sortedMonths.length-1]?.[0]})`);

        // Afficher TOUS les mois disponibles (pas juste les 12 derniers)
        sortedMonths.forEach(([key, data]) => {
          const monthName = new Date(data.year, data.month, 1).toLocaleDateString('fr-FR', {
            month: 'short',
            year: '2-digit'
          });

          labels.push(monthName);

          // Pour le graphique, afficher:
          // - Mois courant: estimé vs confirmé (locations en cours)
          // - Mois passés: confirmé = confirmé (source unique de vérité)
          if (data.isCurrent) {
            estimatedValues.push(data.estimatedCA || 0);
            confirmedValues.push(data.confirmedCA || 0);
          } else {
            // Mois passés: affiche le CA confirmé réparti correctement
            estimatedValues.push(data.confirmedCA || 0);
            confirmedValues.push(data.confirmedCA || 0);
          }
        });

        setChartData({
          labels,
          datasets: [
            {
              label: 'CA Estimatif',
              data: estimatedValues,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: pointBorderColor,
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: 'CA Confirmé',
              data: confirmedValues,
              borderColor: '#16a34a',
              backgroundColor: 'rgba(22, 163, 74, 0.15)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#16a34a',
              pointBorderColor: pointBorderColor,
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            }
          ]
        });

        // Créer le bar chart avec les CA confirmés de l'année
        const barLabels = [];
        const barConfirmedValues = [];

        // Trier et créer les données pour le bar chart
        const sortedYearlyMonths = Object.entries(yearlyCAData).sort((a, b) => {
          const [, dataA] = a;
          const [, dataB] = b;
          return dataA.month - dataB.month;
        });

        sortedYearlyMonths.forEach(([key, data]) => {
          const monthName = new Date(data.year, data.month, 1).toLocaleDateString('fr-FR', {
            month: 'long'
          });
          barLabels.push(monthName);
          barConfirmedValues.push(data.confirmedCA || 0);
        });

        setBarChartData({
          labels: barLabels,
          datasets: [
            {
              label: 'CA Confirmé par Mois',
              data: barConfirmedValues,
              backgroundColor: [
                '#10b981', // Vert éclatant
                '#06b6d4', // Cyan
                '#f59e0b', // Amber
                '#ef4444', // Red
                '#8b5cf6', // Purple
                '#ec4899', // Pink
                '#14b8a6', // Teal
                '#f97316', // Orange
                '#6366f1', // Indigo
                '#84cc16'  // Lime
              ],
              borderColor: '#ffffff',
              borderWidth: 2,
              borderRadius: 8,
              hoverBackgroundColor: '#ffffff',
              hoverBorderColor: '#1f2937'
            }
          ]
        });
      } catch (error) {
        console.error('❌ Erreur calcul CA:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (equipmentData && equipmentData.length > 0) {
      fetchData();
    }
  }, [equipmentData, selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleOpenDetailsModal = (type) => {
    setDetailsModalType(type);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
  };

  const handleCloseMissingPricesModal = () => {
    setShowMissingPricesModal(false);
  };

  const handlePricesUpdated = () => {
    // Recharger les données analytiques après mise à jour des tarifs
    console.log('🔄 Recharge des données analytiques après mise à jour des tarifs');
    // Les données se rechargeront automatiquement via le useEffect
  };

  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return <div className="ca-module-loading">Chargement des données analytiques...</div>;
  }

  if (error) {
    return (
      <div className="ca-module">
        <div className="error-banner">
          <span className="error-icon">❌</span>
          <div className="error-content">
            <strong>Erreur lors du chargement des données</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ca-module">
      {/* En-tête */}
      <div className="ca-header">
        <div className="ca-header-content">
          <h2 className="ca-title">💰 Chiffre d'Affaires</h2>
          <p className="ca-subtitle">Suivi détaillé du CA estimatif et confirmé</p>
        </div>

        {/* Filtres */}
        <div className="ca-filters">
          <div className="filter-group">
            <label htmlFor="month-select">Mois</label>
            <select id="month-select" value={selectedMonth} onChange={handleMonthChange} className="filter-select">
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i}>
                  {new Date(2025, i, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="year-select">Année</label>
            <select id="year-select" value={selectedYear} onChange={handleYearChange} className="filter-select">
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-period">{monthName}</div>
        </div>
      </div>

      {/* Avertissement tarifs manquants */}
      {missingPrices.length > 0 && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          <div className="warning-content">
            <strong>{missingPrices.length} équipement(s) en location sans tarif</strong>
            <p>Les tarifs manquants ne sont pas inclus dans le CA. Complétez les tarifs horaires pour une analyse complète.</p>
          </div>
          <button
            className="warning-action-btn"
            onClick={() => setShowMissingPricesModal(true)}
            title="Voir et corriger les tarifs manquants dans l'historique"
          >
            💾 Corriger tarifs historique
          </button>
        </div>
      )}

      {/* CA Annuel */}
      {yearlyCA > 0 && (
        <div className="yearly-ca-banner">
          <div className="yearly-ca-content">
            <span className="yearly-ca-icon">📈</span>
            <div className="yearly-ca-text">
              <div className="yearly-ca-label">Chiffre d'Affaires {new Date().getFullYear()}</div>
              <div className="yearly-ca-value">{yearlyCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs Dashboard */}
      {stats && (
        <div className="kpi-grid">
          {/* CA Estimatif - CLIQUABLE */}
          <div className="kpi-card ca-estimatif clickable" onClick={() => handleOpenDetailsModal('estimated')}>
            <div className="kpi-header">
              <span className="kpi-icon">📊</span>
              <span className="kpi-label">CA Estimatif</span>
            </div>
            <div className="kpi-value">{stats.estimatedCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <div className="kpi-detail">
              {selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()
                ? 'Locations en cours incluses'
                : 'Mois clôturé'}
            </div>
            <div className="kpi-footer">Cliquez pour voir les détails →</div>
          </div>

          {/* CA Confirmé - CLIQUABLE */}
          <div className="kpi-card ca-confirme clickable" onClick={() => handleOpenDetailsModal('confirmed')}>
            <div className="kpi-header">
              <span className="kpi-icon">✅</span>
              <span className="kpi-label">CA Confirmé</span>
            </div>
            <div className="kpi-value">{stats.confirmedCA.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</div>
            <div className="kpi-detail">
              {selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()
                ? 'Jours effectifs uniquement'
                : 'Mois clôturé'}
            </div>
            <div className="kpi-footer">Cliquez pour voir les détails →</div>
          </div>

          {/* Écart CA */}
          <div className="kpi-card ca-gap">
            <div className="kpi-header">
              <span className="kpi-icon">📈</span>
              <span className="kpi-label">Écart CA</span>
            </div>
            <div className="kpi-value">
              {(stats.estimatedCA - stats.confirmedCA).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </div>
            <div className="kpi-detail">
              Jours à facturer sur le mois
            </div>
          </div>

        </div>
      )}

      {/* Graphiques - Côte à côte */}
      <div className="ca-charts-grid">
        {/* Graphique de Tendance - Courbe */}
        <div className="ca-chart-container">
          <div className="chart-header">
            <h3 className="chart-title">📈 Évolution Annuelle</h3>
            <p className="chart-subtitle">Tendance sur les 12 derniers mois</p>
          </div>

          <div className="chart-wrapper">
            {chartData && (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: { size: 12, weight: 'bold' },
                        color: textColor,
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      padding: 12,
                      titleFont: { size: 13, weight: 'bold' },
                      bodyFont: { size: 12 },
                      titleColor: isDarkTheme ? '#ffffff' : '#1f2937',
                      bodyColor: isDarkTheme ? '#d1d5db' : '#4b5563',
                      borderColor: 'rgba(220, 38, 38, 0.3)',
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed.y;
                          return `${context.dataset.label}: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: gridColor,
                        drawBorder: false
                      },
                      ticks: {
                        color: textColor,
                        font: { size: 11 },
                        callback: (value) => {
                          return value.toLocaleString('fr-FR', { notation: 'compact' });
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false
                      },
                      ticks: {
                        color: textColor,
                        font: { size: 11 }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Graphique des Performances par Mois - Barres */}
        <div className="ca-chart-container">
          <div className="chart-header">
            <h3 className="chart-title">💰 Performances par Mois</h3>
            <p className="chart-subtitle">CA Confirmé mensuel 2025</p>
          </div>

          <div className="chart-wrapper">
            {barChartData && (
              <Bar
                data={barChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  indexAxis: 'x',
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        font: { size: 12, weight: 'bold' },
                        color: textColor,
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                      }
                    },
                    tooltip: {
                      backgroundColor: isDarkTheme ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                      padding: 12,
                      titleFont: { size: 13, weight: 'bold' },
                      bodyFont: { size: 12 },
                      titleColor: isDarkTheme ? '#ffffff' : '#1f2937',
                      bodyColor: isDarkTheme ? '#d1d5db' : '#4b5563',
                      borderColor: 'rgba(220, 38, 38, 0.3)',
                      borderWidth: 1,
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed.y;
                          return `${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: gridColor,
                        drawBorder: false
                      },
                      ticks: {
                        color: textColor,
                        font: { size: 11 },
                        callback: (value) => {
                          return value.toLocaleString('fr-FR', { notation: 'compact' });
                        }
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                        drawBorder: false
                      },
                      ticks: {
                        color: textColor,
                        font: { size: 11 }
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal Détails CA */}
      <CADetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseDetailsModal}
        caType={detailsModalType}
        month={selectedMonth}
        year={selectedYear}
        closedLocations={monthLocationBreakdown?.closedLocations || []}
        ongoingLocations={monthLocationBreakdown?.ongoingLocations || []}
        loanLocations={monthLocationBreakdown?.loanLocations || []}
        summary={monthLocationBreakdown?.summary || {}}
      />

      {/* Modal Tarifs Manquants */}
      <MissingPricesModal
        isOpen={showMissingPricesModal}
        onClose={handleCloseMissingPricesModal}
        onPricesUpdated={handlePricesUpdated}
      />
    </div>
  );
};

export default CAModule;
