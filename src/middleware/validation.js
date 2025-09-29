import { body, validationResult } from 'express-validator';

// Handle validation results
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name is required and must not exceed 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['user', 'agent'])
    .withMessage('Role must be either user or agent')
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must not exceed 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

// Property validation rules
export const validateProperty = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must not exceed 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must not exceed 2000 characters'),
  body('price')
    .isNumeric()
    .custom(value => value >= 0)
    .withMessage('Price must be a positive number'),
  body('category')
    .isIn(['flat', 'land', 'shop', 'house'])
    .withMessage('Category must be one of: flat, land, shop, house'),
  body('listingType')
    .isIn(['sale', 'rent'])
    .withMessage('Listing type must be either sale or rent'),
  body('area')
    .isNumeric()
    .custom(value => value >= 1)
    .withMessage('Area must be at least 1 square unit'),
  body('bedrooms')
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(Number(value)) && Number(value) >= 0))
    .withMessage('Bedrooms must be a non-negative integer or null'),
  body('bathrooms')
    .optional({ nullable: true })
    .custom((value) => value === null || (Number.isInteger(Number(value)) && Number(value) >= 0))
    .withMessage('Bathrooms must be a non-negative integer or null'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location is required and must not exceed 100 characters'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Address is required and must not exceed 200 characters'),
  body('agentPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid agent phone number'),
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  body('features.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each feature must not exceed 50 characters')
];