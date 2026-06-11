/**
 * Recherche intelligente pour équipements
 * Permet de rechercher sur plusieurs champs avec des termes partiels
 */

export const smartSearch = (equipment, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return true;

  const searchLower = searchTerm.toLowerCase().trim();

  // Tous les champs où on peut chercher
  const searchableFields = {
    designation: equipment.designation || '',
    numeroSerie: equipment.numeroSerie || '',
    modele: equipment.modele || '',
    client: equipment.client || '',
    cmu: equipment.cmu || '',
    longueur: equipment.longueur || '',
    marque: equipment.marque || '',
    infosComplementaires: equipment.infosComplementaires || '',
    etat: equipment.etat || '',
    statut: equipment.statut || ''
  };

  // Si la recherche est une phrase entière, chercher dans chaque champ
  const terms = searchLower.split(/\s+/).filter(t => t.length > 0);

  // Si un seul terme, faire une recherche simple
  if (terms.length === 1) {
    const term = terms[0];
    return Object.values(searchableFields).some(field =>
      field.toLowerCase().includes(term)
    );
  }

  // Plusieurs termes: chaque terme doit matcher AU MOINS UN champ
  return terms.every(term => {
    return Object.values(searchableFields).some(field =>
      field.toLowerCase().includes(term)
    );
  });
};

/**
 * Recherche intelligente avec scoring
 * Retourne les résultats triés par pertinence
 */
export const smartSearchWithScore = (equipment, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return { match: true, score: 0 };

  const searchLower = searchTerm.toLowerCase().trim();
  let score = 0;

  // Poids des champs (champs plus importants = score plus élevé)
  const fieldWeights = {
    designation: 100,
    numeroSerie: 80,
    cmu: 70,
    longueur: 60,
    modele: 50,
    marque: 40,
    client: 30,
    etat: 20,
    infosComplementaires: 10,
    statut: 5
  };

  const searchableFields = {
    designation: equipment.designation || '',
    numeroSerie: equipment.numeroSerie || '',
    modele: equipment.modele || '',
    client: equipment.client || '',
    cmu: equipment.cmu || '',
    longueur: equipment.longueur || '',
    marque: equipment.marque || '',
    infosComplementaires: equipment.infosComplementaires || '',
    etat: equipment.etat || '',
    statut: equipment.statut || ''
  };

  const terms = searchLower.split(/\s+/).filter(t => t.length > 0);

  // Vérifier chaque terme
  for (const term of terms) {
    let foundInField = false;

    for (const [fieldName, fieldValue] of Object.entries(searchableFields)) {
      const fieldLower = fieldValue.toLowerCase();

      if (fieldLower.includes(term)) {
        foundInField = true;

        // Bonus si c'est un match exact du champ entier
        if (fieldLower === term) {
          score += fieldWeights[fieldName] * 2;
        }
        // Bonus si le terme est au début du champ
        else if (fieldLower.startsWith(term)) {
          score += fieldWeights[fieldName] * 1.5;
        }
        // Match standard
        else {
          score += fieldWeights[fieldName];
        }
      }
    }

    // Si un terme n'a pas trouvé de match, la recherche échoue
    if (!foundInField) {
      return { match: false, score: 0 };
    }
  }

  return { match: true, score };
};
