import { body, param, validationResult } from 'express-validator';
import validator from 'validator';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Enhanced user registration validation
export const validateSignup = [
  body('first_name')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('last_name')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    }),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters'),
  
  handleValidationErrors
];

// Enhanced user login validation
export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password is too long'),
  
  handleValidationErrors
];

// Enhanced URL shortening validation
export const validateUrlShorten = [
  body('originalUrl')
    .trim()
    .notEmpty()
    .withMessage('URL is required')
    .isLength({ min: 4, max: 2048 })
    .withMessage('URL must be between 4 and 2048 characters')
    .customSanitizer((value) => {
      // Don't sanitize URLs - they need special handling
      // Auto-add https:// if missing protocol, but avoid double protocol
      if (!value.startsWith('http://') && !value.startsWith('https://')) {
        return 'https://' + value;
      }
      return value;
    })
    .custom((value) => {
      try {
        const url = new URL(value);
        
        // Block localhost and private IPs in production
        if (process.env.NODE_ENV === 'production') {
          const hostname = url.hostname.toLowerCase();
          if (hostname === 'localhost' || 
              hostname === '127.0.0.1' || 
              hostname.startsWith('192.168.') ||
              hostname.startsWith('10.') ||
              hostname.startsWith('172.')) {
            throw new Error('Private and localhost URLs are not allowed');
          }
        }
        
        // Block dangerous protocols
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Only HTTP and HTTPS URLs are allowed');
        }
        
        return true;
      } catch (error) {
        throw new Error('Please provide a valid URL (e.g., https://example.com)');
      }
    }),
  
  handleValidationErrors
];

// User ID parameter validation
export const validateUserId = [
  param('userId')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  
  handleValidationErrors
];

// Enhanced short code parameter validation
export const validateShortCode = [
  param('shortcode')
    .isLength({ min: 3, max: 15 })
    .withMessage('Short code must be between 3 and 15 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Short code can only contain letters, numbers, hyphens, and underscores')
    .custom((value) => {
      // Block common paths that shouldn't be short codes
      const blockedPaths = [
        'api', 'admin', 'login', 'signup', 'health', 'favicon.ico', 
        'robots.txt', 'sitemap.xml', 'www', 'mail', 'ftp', 'ssh',
        'debug', 'test', 'dev', 'staging', 'prod', 'production'
      ];
      if (blockedPaths.includes(value.toLowerCase())) {
        throw new Error('This short code is reserved and cannot be used');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Sanitize HTML to prevent XSS
export const sanitizeHtml = (text) => {
  if (typeof text !== 'string') return text;
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// General input sanitization middleware (fixed to exclude URLs)
export const sanitizeInputs = (req, res, next) => {
  const sanitizeObject = (obj, skipKeys = []) => {
    for (const key in obj) {
      // Skip URL fields from sanitization
      if (skipKeys.includes(key)) {
        continue;
      }
      
      if (typeof obj[key] === 'string') {
        obj[key] = sanitizeHtml(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key], skipKeys);
      }
    }
  };
  
  // Don't sanitize URL fields
  const urlFields = ['originalUrl', 'url', 'shortUrl', 'compeleturl'];
  
  if (req.body) sanitizeObject(req.body, urlFields);
  if (req.query) sanitizeObject(req.query, urlFields);
  if (req.params) sanitizeObject(req.params, urlFields);
  
  next();
};