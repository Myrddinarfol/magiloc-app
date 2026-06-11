let currentTooltipElement = null;
let tooltipContainer = null;
let mouseX = 0;
let mouseY = 0;

export const initTooltips = () => {
  // Créer le conteneur global pour les tooltips
  tooltipContainer = document.createElement('div');
  tooltipContainer.id = 'tooltip-container';
  tooltipContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 9999999;
  `;
  document.body.appendChild(tooltipContainer);

  // Observer pour détecter les nouveaux éléments ajoutés au DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          convertTitleToTooltip(node);
          attachTooltipListeners(node);
        }
      });
    });
  });

  // Convertir tous les éléments existants
  convertTitleToTooltip(document.body);
  attachTooltipListeners(document.body);

  // Observer les changements futurs
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Tracker la position du curseur globalement
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Mettre à jour la position du tooltip s'il est actuellement affiché
    if (currentTooltipElement) {
      updateTooltipPosition();
    }
  });

  // Masquer le tooltip quand on quitte
  document.addEventListener('mouseleave', hideTooltip);

  return observer;
};

const convertTitleToTooltip = (element) => {
  if (element.hasAttribute && element.hasAttribute('title')) {
    const title = element.getAttribute('title');
    element.setAttribute('data-tooltip', title);
    element.removeAttribute('title');
  }

  if (element.querySelectorAll) {
    const elementsWithTitle = element.querySelectorAll('[title]');
    elementsWithTitle.forEach(el => {
      const title = el.getAttribute('title');
      el.setAttribute('data-tooltip', title);
      el.removeAttribute('title');
    });
  }
};

const attachTooltipListeners = (element) => {
  // Pour l'élément lui-même
  if (element.hasAttribute && element.hasAttribute('data-tooltip')) {
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mousemove', updateTooltipPosition);
    element.addEventListener('mouseleave', hideTooltip);
  }

  // Pour tous les enfants
  if (element.querySelectorAll) {
    const elementsWithTooltip = element.querySelectorAll('[data-tooltip]');
    elementsWithTooltip.forEach(el => {
      el.addEventListener('mouseenter', showTooltip);
      el.addEventListener('mousemove', updateTooltipPosition);
      el.addEventListener('mouseleave', hideTooltip);
    });
  }
};

const showTooltip = (e) => {
  const element = e.target.closest('[data-tooltip]');
  if (!element) return;

  const tooltipText = element.getAttribute('data-tooltip');
  if (!tooltipText) return;

  // Créer le tooltip
  if (currentTooltipElement) {
    currentTooltipElement.remove();
  }

  currentTooltipElement = document.createElement('div');
  currentTooltipElement.className = 'tooltip-item';
  currentTooltipElement.style.cssText = `
    position: absolute;
    background: linear-gradient(135deg, rgba(45, 45, 45, 0.95), rgba(30, 30, 30, 0.95));
    color: #f0f0f0;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    border: 1px solid rgba(220, 38, 38, 0.25);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3), 0 0 16px rgba(220, 38, 38, 0.08);
    white-space: normal;
    word-wrap: break-word;
    text-align: center;
    line-height: 1.3;
    min-width: 100px;
    max-width: 200px;
    backdrop-filter: blur(4px);
    letter-spacing: 0.3px;
    animation: tooltipFadeIn 0.2s ease-out;
  `;

  // Ajouter la flèche
  const arrow = document.createElement('div');
  arrow.style.cssText = `
    position: absolute;
    width: 0;
    height: 0;
    border-top: 4px solid transparent;
    border-bottom: 4px solid transparent;
    border-left: 4px solid rgba(220, 38, 38, 0.2);
    left: -4px;
    top: 50%;
    transform: translateY(-50%);
  `;
  currentTooltipElement.appendChild(arrow);

  // Créer un conteneur pour le texte
  const textContainer = document.createElement('span');
  textContainer.textContent = tooltipText;
  textContainer.style.marginLeft = '4px';
  currentTooltipElement.appendChild(textContainer);

  tooltipContainer.appendChild(currentTooltipElement);
  updateTooltipPosition();
};

const updateTooltipPosition = () => {
  if (!currentTooltipElement) return;

  const offsetX = 15;
  const offsetY = -30;

  // Obtenir les dimensions du tooltip
  const tooltipRect = currentTooltipElement.getBoundingClientRect();
  const tooltipWidth = tooltipRect.width;
  const tooltipHeight = tooltipRect.height;

  let x = mouseX + offsetX;
  let y = mouseY + offsetY;

  // Vérifier si le tooltip sort de la viewport
  if (x + tooltipWidth > window.innerWidth) {
    x = mouseX - tooltipWidth - offsetX;
  }

  if (y < 0) {
    y = mouseY + 20;
  }

  if (y + tooltipHeight > window.innerHeight) {
    y = window.innerHeight - tooltipHeight - 10;
  }

  currentTooltipElement.style.left = x + 'px';
  currentTooltipElement.style.top = y + 'px';
};

const hideTooltip = () => {
  if (currentTooltipElement) {
    currentTooltipElement.style.animation = 'tooltipFadeOut 0.2s ease-out forwards';
    setTimeout(() => {
      if (currentTooltipElement) {
        currentTooltipElement.remove();
        currentTooltipElement = null;
      }
    }, 200);
  }
};
