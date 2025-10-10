/**
 * Tooltip Manager
 * Convertit automatiquement les attributs title en data-tooltip
 * pour utiliser nos tooltips CSS personnalisés
 */

export const initTooltips = () => {
  // Observer pour détecter les nouveaux éléments ajoutés au DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          convertTitleToTooltip(node);
        }
      });
    });
  });

  // Convertir tous les éléments existants
  convertTitleToTooltip(document.body);

  // Observer les changements futurs
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
};

const convertTitleToTooltip = (element) => {
  // Convertir l'élément lui-même s'il a un title
  if (element.hasAttribute && element.hasAttribute('title')) {
    const title = element.getAttribute('title');
    element.setAttribute('data-tooltip', title);
    element.removeAttribute('title');

    // Déterminer la position automatiquement
    if (!element.hasAttribute('data-position')) {
      const rect = element.getBoundingClientRect();
      // Si l'élément est dans le premier tiers de l'écran, tooltip en bas
      if (rect.top < window.innerHeight / 3) {
        element.setAttribute('data-position', 'bottom');
      } else {
        element.setAttribute('data-position', 'top');
      }
    }
  }

  // Convertir récursivement tous les enfants
  if (element.querySelectorAll) {
    const elementsWithTitle = element.querySelectorAll('[title]');
    elementsWithTitle.forEach(el => {
      const title = el.getAttribute('title');
      el.setAttribute('data-tooltip', title);
      el.removeAttribute('title');

      // Déterminer la position automatiquement
      if (!el.hasAttribute('data-position')) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight / 3) {
          el.setAttribute('data-position', 'bottom');
        } else {
          el.setAttribute('data-position', 'top');
        }
      }
    });
  }
};

// Fonction pour recalculer les positions (utile après un scroll)
export const updateTooltipPositions = () => {
  const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');
  elementsWithTooltip.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight / 3) {
      el.setAttribute('data-position', 'bottom');
    } else {
      el.setAttribute('data-position', 'top');
    }
  });
};
