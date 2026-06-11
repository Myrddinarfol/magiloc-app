import React, { useState, useMemo } from 'react';
import { equipmentService } from '../services/equipmentService';
import { useUI } from '../hooks/useUI';
import PageHeader from '../components/common/PageHeader';
import './TarifsPage.css';

const TarifsPage = ({ equipmentData, onRefresh }) => {
  const { showToast } = useUI();
  const [editingTariffs, setEditingTariffs] = useState({});
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Catégories avec tarification par modèle (designation + cmu)
  const TARIF_PAR_MODELE_CONFIG = [
    { designation: 'TREUIL ELECTRIQUE', cmu: '300KG' },
    { designation: 'TREUIL ELECTRIQUE', cmu: '500KG' }
  ];

  const isTarifParModele = (eq) => {
    return TARIF_PAR_MODELE_CONFIG.some(config =>
      eq.designation === config.designation && eq.cmu === config.cmu
    );
  };

  // Grouper les équipements - avec sous-sections par modèle pour certaines catégories
  const groupedTariffs = useMemo(() => {
    if (!equipmentData || equipmentData.length === 0) return [];

    // Debug: afficher les treuils et leurs modèles
    const treuilsData = equipmentData.filter(eq => eq.designation?.includes('TREUIL ELECTRIQUE'));
    if (treuilsData.length > 0) {
      console.log('🔧 Treuils trouvés:', treuilsData.map(eq => ({
        designation: eq.designation,
        cmu: eq.cmu,
        modele: eq.modele
      })));
    }

    const groups = {};

    equipmentData.forEach(eq => {
      const isModeleType = isTarifParModele(eq);
      const key = isModeleType
        ? `${eq.designation}||${eq.cmu}||${eq.modele || 'N/A'}`
        : `${eq.designation}||${eq.cmu}`;

      if (!groups[key]) {
        groups[key] = {
          key,
          designation: eq.designation,
          cmu: eq.cmu,
          modele: eq.modele,
          label: isModeleType
            ? `${eq.designation} ${eq.cmu ? `- ${eq.cmu}` : ''} • ${eq.modele || 'Sans modèle'}`
            : `${eq.designation} ${eq.cmu ? `- ${eq.cmu}` : ''}`,
          prixHT: eq.prixHT,
          minimumFacturation: eq.minimumFacturation,
          idArticle: eq.idArticle,
          count: 0,
          equipmentIds: [],
          isTarifParModele: isModeleType
        };
      }

      groups[key].count++;
      groups[key].equipmentIds.push(eq.id);
    });

    // Convertir en array et trier
    return Object.values(groups).sort((a, b) => {
      const desComp = a.designation.localeCompare(b.designation);
      if (desComp !== 0) return desComp;
      if ((a.cmu || '') !== (b.cmu || '')) return (a.cmu || '').localeCompare(b.cmu || '');
      return (a.modele || '').localeCompare(b.modele || '');
    });
  }, [equipmentData]);

  // Grouper les tarifs pour l'affichage avec sections et sous-sections
  const displayGroups = useMemo(() => {
    const groups = {};

    groupedTariffs.forEach(tariff => {
      const parentKey = `${tariff.designation}||${tariff.cmu}`;

      if (!groups[parentKey]) {
        groups[parentKey] = {
          parentKey,
          designation: tariff.designation,
          cmu: tariff.cmu,
          label: `${tariff.designation} ${tariff.cmu ? `- ${tariff.cmu}` : ''}`,
          isTarifParModele: tariff.isTarifParModele,
          subTariffs: [],
          totalCount: 0
        };
      }

      groups[parentKey].subTariffs.push(tariff);
      groups[parentKey].totalCount += tariff.count;
    });

    const result = Object.values(groups).sort((a, b) => {
      const desComp = a.designation.localeCompare(b.designation);
      if (desComp !== 0) return desComp;
      return (a.cmu || '').localeCompare(b.cmu || '');
    });

    console.log('📊 displayGroups:', result.map(g => ({
      label: g.label,
      isTarifParModele: g.isTarifParModele,
      subTariffs: g.subTariffs.length
    })));

    return result;
  }, [groupedTariffs]);

  const toggleGroupExpanded = (key) => {
    setExpandedGroups(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filtrer les groupes d'affichage selon la sélection
  const filteredGroups = useMemo(() => {
    if (!selectedFilter) return displayGroups;
    return displayGroups.filter(g => g.parentKey === selectedFilter);
  }, [displayGroups, selectedFilter]);

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
          : tariff.minimumFacturation,
        idArticle: changes.idArticle !== undefined ? changes.idArticle : tariff.idArticle
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
            : tariff.minimumFacturation,
          idArticle: changes.idArticle !== undefined ? changes.idArticle : tariff.idArticle
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
    const value = tariff[field];
    // Traiter 0 et undefined/null comme vides pour les champs minimum et prixHT
    if (value === 0 || value === null || value === undefined) {
      return '';
    }
    return value;
  };

  const hasChanges = (tariff) => {
    return editingTariffs[tariff.key]?.isDirty === true;
  };

  const hasAnyChanges = Object.values(editingTariffs).some(changes => changes.isDirty);

  return (
    <div className="tarifs-page">
      <PageHeader
        icon="💰"
        title="Gestion des Tarifs"
        subtitle="TARIFICATION"
        description="Gérez facilement les tarifs de location et les minima de facturation pour chaque type de matériel"
      />

      <div className="tarifs-controls">
        <div className="tarifs-filter-container">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">-- Tous les matériels --</option>
            {displayGroups.map(group => (
              <option key={group.parentKey} value={group.parentKey}>
                {group.label} ({group.totalCount})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={!hasAnyChanges || isLoading}
          className="btn btn-success tarif-btn-validate-all"
        >
          ✅ Valider tout
        </button>
      </div>

      {filteredGroups.length === 0 ? (
        <div className="tarifs-empty">
          <p>Aucun matériel trouvé</p>
        </div>
      ) : (
        <div className="tarifs-table-container">
          <table className="tarifs-table">
            <thead>
              <tr>
                <th className="col-material">Type de Matériel</th>
                <th className="col-count">Quantité</th>
                <th className="col-prix">Prix HT/J (€)</th>
                <th className="col-minimum">Minimum de facturation (€)</th>
                <th className="col-id-article">ID ARTICLE</th>
                <th className="col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map(group => {
                const isExpanded = expandedGroups[group.parentKey];

                // Si c'est un groupe sans modèles, afficher une ligne simple
                if (!group.isTarifParModele) {
                  const tariff = group.subTariffs[0];
                  return (
                    <tr key={group.parentKey} className={`tarif-row ${hasChanges(tariff) ? 'modified' : ''}`}>
                      <td className="col-material">
                        <span className="material-name">{tariff.label}</span>
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
                      <td className="col-id-article">
                        <input
                          type="text"
                          value={getTarifValue(tariff, 'idArticle')}
                          onChange={(e) => handleTarifChange(tariff.key, 'idArticle', e.target.value)}
                          className={`tarif-input ${hasChanges(tariff) ? 'dirty' : ''}`}
                          disabled={isLoading}
                          placeholder="-"
                        />
                      </td>
                      <td className="col-action">
                        <button
                          onClick={() => handleSaveTarif(tariff)}
                          disabled={!hasChanges(tariff) || isLoading}
                          className={`btn btn-small ${hasChanges(tariff) ? 'btn-success' : 'btn-disabled'}`}
                        >
                          {hasChanges(tariff) ? '💾 MAJ' : '✓'}
                        </button>
                      </td>
                    </tr>
                  );
                }

                // Pour les groupes avec modèles, afficher ligne cliquable + tableau expandu
                return (
                  <React.Fragment key={group.parentKey}>
                    {/* Ligne parent cliquable */}
                    <tr
                      className="tarif-group-row"
                      onClick={() => setExpandedGroups(prev => ({
                        ...prev,
                        [group.parentKey]: !isExpanded
                      }))}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="col-material">
                        <span className="material-name">
                          {isExpanded ? '▼' : '▶'} {group.label}
                        </span>
                      </td>
                      <td className="col-count">
                        <span className="count-badge">{group.totalCount}</span>
                      </td>
                      <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        {isExpanded ? 'Cliquez pour replier' : 'Cliquez pour dérouler'}
                      </td>
                    </tr>

                    {/* Tableau des modèles si expandu */}
                    {isExpanded && (
                      <tr className="tarif-modele-table-row">
                        <td colSpan="6">
                          <div className="modele-table-wrapper">
                            <table className="modele-table">
                              <thead>
                                <tr>
                                  <th>Modèle</th>
                                  <th>Quantité</th>
                                  <th>Prix HT/J (€)</th>
                                  <th>Minimum (€)</th>
                                  <th>ID ARTICLE</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.subTariffs.map(tariff => (
                                  <tr key={tariff.key} className={hasChanges(tariff) ? 'modified' : ''}>
                                    <td className="modele-col-name">
                                      🔧 {tariff.modele || 'Sans modèle'}
                                    </td>
                                    <td className="modele-col-count">{tariff.count}</td>
                                    <td className="modele-col-prix">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={getTarifValue(tariff, 'prixHT')}
                                        onChange={(e) => handleTarifChange(tariff.key, 'prixHT', e.target.value)}
                                        className={`tarif-input ${hasChanges(tariff) ? 'dirty' : ''}`}
                                        disabled={isLoading}
                                      />
                                    </td>
                                    <td className="modele-col-minimum">
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={getTarifValue(tariff, 'minimumFacturation')}
                                        onChange={(e) => handleTarifChange(tariff.key, 'minimumFacturation', e.target.value)}
                                        className={`tarif-input ${hasChanges(tariff) ? 'dirty' : ''}`}
                                        disabled={isLoading}
                                      />
                                    </td>
                                    <td className="modele-col-id">
                                      <input
                                        type="text"
                                        value={getTarifValue(tariff, 'idArticle')}
                                        onChange={(e) => handleTarifChange(tariff.key, 'idArticle', e.target.value)}
                                        className={`tarif-input ${hasChanges(tariff) ? 'dirty' : ''}`}
                                        disabled={isLoading}
                                        placeholder="-"
                                      />
                                    </td>
                                    <td className="modele-col-action">
                                      <button
                                        onClick={() => handleSaveTarif(tariff)}
                                        disabled={!hasChanges(tariff) || isLoading}
                                        className={`btn btn-small ${hasChanges(tariff) ? 'btn-success' : 'btn-disabled'}`}
                                      >
                                        {hasChanges(tariff) ? '💾 MAJ' : '✓'}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TarifsPage;
