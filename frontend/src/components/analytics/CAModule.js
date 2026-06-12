import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ResponsiveContainer
} from 'chart.js';
import analyticsService from '../../services/analyticsService';
import { useEquipment } from '../../hooks/useEquipment';
import { useUI } from '../../hooks/useUI';
import { API_URL } from '../../config/constants';
import CADetailsModal from './CADetailsModal';
import MissingPricesModal from './MissingPricesModal';
import CALoadingModal from './CALoadingModal';
import ClientDetailsModal from './ClientDetailsModal';
import EquipmentTypeDetailsModal from './EquipmentTypeDetailsModal';
import ChartLegend from './ChartLegend';
import './CAModule.css';
import './CADetailsModal.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const CAModule = () => {
  const { equipmentData } = useEquipment();
  const { showToast } = useUI();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  // Menu paramètres (roue crantée) + clé de rafraîchissement des données
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCleaningTestData, setIsCleaningTestData] = useState(false);

  // Purge les locations CLIENT TEST de l'historique puis recharge les données
  const handleCleanupClientTest = async () => {
    setShowSettingsMenu(false);

    const confirmed = window.confirm(
      "Supprimer définitivement toutes les locations CLIENT TEST de l'historique ?\n\n" +
      "Cette action est irréversible et retirera ces locations des calculs Analytics."
    );
    if (!confirmed) return;

    try {
      setIsCleaningTestData(true);
      const response = await fetch(`${API_URL}/api/admin/cleanup-client-test`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      showToast(`🧹 ${result.deletedLocations} location(s) CLIENT TEST supprimée(s) de l'historique`, 'success');
      setRefreshKey(k => k + 1); // Recharger les données Analytics
    } catch (error) {
      console.error('❌ Erreur purge CLIENT TEST:', error);
      showToast(`Erreur lors de la purge: ${error.message}`, 'error');
    } finally {
      setIsCleaningTestData(false);
    }
  };
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);
  const [clientChartData, setClientChartData] = useState(null);
  const [equipmentChartData, setEquipmentChartData] = useState(null);
  const [yearlyCA, setYearlyCA] = useState(0);
  const [loading, setLoading] = useState(true);
  const [missingPrices, setMissingPrices] = useState([]);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsModalType, setDetailsModalType] = useState('estimated'); // 'estimated' ou 'confirmed'
  const [monthLocationBreakdown, setMonthLocationBreakdown] = useState(null);
  const [showMissingPricesModal, setShowMissingPricesModal] = useState(false);
  // Filtres pour les graphiques pie
  const [pieChartMode, setPieChartMode] = useState('month'); // 'month' ou 'year'
  const [pieChartMonth, setPieChartMonth] = useState(new Date().getMonth());
  const [pieChartYear, setPieChartYear] = useState(new Date().getFullYear());
  const [isLoadingCA, setIsLoadingCA] = useState(false); // Modal de chargement CA
  // Interactivité hover entre pie charts et légendes
  const [hoveredClientIndex, setHoveredClientIndex] = useState(null);
  const [hoveredEquipmentIndex, setHoveredEquipmentIndex] = useState(null);
  // Détails modals
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showEquipmentDetails, setShowEquipmentDetails] = useState(false);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState(null);
  const [pieChartLocations, setPieChartLocations] = useState([]); // Locations pour les modals détails

  console.log('🔍 CAModule rendu - Equipment:', equipmentData?.length, 'Loading:', loading, 'Stats:', stats);
  console.log('🎨 Pie Charts Filter - Mode:', pieChartMode, 'Month:', pieChartMonth, 'Year:', pieChartYear);

  // Détection du thème
  const isDarkTheme = !document.body.classList.contains('light-theme');
  const textColor = isDarkTheme ? '#d1d5db' : '#4b5563';
  const gridColor = isDarkTheme ? 'rgba(75, 85, 99, 0.2)' : 'rgba(0, 0, 0, 0.05)';
  const pointBorderColor = isDarkTheme ? '#262626' : '#ffffff';

  // Palette de couleurs premium cohérente avec l'app (memoized)
  const chartPalette = React.useMemo(() => [
    '#dc2626', // Rouge primaire
    '#3b82f6', // Bleu
    '#10b981', // Vert
    '#f59e0b', // Amber
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#14b8a6', // Teal
    '#a78bfa', // Violet
    '#22d3ee', // Light cyan
    '#fbbf24', // Light amber
    '#fb7185', // Rose
    '#60a5fa'  // Light blue
  ], []);

  // Fonction pour mettre en surbrillance une portion du diagramme
  const getHighlightedChartData = (chartData, hoveredIndex) => {
    if (!chartData || hoveredIndex === null) {
      return chartData;
    }

    return {
      ...chartData,
      datasets: chartData.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor.map((color, index) => {
          // Si c'est l'index survolé, garder la couleur normale
          if (index === hoveredIndex) {
            return color;
          }
          // Sinon, réduire l'opacity pour le fade-out effect
          return color + '40'; // Ajoute '40' pour 25% opacity en hex
        })
      }))
    };
  };

  // Données des charts avec highlighting appliqué
  const highlightedClientChartData = React.useMemo(
    () => getHighlightedChartData(clientChartData, hoveredClientIndex),
    [clientChartData, hoveredClientIndex]
  );

  const highlightedEquipmentChartData = React.useMemo(
    () => getHighlightedChartData(equipmentChartData, hoveredEquipmentIndex),
    [equipmentChartData, hoveredEquipmentIndex]
  );

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
        const confirmedValues = [];
        const cumulativeValues = [];

        // Trie tous les mois par date (chronologiquement)
        const sortedMonths = Object.entries(yearlyCAData).sort((a, b) => {
          const [, dataA] = a;
          const [, dataB] = b;
          return dataA.month - dataB.month;
        });

        console.log(`📊 Graphique tendance: ${sortedMonths.length} mois trouvés (depuis ${sortedMonths[0]?.[0]} jusqu'à ${sortedMonths[sortedMonths.length-1]?.[0]})`);

        // Afficher TOUS les mois disponibles (pas juste les 12 derniers)
        let cumsum = 0; // Accumulateur pour le CA cumulatif
        sortedMonths.forEach(([key, data]) => {
          const monthName = new Date(data.year, data.month, 1).toLocaleDateString('fr-FR', {
            month: 'short',
            year: '2-digit'
          });

          labels.push(monthName);

          // CA confirmé de ce mois
          const monthConfirmedCA = data.confirmedCA || 0;
          confirmedValues.push(monthConfirmedCA);

          // CA cumulatif: accumuler progressivement
          cumsum += monthConfirmedCA;
          cumulativeValues.push(cumsum);
        });

        setChartData({
          labels,
          datasets: [
            {
              label: 'CA Cumulatif',
              data: cumulativeValues,
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#8b5cf6',
              pointBorderColor: pointBorderColor,
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7
            },
            {
              label: 'CA par Mois',
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

        // Créer le pie chart par client
        const clientCAMap = {};
        [...(breakdown.ongoingLocations || []), ...(breakdown.closedLocations || [])].forEach(location => {
          const client = location.client || 'N/A';
          const ca = location.caConfirmedThisMonth || location.caThisMonth || 0;
          clientCAMap[client] = (clientCAMap[client] || 0) + ca;
        });

        const clientLabels = Object.keys(clientCAMap);
        const clientValues = Object.values(clientCAMap);

        setClientChartData({
          labels: clientLabels,
          datasets: [
            {
              label: 'CA par Client',
              data: clientValues,
              backgroundColor: chartPalette.slice(0, clientLabels.length),
              borderColor: isDarkTheme ? '#1f2937' : '#ffffff',
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverBorderColor: isDarkTheme ? '#ffffff' : '#000000',
              hoverOffset: 8
            }
          ]
        });

        // Créer le pie chart par type de matériel
        const equipmentCAMap = {};
        [...(breakdown.ongoingLocations || []), ...(breakdown.closedLocations || [])].forEach(location => {
          const equipment = location.designation || 'N/A';
          const ca = location.caConfirmedThisMonth || location.caThisMonth || 0;
          equipmentCAMap[equipment] = (equipmentCAMap[equipment] || 0) + ca;
        });

        const equipmentLabels = Object.keys(equipmentCAMap);
        const equipmentValues = Object.values(equipmentCAMap);

        setEquipmentChartData({
          labels: equipmentLabels,
          datasets: [
            {
              label: 'CA par Matériel',
              data: equipmentValues,
              backgroundColor: chartPalette.slice(0, equipmentLabels.length),
              borderColor: isDarkTheme ? '#1f2937' : '#ffffff',
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverBorderColor: isDarkTheme ? '#ffffff' : '#000000',
              hoverOffset: 8
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
  }, [equipmentData, selectedMonth, selectedYear, refreshKey]);

  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Handlers pour les filtres des graphiques pie charts
  const handlePieChartModeChange = (mode) => {
    setPieChartMode(mode);
  };

  const handlePieChartMonthChange = (e) => {
    setPieChartMonth(parseInt(e.target.value));
  };

  const handlePieChartYearChange = (e) => {
    setPieChartYear(parseInt(e.target.value));
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

  // Handlers pour les clics sur les pie charts et légendes
  const handleClientClick = (clientName) => {
    console.log('👥 Click sur client:', clientName);
    setSelectedClient(clientName);
    setShowClientDetails(true);
  };

  const handleEquipmentTypeClick = (equipmentType) => {
    console.log('🔧 Click sur équipement:', equipmentType);
    setSelectedEquipmentType(equipmentType);
    setShowEquipmentDetails(true);
  };

  const handleCloseClientDetails = () => {
    setShowClientDetails(false);
    setSelectedClient(null);
  };

  const handleCloseEquipmentDetails = () => {
    setShowEquipmentDetails(false);
    setSelectedEquipmentType(null);
  };

  // useEffect séparé pour les graphiques pie charts avec leurs propres filtres
  useEffect(() => {
    const calculatePieChartData = async () => {
      try {
        console.log('📊 USEEFFECT LANCÉ - Mode:', pieChartMode, 'Mois:', pieChartMonth, 'Année:', pieChartYear);

        if (!equipmentData || equipmentData.length === 0) {
          console.warn('⚠️ Pas de données équipement disponibles');
          setClientChartData(null);
          setEquipmentChartData(null);
          return;
        }

        // Afficher le modal de chargement pour les deux modes
        setIsLoadingCA(true);

        let allLocations = [];
        const startTime = performance.now();

        if (pieChartMode === 'month') {
          // Mode mois: récupérer les données pour un mois spécifique
          console.log('📅 Mode MOIS - Récupération pour:', pieChartMonth, '/', pieChartYear);
          const breakdown = await analyticsService.getMonthLocationBreakdown(equipmentData, pieChartMonth, pieChartYear);
          console.log('📦 Breakdown reçu:', breakdown);
          if (breakdown && typeof breakdown === 'object') {
            allLocations = [...(breakdown.ongoingLocations || []), ...(breakdown.closedLocations || [])];
          }
          console.log('✅ Locations trouvées (mois):', allLocations.length);
          // Stocker les locations pour les modals détails
          setPieChartLocations(allLocations);
        } else {
          // Mode année: utiliser yearlyCAData (source de vérité)
          // IMPORTANT: Utilise exactement les mêmes données que le CA annuel pour cohérence!
          console.log('📈 Mode ANNÉE - Utilisation yearlyCAData (source de vérité)');

          // Récupérer yearlyCAData pour l'année sélectionnée
          const yearlyCAData = await analyticsService.getYearlyCAData(equipmentData, pieChartYear);

          console.log('⏱️ yearlyCAData récupérée en', Math.round(performance.now() - startTime), 'ms');

          // Extraire toutes les locations de yearlyCAData pour les modals détails
          const yearlyLocations = [];
          Object.values(yearlyCAData).forEach(monthData => {
            if (monthData.closedLocations) yearlyLocations.push(...monthData.closedLocations);
            if (monthData.ongoingLocations) yearlyLocations.push(...monthData.ongoingLocations);
          });
          setPieChartLocations(yearlyLocations);

          // Agréger CORRECTEMENT en utilisant la même logique que le CA annuel
          const breakdown = analyticsService.getYearClientAndEquipmentBreakdown(yearlyCAData);

          console.log('📊 Breakdown agrégé depuis yearlyCAData:');
          console.log(`  💰 CA total (cohérent avec haut): ${breakdown.totalCA}€`);
          console.log(`  👥 Clients: ${breakdown.clientLabels.length}`);
          console.log(`  🔧 Équipements: ${breakdown.equipmentLabels.length}`);
          console.log(`  📦 Locations: ${breakdown.totalLocations}`);

          // Utiliser directement les données du breakdown (déjà correctement agrégées)
          const newClientChartData = {
            labels: breakdown.clientLabels,
            datasets: [
              {
                label: 'CA par Client',
                data: breakdown.clientValues,
                backgroundColor: chartPalette.slice(0, breakdown.clientLabels.length),
                borderColor: isDarkTheme ? '#1f2937' : '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBorderColor: isDarkTheme ? '#ffffff' : '#000000',
                hoverOffset: 8
              }
            ]
          };
          console.log('📊 Client chart data créé:', newClientChartData.labels.length, 'clients');
          setClientChartData(newClientChartData);

          const newEquipmentChartData = {
            labels: breakdown.equipmentLabels,
            datasets: [
              {
                label: 'CA par Matériel',
                data: breakdown.equipmentValues,
                backgroundColor: chartPalette.slice(0, breakdown.equipmentLabels.length),
                borderColor: isDarkTheme ? '#1f2937' : '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBorderColor: isDarkTheme ? '#ffffff' : '#000000',
                hoverOffset: 8
              }
            ]
          };
          console.log('📊 Equipment chart data créé:', newEquipmentChartData.labels.length, 'matériels');
          setEquipmentChartData(newEquipmentChartData);

          // Pas besoin de continuer le code ci-dessous pour le mode année
          return;
        }

        // Code pour MODE MOIS (continuer l'agrégation manuelle)
        // Créer le pie chart par client
        const clientCAMap = {};
        allLocations.forEach(location => {
          const client = location.client || 'N/A';
          const ca = location.caConfirmedThisMonth || location.caThisMonth || 0;
          clientCAMap[client] = (clientCAMap[client] || 0) + ca;
        });

        const clientLabels = Object.keys(clientCAMap).sort();
        const clientValues = clientLabels.map(label => clientCAMap[label]);
        console.log('👥 Clients:', clientLabels.length, clientLabels.slice(0, 3));

        const newClientChartData = {
          labels: clientLabels,
          datasets: [
            {
              label: 'CA par Client',
              data: clientValues,
              backgroundColor: chartPalette.slice(0, clientLabels.length),
              borderColor: isDarkTheme ? '#1f2937' : '#ffffff',
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverBorderColor: isDarkTheme ? '#ffffff' : '#000000',
              hoverOffset: 8
            }
          ]
        };
        console.log('📊 Client chart data créé:', newClientChartData.labels.length, 'clients');
        setClientChartData(newClientChartData);

        // Créer le pie chart par type de matériel
        const equipmentCAMap = {};
        allLocations.forEach(location => {
          const equipment = location.designation || 'N/A';
          const ca = location.caConfirmedThisMonth || location.caThisMonth || 0;
          equipmentCAMap[equipment] = (equipmentCAMap[equipment] || 0) + ca;
        });

        const equipmentLabels = Object.keys(equipmentCAMap).sort();
        const equipmentValues = equipmentLabels.map(label => equipmentCAMap[label]);
        console.log('🔧 Matériels:', equipmentLabels.length, equipmentLabels.slice(0, 3));

        const newEquipmentChartData = {
          labels: equipmentLabels,
          datasets: [
            {
              label: 'CA par Matériel',
              data: equipmentValues,
              backgroundColor: chartPalette.slice(0, equipmentLabels.length),
              borderColor: isDarkTheme ? '#1f2937' : '#ffffff',
              borderWidth: 2,
              hoverBorderWidth: 3,
              hoverBorderColor: isDarkTheme ? '#ffffff' : '#000000',
              hoverOffset: 8
            }
          ]
        };
        console.log('📊 Equipment chart data créé:', newEquipmentChartData.labels.length, 'matériels');
        setEquipmentChartData(newEquipmentChartData);
      } catch (error) {
        console.error('❌ Erreur calcul pie charts:', error);
        setClientChartData(null);
        setEquipmentChartData(null);
      } finally {
        // Fermer le modal de chargement si en mode année
        setIsLoadingCA(false);
      }
    };

    console.log('🔍 Vérification avant calcul - equipment:', equipmentData?.length, 'pieChartMode:', pieChartMode);
    if (equipmentData && equipmentData.length > 0) {
      console.log('✅ Démarrage du calcul pie charts...');
      calculatePieChartData();
    } else {
      console.warn('⚠️ Pas de conditions remplies pour lancer le calcul');
      setClientChartData(null);
      setEquipmentChartData(null);
    }
  }, [equipmentData, pieChartMode, pieChartMonth, pieChartYear, chartPalette, isDarkTheme, refreshKey]);

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

          {/* Menu paramètres (roue crantée) */}
          <div className="ca-settings">
            <button
              className="ca-settings-btn"
              onClick={() => setShowSettingsMenu(prev => !prev)}
              disabled={isCleaningTestData}
              title="Paramètres Analytics"
            >
              ⚙️
            </button>

            {showSettingsMenu && (
              <>
                <div className="ca-settings-backdrop" onClick={() => setShowSettingsMenu(false)} />
                <div className="ca-settings-menu">
                  <button
                    className="ca-settings-item danger"
                    onClick={handleCleanupClientTest}
                    disabled={isCleaningTestData}
                  >
                    🗑️ Purger les données CLIENT TEST
                  </button>
                </div>
              </>
            )}
          </div>
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
              {monthName}
            </div>
            <div className="kpi-subtext">
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
              {monthName}
            </div>
            <div className="kpi-subtext">
              {selectedMonth === new Date().getMonth() && selectedYear === new Date().getFullYear()
                ? 'Jours effectifs uniquement'
                : 'Mois clôturé'}
            </div>
            <div className="kpi-footer">Cliquez pour voir les détails →</div>
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

      {/* Filtres pour les Graphiques de Répartition - Pie Charts */}
      <div className="pie-charts-filters">
        <div className="filter-section">
          <div className="filter-title">📊 Graphiques de Répartition</div>

          {/* Boutons Mode */}
          <div className="filter-group">
            <label>Période</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${pieChartMode === 'month' ? 'active' : ''}`}
                onClick={() => handlePieChartModeChange('month')}
              >
                📅 Mois
              </button>
              <button
                className={`filter-btn ${pieChartMode === 'year' ? 'active' : ''}`}
                onClick={() => handlePieChartModeChange('year')}
              >
                📈 Année
              </button>
            </div>
          </div>

          {/* Sélection Mois/Année */}
          {pieChartMode === 'month' && (
            <div className="filter-group">
              <div className="filter-row">
                <div className="filter-column">
                  <label htmlFor="pie-month-select">Mois</label>
                  <select
                    id="pie-month-select"
                    value={pieChartMonth}
                    onChange={handlePieChartMonthChange}
                    className="filter-select"
                  >
                    {[...Array(12)].map((_, i) => (
                      <option key={i} value={i}>
                        {new Date(2025, i, 1).toLocaleDateString('fr-FR', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-column">
                  <label htmlFor="pie-year-select">Année</label>
                  <select
                    id="pie-year-select"
                    value={pieChartYear}
                    onChange={handlePieChartYearChange}
                    className="filter-select"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {pieChartMode === 'year' && (
            <div className="filter-group">
              <label htmlFor="pie-year-only-select">Année</label>
              <select
                id="pie-year-only-select"
                value={pieChartYear}
                onChange={handlePieChartYearChange}
                className="filter-select"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Graphiques de Répartition - Pie Charts */}
      <div className="ca-charts-grid">
        {/* Pie Chart Répartition par Client */}
        <div className="ca-chart-container pie-container">
          <div className="chart-header">
            <h3 className="chart-title">👥 Répartition par Client</h3>
            <p className="chart-subtitle">Contribution de chaque client au CA</p>
          </div>

          <div className="pie-chart-wrapper">
            <div className="chart-wrapper pie-wrapper">
              {clientChartData && (
                <Pie
                  data={highlightedClientChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                      animateRotate: true,
                      animateScale: false,
                      duration: 750,
                      easing: 'easeInOutQuart'
                    },
                    interaction: {
                      intersect: false
                    },
                    onHover: (event, activeElements) => {
                      if (activeElements && activeElements.length > 0) {
                        setHoveredClientIndex(activeElements[0].index);
                      } else {
                        setHoveredClientIndex(null);
                      }
                    },
                    onClick: (event, activeElements) => {
                      if (activeElements && activeElements.length > 0) {
                        const index = activeElements[0].index;
                        if (clientChartData && clientChartData.labels[index]) {
                          handleClientClick(clientChartData.labels[index]);
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        enabled: true,
                        backgroundColor: isDarkTheme ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        padding: 14,
                        titleFont: { size: 13, weight: 'bold', family: "'Segoe UI', 'Roboto', sans-serif" },
                        bodyFont: { size: 12, family: "'Segoe UI', 'Roboto', sans-serif" },
                        titleColor: isDarkTheme ? '#fbbf24' : '#dc2626',
                        bodyColor: isDarkTheme ? '#d1d5db' : '#374151',
                        borderColor: isDarkTheme ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.2)',
                        borderWidth: 2,
                        borderRadius: 6,
                        displayColors: true,
                        boxPadding: 6,
                        callbacks: {
                          title: (context) => context[0].label || 'Client',
                          label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `CA: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
                          },
                          afterLabel: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Pourcentage: ${percentage}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
            {clientChartData && (
              <ChartLegend
                labels={clientChartData.labels}
                values={clientChartData.datasets[0].data}
                colors={clientChartData.datasets[0].backgroundColor}
                isDarkTheme={isDarkTheme}
                hoveredIndex={hoveredClientIndex}
                onLegendHover={setHoveredClientIndex}
                onLegendLeave={() => setHoveredClientIndex(null)}
                onItemClick={(label) => handleClientClick(label)}
              />
            )}
          </div>
        </div>

        {/* Pie Chart Répartition par Type de Matériel */}
        <div className="ca-chart-container pie-container">
          <div className="chart-header">
            <h3 className="chart-title">🔧 Répartition par Matériel</h3>
            <p className="chart-subtitle">Contribution de chaque type de matériel au CA</p>
          </div>

          <div className="pie-chart-wrapper">
            <div className="chart-wrapper pie-wrapper">
              {equipmentChartData && (
                <Pie
                  data={highlightedEquipmentChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    animation: {
                      animateRotate: true,
                      animateScale: false,
                      duration: 750,
                      easing: 'easeInOutQuart'
                    },
                    interaction: {
                      intersect: false
                    },
                    onHover: (event, activeElements) => {
                      if (activeElements && activeElements.length > 0) {
                        setHoveredEquipmentIndex(activeElements[0].index);
                      } else {
                        setHoveredEquipmentIndex(null);
                      }
                    },
                    onClick: (event, activeElements) => {
                      if (activeElements && activeElements.length > 0) {
                        const index = activeElements[0].index;
                        if (equipmentChartData && equipmentChartData.labels[index]) {
                          handleEquipmentTypeClick(equipmentChartData.labels[index]);
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        enabled: true,
                        backgroundColor: isDarkTheme ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        padding: 14,
                        titleFont: { size: 13, weight: 'bold', family: "'Segoe UI', 'Roboto', sans-serif" },
                        bodyFont: { size: 12, family: "'Segoe UI', 'Roboto', sans-serif" },
                        titleColor: isDarkTheme ? '#fbbf24' : '#dc2626',
                        bodyColor: isDarkTheme ? '#d1d5db' : '#374151',
                        borderColor: isDarkTheme ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.2)',
                        borderWidth: 2,
                        borderRadius: 6,
                        displayColors: true,
                        boxPadding: 6,
                        callbacks: {
                          title: (context) => context[0].label || 'Matériel',
                          label: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `CA: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
                          },
                          afterLabel: (context) => {
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `Pourcentage: ${percentage}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
            {equipmentChartData && (
              <ChartLegend
                labels={equipmentChartData.labels}
                values={equipmentChartData.datasets[0].data}
                colors={equipmentChartData.datasets[0].backgroundColor}
                isDarkTheme={isDarkTheme}
                hoveredIndex={hoveredEquipmentIndex}
                onLegendHover={setHoveredEquipmentIndex}
                onLegendLeave={() => setHoveredEquipmentIndex(null)}
                onItemClick={(label) => handleEquipmentTypeClick(label)}
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

      {/* Modal de Chargement CA */}
      <CALoadingModal
        isOpen={isLoadingCA}
        mode={pieChartMode}
      />

      {/* Modal Détails Client */}
      <ClientDetailsModal
        isOpen={showClientDetails}
        onClose={handleCloseClientDetails}
        clientName={selectedClient}
        pieChartMode={pieChartMode}
        month={pieChartMonth}
        year={pieChartYear}
        locationData={pieChartLocations}
      />

      {/* Modal Détails Équipement */}
      <EquipmentTypeDetailsModal
        isOpen={showEquipmentDetails}
        onClose={handleCloseEquipmentDetails}
        equipmentType={selectedEquipmentType}
        pieChartMode={pieChartMode}
        month={pieChartMonth}
        year={pieChartYear}
        locationData={pieChartLocations}
        equipmentData={equipmentData}
      />
    </div>
  );
};

export default CAModule;
