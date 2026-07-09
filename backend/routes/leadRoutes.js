import express from 'express';
import { body, param } from 'express-validator';
import protect from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import {
  getLeads,
  createLead,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getMonthlyStats,
  searchLeads
} from '../controllers/leadController.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// Allowed enum values (must match the Lead model schema exactly)
// ─────────────────────────────────────────────────────────────────────────────
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const VALID_SOURCES  = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

// ─────────────────────────────────────────────────────────────────────────────
// Validation rule sets
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validation rules for creating a new lead (all required fields enforced).
 */
const createLeadRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('company')
    .trim()
    .notEmpty()
    .withMessage('Company is required'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES)
    .withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`)
];

/**
 * Validation rules for fully updating a lead (all mutable fields are optional
 * so the client can send a partial body; required fields still validated when present).
 */
const updateLeadRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be blank')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('company')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company cannot be blank'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),

  body('status')
    .optional()
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`),

  body('source')
    .optional()
    .isIn(VALID_SOURCES)
    .withMessage(`Source must be one of: ${VALID_SOURCES.join(', ')}`)
];

/**
 * Validation rules for the status-only PATCH endpoint.
 */
const updateStatusRules = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(VALID_STATUSES)
    .withMessage(`Status must be one of: ${VALID_STATUSES.join(', ')}`)
];

/**
 * Validation rule for MongoDB ObjectId route parameters.
 */
const mongoIdRule = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format')
];

// ─────────────────────────────────────────────────────────────────────────────
// Global middleware — every route in this file requires authentication
// ─────────────────────────────────────────────────────────────────────────────
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// Stats routes — registered BEFORE /:id to avoid "stats" being captured as an id
// ─────────────────────────────────────────────────────────────────────────────

// Route 7: GET /api/leads/stats  →  Aggregate dashboard stats
router.get('/stats', getLeadStats);
router.get('/stats/summary', getLeadStats);

// Route 8: GET /api/leads/stats/monthly  →  6-month bar chart data
router.get('/stats/monthly', getMonthlyStats);

// Route 9: GET /api/leads/search?q=&limit=  →  Autocomplete quick-search
// Must be registered BEFORE /:id to avoid 'search' being matched as a Mongo ObjectId
router.get('/search', searchLeads);

// ─────────────────────────────────────────────────────────────────────────────
// Collection routes
// ─────────────────────────────────────────────────────────────────────────────

// Route 1: GET /api/leads  →  Paginated, filtered, sorted list
router.get('/', getLeads);

// Route 2: POST /api/leads  →  Create a new lead
router.post('/', validate(createLeadRules), createLead);

// ─────────────────────────────────────────────────────────────────────────────
// Document routes (operate on a single lead by :id)
// ─────────────────────────────────────────────────────────────────────────────

// Route 3: GET /api/leads/:id  →  Retrieve a single lead
router.get('/:id', validate(mongoIdRule), getLeadById);

// Route 4: PUT /api/leads/:id  →  Full update of a lead
router.put('/:id', validate([...mongoIdRule, ...updateLeadRules]), updateLead);

// Route 5: PATCH /api/leads/:id  →  Partial update of a lead (same handler, flexible body)
router.patch('/:id', validate([...mongoIdRule, ...updateLeadRules]), updateLead);

// Route 6: PATCH /api/leads/:id/status  →  Status-only update (Kanban drag-and-drop)
router.patch('/:id/status', validate([...mongoIdRule, ...updateStatusRules]), updateLeadStatus);

// Route 7 (alias): DELETE /api/leads/:id  →  Delete a lead
router.delete('/:id', validate(mongoIdRule), deleteLead);

export default router;
