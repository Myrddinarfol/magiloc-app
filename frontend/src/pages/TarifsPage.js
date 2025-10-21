import React, { useState, useMemo } from 'react';
import { equipmentService } from '../services/equipmentService';
import { useUI } from '../hooks/useUI';
import './TarifsPage.css';

const TarifsPage = ({ equipmentData, onRefresh }) => {
  const { showToast } = useUI();
  const [editingTariffs, setEditingTariffs] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Grouper les équipements par (designation + CMU) - clé unique
  const groupedTariffs = useMemo(() => {
    if (!equipmentData || equipmentData.length === 0) return [];

    const groups = {};

    equipmentData.forEach(eq => {
      const key = `${eq.designation}||${eq.cmu}`;

      if (!groups[key]) {
        // Prendre les valeurs du premier équipement du groupe
        groups[key] = {
          key,
          designation: eq.designation,
          cmu: eq.cmu,
          label: `${eq.designation} ${eq.cmu ? `- ${eq.cmu}` : ''}`,
          prixHT: eq.prixHT,
          minimumFacturation: eq.minimumFacturation,
          count: 0,
          equipmentIds: []
        };
      }

      groups[key].count++;
      groups[key].equipmentIds.push(eq.id);
    });

    // Convertir en array et trier par désignation + CMU
    return Object.values(groups).sort((a, b) => {
      const desComp = a.designation.localeCompare(b.designation);
      if (desComp !== 0) return desComp;
      return (a.cmu || '').localeCompare(b.cmu || '');
    });
  }, [equipmentData]);

  // Filtrer les tarifs selon la sélection
  const filteredTariffs = useMemo(() => {
    if (!selectedFilter) return groupedTariffs;
    return groupedTariffs.filter(t => t.key === selectedFilter);
  }, [groupedTariffs, selectedFilter]);

  // Mettre à jour un tarif (édition locale)
  const handleTarifChange = (key, field, value) => {
    setEditingTariffs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
        isDirty: true
      }
    }));
  };

  // Sauvegarder un tarif individuel
  const handleSaveTarif = async (tariff) => {
    try {
      setIsLoading(true);
      const changes = editingTariffs[tariff.key];

      if (!changes) {
        showToast('Aucune modification à appliquer', 'info');
        return;
      }

      const updateData = {
        prixHT: changes.prixHT !== undefined ? parseFloat(changes.prixHT) : tariff.prixHT,
        minimumFacturation: changes.minimumFacturation !== undefined
          ? parseFloat(changes.minimumFacturation)
          : tariff.minimumFacturation
      };

      // Mettre à jour tous les équipements du groupe
      const updatePromises = tariff.equipmentIds.map(id =>
        equipmentService.update(id, updateData)
      );

      await Promise.all(updatePromises);

      console.log(`✅ Tarif mis à jour pour ${tariff.label} (${tariff.count} équipements)`);

      // Nettoyer l'état d'édition
      setEditingTariffs(prev => {
        const newState = { ...prev };
        delete newState[tariff.key];
        return newState;
      });

      showToast(`✅ Tarif mis à jour pour ${tariff.label} (${tariff.count} équipements)`, 'success');

      // Rafraîchir les données
      await onRefresh();
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du tarif:', error);
      showToast(`Erreur: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder tous les tarifs modifiés
  const handleSaveAll = async () => {
    try {
      setIsLoading(true);
      const modifiedTariffs = Object.entries(editingTariffs)
        .filter(([_, changes]) => changes.isDirty)
        .map(([key, _]) => groupedTariffs.find(t => t.key === key))
        .filter(Boolean);

      if (modifiedTariffs.length === 0) {
        showToast('Aucune modification à appliquer', 'info');
        return;
      }

      let totalUpdated = 0;

      for (const tariff of modifiedTariffs) {
        const changes = editingTariffs[tariff.key];
        const updateData = {
          prixHT: changes.prixHT !== undefined ? parseFloat(changes.prixHT) : tariff.prixHT,
          minimumFacturation: changes.minimumFacturation !== undefined
            ? parseFloat(changes.minimumFacturation)
            : tariff.minimumFacturation
        };

        const updatePromises = tariff.equipmentIds.map(id =>
          equipmentService.update(id, updateData)
        );

        await Promise.all(updatePromises);
        totalUpdated += tariff.equipmentIds.length;
      }

      console.log(`✅ ${totalUpdated} équipements mis à jour`);

      // Nettoyer l'état d'édition
      setEditingTariffs({});

      showToast(`✅ ${totalUpdated} équipements mis à jour avec succès !`, 'success');

      // Rafraîchir les données
      await onRefresh();
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour globale:', error);
      showToast(`Erreur: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTarifValue = (tariff, field) => {
    const editing = editingTariffs[tariff.key];
    if (editing && editing[field] !== undefined) {
      return editing[field];
    }
    return tariff[field] || '';
  };

  const hasChanges = (tariff) => {
    return editingTariffs[tariff.key]?.isDirty === true;
  };

  const hasAnyChanges = Object.values(editingTariffs).some(changes => changes.isDirty);

  return (
    <div className="tarifs-page">
      <div className="tarifs-header">
        <h2>💰 Gestion des Tarifs</h2>
        <p className="tarifs-subtitle">Gérez et appliquez facilement les modifications tarifaires</p>
      </div>

      <div className="tarifs-toolbar">
        <div className="tarifs-filters">
          <label htmlFor="tarif-filter">Filtrer par type de matériel :</label>
          <select
            id="tarif-filter"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="tarif-filter-select"
          >
            <option value="">-- Tous les matériels --</option>
            {groupedTariffs.map(tariff => (
              <option key={tariff.key} value={tariff.key}>
                {tariff.label} ({tariff.count} équipement{tariff.count > 1 ? 's' : ''})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={!hasAnyChanges || isLoading}
          className="btn btn-confirm tarif-btn-validate-all"
        >
          ✅ Valider tout
        </button>
      </div>

      {filteredTariffs.length === 0 ? (
        <div className="tarifs-empty">
          <p>Aucun matériel trouvé</p>
        </div>
      ) : (
        <div className="tarifs-grid">
          <table className="tarifs-table">
            <thead>
              <tr>
                <th className="col-material">Type de Matériel</th>
                <th className="col-count">Quantité</th>
                <th className="col-prix">Prix HT/J (€)</th>
                <th className="col-minimum">Minimum de facturation (€)</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTariffs.map(tariff => (
                <tr key={tariff.key} className={`tarif-row ${hasChanges(tariff) ? 'modified' : ''}`}>
                  <td className="col-material">
                    <strong>{tariff.label}</strong>
                  </td>
                  <td className="col-count">
                    <span className="count-badge">{tariff.count}</span>
                  </td>
                  <td className="col-prix">
                    <input
                      type="number"
                      step="0.01"
                      value={getTarifValue(tariff, 'prixHT')}
                      onChange={(e) => handleTarifChange(tariff.key, 'prixHT', e.target.value)}
                      className={`tarif-input ${hasChanges(tariff) ? 'dirty' : ''}`}
                      disabled={isLoading}
                    />
                  </td>
                  <td className="col-minimum">
                    <input
                      type="number"
                      step="0.01"
                      value={getTarifValue(tariff, 'minimumFacturation')}
                      onChange={(e) => handleTarifChange(tariff.key, 'minimumFacturation', e.target.value)}
                      className={`tarif-input ${hasChanges(tariff) ? 'dirty' : ''}`}
                      disabled={isLoading}
                    />
                  </td>
                  <td className="col-action">
                    <button
                      onClick={() => handleSaveTarif(tariff)}
                      disabled={!hasChanges(tariff) || isLoading}
                      className={`btn btn-small ${hasChanges(tariff) ? 'btn-confirm' : 'btn-disabled'}`}
                    >
                      {hasChanges(tariff) ? '💾 MAJ' : '✓'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TarifsPage;
