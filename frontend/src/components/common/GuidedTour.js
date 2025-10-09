import React, { useState, useEffect } from 'react';

const GuidedTour = ({ isActive, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const tourSteps = [
    {
      target: '.logo-container',
      title: '👋 Bienvenue sur MagiLoc !',
      content: 'Votre solution complète de gestion de parc locatif. Commençons la visite guidée !',
      position: 'right'
    },
    {
      target: '.nav-button:first-of-type',
      title: '🏠 Tableau de Bord',
      content: 'Vue d\'ensemble de votre activité : statistiques en temps réel, équipements phares, et raccourcis vers les actions principales.',
      position: 'right'
    },
    {
      target: '.nav-button:nth-of-type(2)',
      title: '✅ Sur Parc',
      content: 'Tous les équipements disponibles sur le parc. Vous pouvez créer une nouvelle location ou consulter les détails de chaque matériel.',
      position: 'right'
    },
    {
      target: '.nav-menu-section:nth-of-type(1)',
      title: '🚚 Module Location',
      content: 'Gérez vos réservations, locations en cours et visualisez le planning sur une frise chronologique interactive.',
      position: 'right'
    },
    {
      target: '.nav-menu-section:nth-of-type(2)',
      title: '🔧 Module Maintenance',
      content: 'Suivez les maintenances en cours, consultez le dashboard avec KPIs, et planifiez les interventions sur le planning.',
      position: 'right'
    },
    {
      target: '.sidebar-middle',
      title: '📊 Outils Avancés',
      content: 'Analytics pour analyser vos performances, Parc Loc pour gérer votre catalogue, et Notes MAJ pour suivre les évolutions.',
      position: 'right'
    },
    {
      target: '.logo-actions',
      title: '⚙️ Actions Rapides',
      content: 'Passez en plein écran, modifiez les paramètres, ou relancez cette visite guidée à tout moment avec le bouton 🎯.',
      position: 'bottom'
    }
  ];

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isActive]);

  if (!isActive || !isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleSkip = () => {
    handleClose();
  };

  // Calculate position based on target element with boundary checks
  const getTooltipPosition = () => {
    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return { top: '50%', left: '50%' };

    const rect = targetElement.getBoundingClientRect();
    const position = currentStepData.position;
    const tooltipWidth = 420; // max-width from CSS
    const tooltipHeight = 300; // estimated height
    const margin = 20;

    let style = {};

    switch (position) {
      case 'right':
        const rightPos = rect.right + margin;
        const topPos = rect.top + rect.height / 2;

        // Check if tooltip would overflow on right
        if (rightPos + tooltipWidth > window.innerWidth) {
          // Position on left instead
          style = {
            top: `${Math.max(margin, Math.min(topPos, window.innerHeight - tooltipHeight / 2 - margin))}px`,
            right: `${window.innerWidth - rect.left + margin}px`,
            transform: 'translateY(-50%)'
          };
        } else {
          style = {
            top: `${Math.max(margin, Math.min(topPos, window.innerHeight - tooltipHeight / 2 - margin))}px`,
            left: `${rightPos}px`,
            transform: 'translateY(-50%)'
          };
        }
        break;

      case 'bottom':
        const bottomPos = rect.bottom + margin;
        const leftPos = rect.left + rect.width / 2;

        // Check if tooltip would overflow on bottom
        if (bottomPos + tooltipHeight > window.innerHeight) {
          // Position on top instead
          style = {
            bottom: `${window.innerHeight - rect.top + margin}px`,
            left: `${Math.max(tooltipWidth / 2 + margin, Math.min(leftPos, window.innerWidth - tooltipWidth / 2 - margin))}px`,
            transform: 'translateX(-50%)'
          };
        } else {
          style = {
            top: `${bottomPos}px`,
            left: `${Math.max(tooltipWidth / 2 + margin, Math.min(leftPos, window.innerWidth - tooltipWidth / 2 - margin))}px`,
            transform: 'translateX(-50%)'
          };
        }
        break;

      case 'left':
        const leftPosCalc = rect.left - tooltipWidth - margin;
        const topPosLeft = rect.top + rect.height / 2;

        style = {
          top: `${Math.max(margin, Math.min(topPosLeft, window.innerHeight - tooltipHeight / 2 - margin))}px`,
          right: `${window.innerWidth - rect.left + margin}px`,
          transform: 'translateY(-50%)'
        };
        break;

      default:
        style = {
          top: `${Math.max(margin, rect.top + rect.height / 2)}px`,
          left: `${rect.right + margin}px`,
          transform: 'translateY(-50%)'
        };
    }

    return style;
  };

  const tooltipStyle = getTooltipPosition();

  // Calculate spotlight position with padding for better visibility
  const getSpotlightStyle = () => {
    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) return {};

    const rect = targetElement.getBoundingClientRect();
    const padding = 8; // Padding around the element for better visibility

    return {
      top: `${rect.top - padding}px`,
      left: `${rect.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`
    };
  };

  const spotlightStyle = getSpotlightStyle();

  return (
    <>
      {/* Overlay */}
      <div className="tour-overlay" onClick={handleSkip} />

      {/* Spotlight on current element */}
      <div className="tour-spotlight" style={spotlightStyle} />

      {/* Tooltip */}
      <div className="tour-tooltip" style={tooltipStyle}>
        <div className="tour-tooltip-header">
          <h3>{currentStepData.title}</h3>
          <button className="tour-close" onClick={handleClose}>✕</button>
        </div>

        <div className="tour-tooltip-body">
          <p>{currentStepData.content}</p>
        </div>

        <div className="tour-tooltip-footer">
          <div className="tour-progress">
            <span className="tour-step-counter">
              {currentStep + 1} / {tourSteps.length}
            </span>
            <div className="tour-progress-bar">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`tour-progress-dot ${index <= currentStep ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>

          <div className="tour-actions">
            {currentStep > 0 && (
              <button className="tour-btn tour-btn-secondary" onClick={handlePrevious}>
                ← Précédent
              </button>
            )}
            <button className="tour-btn tour-btn-skip" onClick={handleSkip}>
              Passer
            </button>
            <button className="tour-btn tour-btn-primary" onClick={handleNext}>
              {isLastStep ? 'Terminer ✓' : 'Suivant →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GuidedTour;
