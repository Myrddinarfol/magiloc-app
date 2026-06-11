import React, { useState } from 'react';
import Papa from 'papaparse';

function CSVImporter({ onDataImported, showToast, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setError('');

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        console.log('📄 Lignes brutes parsées:', results.data.length);
        
        // Transformation ET filtrage des lignes valides
const transformedData = results.data
  .filter(row => {
    const numSerie = row['Numéro de Série'] || row['N° SERIE'] || '';
    const cleaned = numSerie.trim();
    // Accepte tant qu'il y a quelque chose après trim (même /, -, etc.)
    const isValid = cleaned.length > 0;
    
    // Debug : affiche les lignes rejetées
    if (!isValid) {
      console.warn('❌ Ligne rejetée (N° série vide):', row['Désignation']);
    }
    
    return isValid;
  })
  .map((row, index) => {
    // Fonction pour convertir date JJ/MM/AAAA vers AAAA-MM-JJ ou null
    const convertDate = (dateStr) => {
      if (!dateStr || dateStr.trim() === '') return null;
      const parts = dateStr.trim().split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return null;
    };

    return {
      id: index + 1,
      designation: row['Désignation'] || row['DESIGNATION'] || '',
      cmu: row['CMU'] || '',
      modele: row['Modèle'] || row['MODELE'] || '',
      marque: row['Marque'] || row['MARQUE'] || '',
      longueur: row['Longeur Chaîne/Câble'] || row['LONGUEUR'] || '',
      infosComplementaires: row['Infos Complémentaires'] || row['INFOS'] || '',
      numeroSerie: (row['Numéro de Série'] || row['N° SERIE'] || '').trim(),
      statut: row['Statut'] || row['statut'] || row['STATUT'] || 'Sur Parc',
      debutLocation: row['Début Location'] || row['DEBUT LOCATION'] || '',
      finLocationTheorique: row['Fin de Location Théorique'] || row['FIN DE LOCATION THEORIQUE'] || '',
      rentreeLe: row['Rentré Le'] || row['RENTRE LE'] || '',
      client: row['Client'] || row['CLIENT'] || '',
      numeroOffre: row['N° OFFRE'] || row['N OFFRE'] || '',
      notesLocation: row['NOTES LOCATION'] || row['Notes Location'] || '',
      noteRetour: row['NOTE RETOUR'] || row['Note Retour'] || row['NOTES RETOUR'] || '',
      prixHT: (row['Prix HT/J'] || row['PRIX HT/J'] || '').replace(/[€\s]/g, '').replace(',', '.') || null,
      etat: row['État'] || row['ETAT'] || 'Moyen',
      motifMaintenance: row['Motif de Maintenance'] || row['MOTIF DE MAINTENANCE'] || '',
      certificat: row['Certificat / V-TIC'] || row['CERTIFICAT / V-TIC'] || '',
      dernierVGP: convertDate(row['Dernier VGP'] || row['DERNIER VGP']),
      prochainVGP: convertDate(row['Prochain VGP'] || row['PROCHAIN VGP'])
    };
  });

        console.log(`✅ ${transformedData.length} équipements valides (sur ${results.data.length} lignes parsées)`);

        try {
          console.log('📤 Envoi au backend...');
          const response = await fetch(`${API_URL}/api/equipment/import`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(transformedData)
          });

          if (!response.ok) {
            throw new Error('Erreur lors de l\'import vers le backend');
          }

          const result = await response.json();
          console.log('✅ Import réussi:', result);

          onDataImported(transformedData);
          if (showToast) {
            showToast(`${transformedData.length} équipements importés avec succès !`, 'success');
          }
          
        } catch (err) {
          console.error('❌ Erreur:', err);
          setError('Erreur lors de l\'envoi au serveur.');
        } finally {
          setIsLoading(false);
        }
      },
      error: (error) => {
        console.error('❌ Erreur parsing CSV:', error);
        setIsLoading(false);
        setError('Erreur lors de la lecture du fichier CSV');
      }
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          style={{
            backgroundColor: 'var(--bg-card, #2a2a2a)',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Bouton Fermer */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-primary, #f3f4f6)',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.2)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            title="Fermer"
          >
            ✕
          </button>

          <h3 style={{
            margin: '0 0 10px 0',
            color: 'var(--text-primary, #f3f4f6)',
            fontSize: '20px',
            fontWeight: '600'
          }}>
            📥 Importer votre fichier CSV
          </h3>

          <p style={{
            color: 'var(--text-muted, #9ca3af)',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            Sélectionnez votre fichier CSV pour importer tous vos équipements
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            style={{
              padding: '14px',
              border: '2px dashed rgba(220, 38, 38, 0.4)',
              borderRadius: '8px',
              width: '100%',
              backgroundColor: isLoading ? 'rgba(107, 114, 128, 0.1)' : 'rgba(34, 197, 94, 0.05)',
              color: 'var(--text-primary, #f3f4f6)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxSizing: 'border-box',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          />

          {isLoading && (
            <p style={{
              color: '#3b82f6',
              marginTop: '15px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ⏳ Import en cours...
            </p>
          )}

          {fileName && !isLoading && !error && (
            <p style={{
              color: '#22c55e',
              marginTop: '15px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ✅ Fichier importé : {fileName}
            </p>
          )}

          {error && (
            <p style={{
              color: '#ef4444',
              marginTop: '15px',
              fontWeight: '600',
              textAlign: 'center'
            }}>
              ❌ {error}
            </p>
          )}

          {/* Bouton Annuler */}
          {!isLoading && (
            <button
              onClick={onClose}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '12px',
                backgroundColor: 'rgba(107, 114, 128, 0.2)',
                color: 'var(--text-primary, #f3f4f6)',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.3)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default CSVImporter;