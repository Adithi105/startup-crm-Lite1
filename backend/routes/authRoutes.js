import express from 'express';
import { body } from 'express-validator';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile 
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = express.Router();

/**
 * Validation rules for user registration.
 */
const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

/**
 * Validation rules for user login.
 */
const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email must be a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * Validation rules for profile updates (optional field checks).
 */
const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters long'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

/*
 * Note for Production deployment:
 * Rate limiting is a critical security measure to prevent brute-force attacks on
 * authentication endpoints. In production, express-rate-limit should be integrated:
 * 
 * import rateLimit from 'express-rate-limit';
 * const authLimiter = rateLimit({
 *   windowMs: 15 * 60 * 1000, // 15 minutes
 *   max: 5, // Limit each IP to 5 login/register requests per windowMs
 *   message: 'Too many authentication attempts, please try again after 15 minutes'
 * });
 * 
 * Application suggestion: Add 'authLimiter' before registerRules and loginRules routes below.
 */

// Route 1: User Registration
router.post('/register', validate(registerRules), register);

// Route 2: User Login
router.post('/login', validate(loginRules), login);

// Route 3: Get Current User Profile (Protected)
router.get('/profile', protect, getProfile);

// Route 4: Update Profile using PUT (Protected)
router.put('/profile', protect, validate(updateProfileRules), updateProfile);

// Route 5: Update Profile using PATCH (Protected, alias for updateProfile)
router.patch('/profile', protect, validate(updateProfileRules), updateProfile);

export default router;
