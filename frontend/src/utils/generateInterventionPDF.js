import jsPDF from 'jspdf';

/**
 * Génère et télécharge un bon d'intervention PDF
 * @param {Object} intervention - Les données de l'intervention
 */
export function generateInterventionPDF(intervention) {
  try {
    // Créer un nouveau document PDF (A4, portrait)
    const doc = new jsPDF('p', 'mm', 'a4');

    // Couleurs et dimensions
    const primaryColor = [16, 185, 129]; // #10b981 (vert)
    const borderColor = [200, 200, 200];
    const textColor = [0, 0, 0];
    const lightBg = [245, 245, 245];

    // Marges
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const contentWidth = pageWidth - (margin * 2);

    let yPosition = margin;

    // ═════════════════════════════════════════
    // EN-TÊTE
    // ═════════════════════════════════════════

    // Titre MAGI-VGP
    doc.setTextColor(...primaryColor);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('MAGI-VGP', margin, yPosition);

    // Sous-titre
    doc.setTextColor(...textColor);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('BON D\'INTERVENTION VGP', margin, yPosition + 10);

    // Numéro et date
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const rightX = pageWidth - margin;
    doc.text(`N° ${intervention.id}`, rightX, yPosition + 2, { align: 'right' });
    const today = new Date().toLocaleDateString('fr-FR');
    doc.text(`Émis le: ${today}`, rightX, yPosition + 9, { align: 'right' });

    yPosition += 22;

    // ═════════════════════════════════════════
    // SECTION 1: INFORMATIONS CLIENT
    // ═════════════════════════════════════════

    // Titre section
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('INFORMATIONS CLIENT', margin, yPosition);
    yPosition += 7;

    // Fond gris
    doc.setFillColor(...lightBg);
    doc.rect(margin, yPosition - 3, contentWidth, 28, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Contenu
    const leftColX = margin + 3;
    const rightColX = margin + contentWidth / 2;

    doc.text('Client:', leftColX, yPosition);
    doc.setFont(undefined, 'bold');
    doc.text(intervention.client_nom || 'Client ponctuel', leftColX + 20, yPosition);

    doc.setFont(undefined, 'normal');
    doc.text('Site:', rightColX, yPosition);
    doc.setFont(undefined, 'bold');
    doc.text(intervention.site_nom || 'Non spécifié', rightColX + 10, yPosition);

    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.text('Adresse:', leftColX, yPosition);
    doc.setFont(undefined, 'bold');
    const addressLines = doc.splitTextToSize(intervention.adresse_intervention || '', 50);
    doc.text(addressLines, leftColX + 20, yPosition);

    doc.setFont(undefined, 'normal');
    doc.text('Contact:', rightColX, yPosition);
    doc.setFont(undefined, 'bold');
    const contactText = intervention.contact_site ? intervention.contact_site.split('\n')[0] : 'N/A';
    doc.text(contactText, rightColX + 10, yPosition);

    yPosition += 10;

    // ═════════════════════════════════════════
    // SECTION 2: DÉTAILS INTERVENTION
    // ═════════════════════════════════════════

    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.text('DÉTAILS INTERVENTION', margin, yPosition);
    yPosition += 7;

    // Fond gris
    doc.setFillColor(...lightBg);
    doc.rect(margin, yPosition - 3, contentWidth, 28, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Nature
    doc.text('Nature:', leftColX, yPosition);
    doc.setFont(undefined, 'bold');
    doc.text(intervention.nature_intervention || 'Non spécifiée', leftColX + 18, yPosition);

    doc.setFont(undefined, 'normal');
    doc.text('Statut:', rightColX, yPosition);
    doc.setFont(undefined, 'bold');
    const statusLabel = {
      'planifiee': 'Planifiée',
      'en_cours': 'En cours',
      'terminee': 'Terminée',
      'annulee': 'Annulée'
    };
    doc.text(statusLabel[intervention.statut] || intervention.statut, rightColX + 12, yPosition);

    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.text('Date:', leftColX, yPosition);
    doc.setFont(undefined, 'bold');
    const dateStr = new Date(intervention.date_intervention).toLocaleDateString('fr-FR');
    doc.text(dateStr, leftColX + 12, yPosition);

    doc.setFont(undefined, 'normal');
    doc.text('Durée:', rightColX, yPosition);
    doc.setFont(undefined, 'bold');
    doc.text(`${intervention.duree_jours} jour(s)`, rightColX + 12, yPosition);

    yPosition += 7;
    doc.setFont(undefined, 'normal');
    doc.text('Recommandations:', leftColX, yPosition);
    doc.setFont(undefined, 'bold');
    const recLines = doc.splitTextToSize(intervention.recommandations || 'Aucune', 60);
    doc.text(recLines.slice(0, 1), leftColX + 32, yPosition);

    yPosition += 10;

    // ═════════════════════════════════════════
    // SECTION 3: HORAIRES ET DURÉE EFFECTIVE
    // ═════════════════════════════════════════

    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.text('HORAIRES ET DURÉE EFFECTIVE', margin, yPosition);
    yPosition += 7;

    // Fond gris
    doc.setFillColor(...lightBg);
    doc.rect(margin, yPosition - 3, contentWidth, 20, 'F');

    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Trois colonnes pour les horaires
    const col1X = margin + 3;
    const col2X = margin + contentWidth / 3 + 3;
    const col3X = margin + (contentWidth * 2) / 3 + 3;

    // Heure d'arrivée
    doc.text('Heure d\'arrivée:', col1X, yPosition);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.rect(col1X, yPosition + 2, 40, 6);
    doc.setFontSize(8);
    doc.text('__:__', col1X + 3, yPosition + 5.5);

    // Heure de départ
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Heure de départ:', col2X, yPosition);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.rect(col2X, yPosition + 2, 40, 6);
    doc.setFontSize(8);
    doc.text('__:__', col2X + 3, yPosition + 5.5);

    // Heures effectives
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Heures effectives:', col3X, yPosition);
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.4);
    doc.rect(col3X, yPosition + 2, 40, 6);
    doc.setFontSize(8);
    doc.text('____h', col3X + 3, yPosition + 5.5);

    yPosition += 22;

    // ═════════════════════════════════════════
    // SECTION 4: OBSERVATIONS
    // ═════════════════════════════════════════

    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.text('OBSERVATIONS', margin, yPosition);
    yPosition += 5;

    // Cadre pour observations (zone vide)
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition, contentWidth, 35);

    yPosition += 40;

    // ═════════════════════════════════════════
    // SECTION 5: SIGNATURES
    // ═════════════════════════════════════════

    yPosition += 5;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.text('SIGNATURES', margin, yPosition);
    yPosition += 8;

    const signatureWidth = (contentWidth - 5) / 2;
    const signatureHeight = 30;

    // Signature Client
    doc.setTextColor(...textColor);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('SIGNATURE CLIENT', margin, yPosition);

    // Cadre signature client
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.rect(margin, yPosition + 3, signatureWidth, signatureHeight);

    // Champs texte dans le cadre
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Nom: ____________________________', margin + 3, yPosition + 20);
    doc.text('Date: ____________________________', margin + 3, yPosition + 27);

    // Signature Technicien
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('SIGNATURE TECHNICIEN', margin + signatureWidth + 5, yPosition);

    // Cadre signature technicien
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.5);
    doc.rect(margin + signatureWidth + 5, yPosition + 3, signatureWidth, signatureHeight);

    // Champs texte dans le cadre
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Nom: ____________________________', margin + signatureWidth + 8, yPosition + 20);
    doc.text('Date: ____________________________', margin + signatureWidth + 8, yPosition + 27);

    // ═════════════════════════════════════════
    // TÉLÉCHARGER LE PDF
    // ═════════════════════════════════════════

    const fileName = `bon_intervention_${intervention.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('❌ Erreur génération PDF:', error);
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
}
