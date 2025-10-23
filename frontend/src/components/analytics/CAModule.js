import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ResponsiveContainer
} from 'chart.js';
import analyticsService from '../../services/analyticsService';
import { useEquipment } from '../../hooks/useEquipment';
import './CAModule.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CAModule = () => {
  const { equipment } = useEquipment();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missingPrices, setMissingPrices] = useState([]);

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

        // Vérifier les équipements en location sans tarif
        const locationsMissingPrice = equipment.filter(
          eq => eq.statut === 'En Location' && (!eq.prixHT || eq.prixHT === 0)
        );
        setMissingPrices(locationsMissingPrice);

        // Calcul des stats pour le mois sélectionné
        const monthStats = analyticsService.calculateMonthStats(equipment, selectedMonth, selectedYear);
        setStats(monthStats);

        // Récupération de l'historique pour le graphique
        const caHistory = await analyticsService.getAllMonthsCAData(equipment);

        // Prépare les données du graphique
        const labels = [];
        const estimatedValues = [];
        const confirmedValues = [];

        // Trie par date et affiche les 12 derniers mois
        const sortedMonths = Object.entries(caHistory).sort((a, b) => {
          const [yearA, monthA] = a[0].split('-').map(Number);
          const [yearB, monthB] = b[0].split('-').map(Number);
          return yearA - yearB || monthA - monthB;
        });

        // Prend les 12 derniers mois
        const lastMonths = sortedMonths.slice(-12);

        lastMonths.forEach(([key, data]) => {
          const monthName = new Date(data.year, data.month, 1).toLocaleDateString('fr-FR', {
            month: 'short',
            year: '2-digit'
          });

          labels.push(monthName);

          if (data.isCurrent) {
            estimatedValues.push(data.estimatedCA);
            confirmedValues.push(data.confirmedCA);
          } else {
            // Mois passés: affiche l'historique comme estimé
            estimatedValues.push(data.historicalCA);
            confirmedValues.push(data.historicalCA);
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
      } catch (error) {
        console.error('Erreur calcul CA:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [equipment, selectedMonth, selectedYear]);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const monthName = new Date(selectedYear, selectedMonth, 1).toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) {
    return <div className="ca-module-loading">Chargement des données analytiques...</div>;
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
        </div>
      )}

      {/* KPIs Dashboard */}
      {stats && (
        <div className="kpi-grid">
          {/* CA Estimatif */}
          <div className="kpi-card ca-estimatif">
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
          </div>

          {/* CA Confirmé */}
          <div className="kpi-card ca-confirme">
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

          {/* Locations Actives */}
          <div className="kpi-card active-locations">
            <div className="kpi-header">
              <span className="kpi-icon">📦</span>
              <span className="kpi-label">Locations Actives</span>
            </div>
            <div className="kpi-value">{stats.activeLocations}</div>
            <div className="kpi-detail">
              Ø {stats.avgDaysPerLocation} jours/location
            </div>
          </div>
        </div>
      )}

      {/* Graphique de Tendance */}
      <div className="ca-chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Évolution du Chiffre d'Affaires</h3>
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

      {/* Explications */}
      <div className="ca-explanations">
        <div className="explanation-card">
          <h4>💡 CA Estimatif</h4>
          <p>Inclut les locations clôturées + les locations en cours jusqu'à leur date de fin théorique (jours ouvrés uniquement)</p>
        </div>

        <div className="explanation-card">
          <h4>✅ CA Confirmé</h4>
          <p>Locations clôturées + jours déjà effectués des locations en cours. Mis à jour quotidiennement.</p>
        </div>

        <div className="explanation-card">
          <h4>⏱️ Calcul</h4>
          <p>Tous les CA sont basés sur les jours ouvrés (lundi-vendredi) hors jours fériés français. Remise -20% si durée ≥ 21j.</p>
        </div>
      </div>
    </div>
  );
};

export default CAModule;
