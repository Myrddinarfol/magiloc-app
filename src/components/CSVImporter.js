import React, { useState } from 'react';
import Papa from 'papaparse';

function CSVImporter({ onDataImported }) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    Papa.parse(file, {
      header: true, // Utilise la première ligne comme en-têtes
      skipEmptyLines: true,
      complete: (results) => {
        console.log('Données importées:', results.data);
        
        // Transformation des données pour correspondre à notre structure
        const transformedData = results.data.map((row, index) => ({
          id: index + 1,
          designation: row['Désignation'] || row['DESIGNATION'] || '',
          cmu: row['CMU'] || '',
          modele: row['Modèle'] || row['MODELE'] || '',
          marque: row['Marque'] || row['MARQUE'] || '',
          longueur: row['Longeur Chaîne/Câble'] || row['LONGUEUR'] || '',
          infosComplementaires: row['Infos Complémentaires'] || row['INFOS'] || '',
          numeroSerie: row['Numéro de Série'] || row['N° SERIE'] || '',
          disponibilite: row['Disponibilité'] || row['ETAT'] || 'Sur Parc',
          debutLocation: row['Début Location'] || '',
          finLocationTheorique: row['Fin de Location Théorique'] || '',
          rentreeLe: row['Rentré Le'] || '',
          client: row['Client'] || '',
          numeroOffre: row['N° OFFRE'] || '',
          notesLocation: row['NOTES LOCATION'] || '',
          prixHT: row['Prix HT/J'] || '',
          etat: row['État'] || 'Moyen',
          motifMaintenance: row['Motif de Maintenance'] || '',
          certificat: row['Certificat / V-TIC'] || '',
          dernierVGP: row['Dernier VGP'] || '',
          prochainVGP: row['Prochain VGP'] || ''
        }));

        onDataImported(transformedData);
        setIsLoading(false);
      },
      error: (error) => {
        console.error('Erreur lors de l\'import:', error);
        setIsLoading(false);
        alert('Erreur lors de l\'import du fichier CSV');
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
        style={{
          padding: '10px',
          border: '2px dashed #ccc',
          borderRadius: '4px',
          width: '100%',
          backgroundColor: '#f9f9f9'
        }}
      />
      
      {isLoading && (
        <p style={{ color: '#2563eb', marginTop: '10px' }}>
          Import en cours...
        </p>
      )}
      
      {fileName && !isLoading && (
        <p style={{ color: '#16a34a', marginTop: '10px' }}>
          Fichier importé : {fileName}
        </p>
      )}
    </div>
  );
}

export default CSVImporter;