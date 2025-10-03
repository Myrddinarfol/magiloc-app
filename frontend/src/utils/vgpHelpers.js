// Fonctions pour gérer les certificats et VGP

// Fonction pour générer le lien du certificat
export const getCertificatLink = (certificat) => {
  if (!certificat) return null;

  // Si c'est un numéro CML, générer l'URL VTIC
  if (certificat.match(/^CML\d+$/i)) {
    return `https://v-tic.com/prd/${certificat}`;
  }

  // Si c'est déjà une URL, la retourner telle quelle
  if (certificat.startsWith('http://') || certificat.startsWith('https://')) {
    return certificat;
  }

  return null;
};

// Fonction pour calculer l'indicateur VGP dans la vue détaillée
export const getVGPDetailStatus = (prochainVGP) => {
  if (!prochainVGP) return { status: 'unknown', label: 'Non renseigné', icon: '❓', color: 'gray' };

  const today = new Date();
  const vgpDate = new Date(prochainVGP.split('/').reverse().join('-'));
  const diffTime = vgpDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired',
      label: 'VGP DÉPASSÉ',
      subLabel: `Dépassé de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`,
      icon: '⚠️',
      color: 'red'
    };
  } else if (diffDays <= 30) {
    return {
      status: 'warning',
      label: 'VGP À PRÉVOIR',
      subLabel: `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`,
      icon: '❗',
      color: 'orange'
    };
  } else {
    return {
      status: 'valid',
      label: 'VGP À JOUR',
      subLabel: `Dans ${diffDays} jours`,
      icon: '✓',
      color: 'green'
    };
  }
};
