const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('firstName')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),
  
  body('lastName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),
  
  body('role')
    .optional()
    .isIn(['admin', 'moderator'])
    .withMessage('Role must be either admin or moderator'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .trim(),
  
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .trim(),
  
  body('role')
    .optional()
    .isIn(['admin', 'moderator'])
    .withMessage('Role must be either admin or moderator'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

// Application validation rules
const validateApplication = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Application name must be between 1 and 100 characters')
    .trim(),
  
  body('url')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL')
    .isLength({ max: 500 })
    .withMessage('URL must not exceed 500 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  
  body('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
    .trim(),
  
  body('backgroundColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Background color must be a valid hex color code'),
  
  body('textColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Text color must be a valid hex color code'),
  
  body('requiresAuth')
    .optional()
    .isBoolean()
    .withMessage('requiresAuth must be a boolean value'),
  
  body('openInNewTab')
    .optional()
    .isBoolean()
    .withMessage('openInNewTab must be a boolean value'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

const validateApplicationUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Application name must be between 1 and 100 characters')
    .trim(),
  
  body('url')
    .optional()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL')
    .isLength({ max: 500 })
    .withMessage('URL must not exceed 500 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
    .trim(),
  
  body('category')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters')
    .trim(),
  
  body('backgroundColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Background color must be a valid hex color code'),
  
  body('textColor')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Text color must be a valid hex color code'),
  
  body('requiresAuth')
    .optional()
    .isBoolean()
    .withMessage('requiresAuth must be a boolean value'),
  
  body('openInNewTab')
    .optional()
    .isBoolean()
    .withMessage('openInNewTab must be a boolean value'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  handleValidationErrors
];

// Common validation rules
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateReorder = [
  body('applicationIds')
    .isArray({ min: 1 })
    .withMessage('applicationIds must be a non-empty array'),
  
  body('applicationIds.*')
    .isUUID()
    .withMessage('Each application ID must be a valid UUID'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateApplication,
  validateApplicationUpdate,
  validateUUID,
  validatePagination,
  validateReorder
};
