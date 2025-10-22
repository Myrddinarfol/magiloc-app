import { body, query, param, validationResult } from 'express-validator';

/**
 * Middleware pour gérer les erreurs de validation
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation error',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validations pour les équipements
 */
export const equipmentValidation = {
  create: [
    body('designation')
      .trim()
      .notEmpty()
      .withMessage('Designation is required')
      .isLength({ min: 2 })
      .withMessage('Designation must be at least 2 characters'),

    body('cmu')
      .trim()
      .notEmpty()
      .withMessage('CMU is required'),

    body('modele')
      .optional()
      .trim(),

    body('marque')
      .optional()
      .trim(),

    body('longueur')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Longueur must be a positive number'),

    body('prixHT')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('prixHT must be a positive number'),

    body('prixHTJour')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('prixHTJour must be a positive number'),

    body('etat')
      .optional()
      .trim(),

    body('statut')
      .optional()
      .isIn([
        'Sur Parc',
        'En Location',
        'En Maintenance',
        'En Réservation'
      ])
      .withMessage('Invalid status'),

    body('numeroSerie')
      .optional()
      .trim()
  ],

  update: [
    body('designation')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Designation must be at least 2 characters'),

    body('cmu')
      .optional()
      .trim(),

    body('modele')
      .optional()
      .trim(),

    body('marque')
      .optional()
      .trim(),

    body('longueur')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Longueur must be a positive number'),

    body('prixHT')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('prixHT must be a positive number'),

    body('prixHTJour')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('prixHTJour must be a positive number'),

    body('statut')
      .optional()
      .isIn([
        'Sur Parc',
        'En Location',
        'En Maintenance',
        'En Réservation'
      ])
      .withMessage('Invalid status'),

    body('numeroSerie')
      .optional()
      .trim()
  ],

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('Equipment ID must be a positive integer')
};

/**
 * Validations pour les clients
 */
export const clientValidation = {
  create: [
    body('nom')
      .trim()
      .notEmpty()
      .withMessage('Client name is required')
      .isLength({ min: 2 })
      .withMessage('Client name must be at least 2 characters'),

    body('adresse')
      .optional()
      .trim(),

    body('telephone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)\.]*$/)
      .withMessage('Invalid phone format'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
  ],

  update: [
    body('nom')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Client name must be at least 2 characters'),

    body('adresse')
      .optional()
      .trim(),

    body('telephone')
      .optional()
      .trim()
      .matches(/^[\d\s\-\+\(\)\.]*$/)
      .withMessage('Invalid phone format'),

    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail()
  ],

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('Client ID must be a positive integer')
};

/**
 * Validations pour les pièces détachées
 */
export const sparePartValidation = {
  create: [
    body('reference')
      .trim()
      .notEmpty()
      .withMessage('Reference is required'),

    body('designation')
      .trim()
      .notEmpty()
      .withMessage('Designation is required'),

    body('quantite')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),

    body('equipment_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Equipment ID must be a positive integer')
  ],

  update: [
    body('reference')
      .optional()
      .trim(),

    body('designation')
      .optional()
      .trim(),

    body('quantite')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer')
  ],

  id: param('id')
    .isInt({ min: 1 })
    .withMessage('Spare part ID must be a positive integer')
};

/**
 * Validations pour les locations
 */
export const locationValidation = {
  create: [
    body('equipment_id')
      .isInt({ min: 1 })
      .withMessage('Equipment ID is required and must be a positive integer'),

    body('client')
      .trim()
      .notEmpty()
      .withMessage('Client name is required'),

    body('date_debut')
      .trim()
      .notEmpty()
      .withMessage('Start date is required'),

    body('date_fin')
      .trim()
      .notEmpty()
      .withMessage('End date is required'),

    body('prix_ht')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number')
  ]
};

/**
 * Validations pour la maintenance
 */
export const maintenanceValidation = {
  validate: [
    body('motif_maintenance')
      .optional()
      .trim(),

    body('travaux_effectues')
      .optional()
      .trim(),

    body('technicien')
      .optional()
      .trim(),

    body('cout_maintenance')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Cost must be a positive number'),

    body('pieces_utilisees')
      .optional()
      .isArray()
      .withMessage('Pieces must be an array'),

    body('vgp_effectuee')
      .optional()
      .isBoolean()
      .withMessage('VGP must be a boolean')
  ]
};

/**
 * Validations pour la pagination
 */
export const paginationValidation = {
  query: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer')
      .toInt(),

    query('limit')
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage('Limit must be between 1 and 500')
      .toInt(),

    query('search')
      .optional()
      .trim()
  ]
};
