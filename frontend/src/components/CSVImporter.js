import React, { useState } from 'react';
import Papa from 'papaparse';

function CSVImporter({ onDataImported }) {
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
  .map((row, index) => ({
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
    prixHT: (row['Prix HT/J'] || row['PRIX HT/J'] || '').replace(/[€\s]/g, '').replace(',', '.') || null,
    etat: row['État'] || row['ETAT'] || 'Moyen',
    motifMaintenance: row['Motif de Maintenance'] || row['MOTIF DE MAINTENANCE'] || '',
    certificat: row['Certificat / V-TIC'] || row['CERTIFICAT / V-TIC'] || '',
    dernierVGP: row['Dernier VGP'] || row['DERNIER VGP'] || '',
    prochainVGP: row['Prochain VGP'] || row['PROCHAIN VGP'] || ''
  }));

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
          alert(`✅ ${transformedData.length} équipements importés avec succès !`);
          
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
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      margin: '20px 0'
    }}>
      <h3>Importer votre fichier CSV</h3>
      <p style={{ color: '#666', marginBottom: '15px' }}>
        Sélectionnez votre fichier CSV pour importer tous vos équipements
      </p>
      
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        disabled={isLoading}
        style={{
          padding: '10px',
          border: '2px dashed #ccc',
          borderRadius: '4px',
          width: '100%',
          backgroundColor: isLoading ? '#e5e5e5' : '#f9f9f9',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
      />
      
      {isLoading && (
        <p style={{ color: '#2563eb', marginTop: '10px', fontWeight: 'bold' }}>
          Import en cours...
        </p>
      )}
      
      {fileName && !isLoading && !error && (
        <p style={{ color: '#16a34a', marginTop: '10px', fontWeight: 'bold' }}>
          Fichier importé : {fileName}
        </p>
      )}

      {error && (
        <p style={{ color: '#dc2626', marginTop: '10px', fontWeight: 'bold' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default CSVImporter;