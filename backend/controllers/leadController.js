import Lead from '../models/Lead.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse
} from '../utils/apiResponse.js';

// Valid status enum values (mirrors Lead model schema)
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieves a paginated, filtered, and sorted list of leads owned by the
 * authenticated user.
 *
 * @inputs  req.user._id  — injected by protect middleware (owner isolation)
 *          req.query     — { status, search, page, limit, sortBy, sortOrder }
 * @outputs 200 paginatedResponse: { data: Lead[], pagination: { total, page, limit, pages } }
 * @sideEffects  Reads from the leads collection. No writes.
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // ── Build filter: always scope to the authenticated owner ──────────────
    const filter = { owner: req.user._id };

    // Optional status filter (ignore if "All" or falsy)
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Optional full-text search across name, company, and email
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i'); // case-insensitive
      filter.$or = [
        { name: regex },
        { company: regex },
        { email: regex }
      ];
    }

    // ── Pagination & sorting config ────────────────────────────────────────
    const pageNum   = Math.max(1, parseInt(page, 10));
    const limitNum  = Math.min(100, Math.max(1, parseInt(limit, 10))); // cap at 100
    const skip      = (pageNum - 1) * limitNum;
    const sortDir   = sortOrder === 'asc' ? 1 : -1;
    const sortSpec  = { [sortBy]: sortDir };

    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeads] filter:', JSON.stringify(filter), '| sort:', sortSpec, '| page:', pageNum, '| limit:', limitNum);
    }

    // ── Execute query + count in parallel ─────────────────────────────────
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter)
    ]);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/leads
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Creates a new lead record owned by the authenticated user.
 *
 * @inputs  req.body  — { name, company, email, phone?, status?, source?, notes? }
 *          req.user._id  — owner is forcibly set to the authenticated user
 * @outputs 201 successResponse: { data: Lead }
 * @sideEffects  Inserts one document into the leads collection.
 */
export const createLead = async (req, res, next) => {
  try {
    const { name, company, email, phone, status, source, notes } = req.body;

    if (process.env.NODE_ENV === 'development') {
      console.log('[createLead] Creating lead for owner:', req.user._id, '| name:', name);
    }

    const lead = await Lead.create({
      name,
      company,
      email,
      phone,
      status,
      source,
      notes,
      owner: req.user._id  // owner is ALWAYS set from token, never from body
    });

    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieves a single lead by its MongoDB _id, scoped to the authenticated owner.
 *
 * @inputs  req.params.id — MongoDB ObjectId of the lead
 *          req.user._id  — used to enforce owner isolation
 * @outputs 200 successResponse: { data: Lead }
 *          404 errorResponse if lead not found or doesn't belong to this user
 * @sideEffects  Reads from the leads collection. No writes.
 */
export const getLeadById = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeadById] id:', req.params.id, '| owner:', req.user._id);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user._id   // owner isolation: another user cannot read this lead
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/leads/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Fully updates a lead record. The owner field is explicitly stripped from the
 * update payload to prevent privilege escalation.
 *
 * @inputs  req.params.id — MongoDB ObjectId of the lead
 *          req.body      — fields to update (owner is stripped out)
 *          req.user._id  — used to enforce owner isolation
 * @outputs 200 successResponse: { data: Lead } with the updated document
 *          404 errorResponse if lead not found or doesn't belong to this user
 * @sideEffects  Updates one document in the leads collection; runs Mongoose validators.
 */
export const updateLead = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[updateLead] id:', req.params.id, '| owner:', req.user._id, '| body:', req.body);
    }

    // Strip the owner field — clients must never be able to re-assign a lead
    const { owner: _stripped, ...updateData } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/leads/:id/status
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Partially updates only the status field of a lead. Validates the new status
 * value against the allowed enum before persisting.
 *
 * @inputs  req.params.id     — MongoDB ObjectId of the lead
 *          req.body.status   — new status string
 *          req.user._id      — used to enforce owner isolation
 * @outputs 200 successResponse: { data: Lead } with the updated document
 *          400 errorResponse if status value is not in the allowed enum
 *          404 errorResponse if lead not found or doesn't belong to this user
 * @sideEffects  Updates the status field of one document.
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (process.env.NODE_ENV === 'development') {
      console.log('[updateLeadStatus] id:', req.params.id, '| new status:', status);
    }

    // Validate status is a recognised enum value
    if (!status || !VALID_STATUSES.includes(status)) {
      return errorResponse(
        res,
        `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        400
      );
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead status updated successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/leads/:id
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Permanently deletes a lead document. Only the owning user can delete their lead.
 *
 * @inputs  req.params.id — MongoDB ObjectId of the lead
 *          req.user._id  — used to enforce owner isolation
 * @outputs 200 successResponse: { message: 'Lead deleted successfully' }
 *          404 errorResponse if lead not found or doesn't belong to this user
 * @sideEffects  Removes one document from the leads collection. This is irreversible.
 */
export const deleteLead = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[deleteLead] id:', req.params.id, '| owner:', req.user._id);
    }

    const lead = await Lead.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await lead.deleteOne();

    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/stats
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns aggregate statistics for the Dashboard StatsCards component.
 * Uses a MongoDB aggregation pipeline scoped to the authenticated user.
 *
 * @inputs  req.user._id — owner isolation applied via $match stage
 * @outputs 200 successResponse with:
 *   {
 *     totalLeads:      number,
 *     wonLeads:        number,
 *     lostLeads:       number,
 *     conversionRate:  number  (Won / Total * 100, rounded to 1 decimal),
 *     byStatus:        [{ status: string, count: number }, ...]
 *   }
 * @sideEffects  Read-only aggregation on the leads collection. No writes.
 */
export const getLeadStats = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeadStats] owner:', req.user._id);
    }

    const aggregation = await Lead.aggregate([
      // Stage 1 — scope to this user's leads only
      { $match: { owner: req.user._id } },

      // Stage 2 — group by status to get per-status counts
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Build a status → count map, initialising all statuses to 0
    const statusMap = {};
    VALID_STATUSES.forEach((s) => (statusMap[s] = 0));
    aggregation.forEach(({ _id, count }) => {
      statusMap[_id] = count;
    });

    const totalLeads     = Object.values(statusMap).reduce((acc, c) => acc + c, 0);
    const wonLeads       = statusMap['Won']  || 0;
    const lostLeads      = statusMap['Lost'] || 0;
    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(1))
      : 0;

    // Shape the byStatus array for the StatsCard component
    const byStatus = VALID_STATUSES.map((status) => ({
      status,
      count: statusMap[status]
    }));

    const stats = {
      totalLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      byStatus
    };

    return successResponse(res, stats, 'Lead stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/stats/monthly
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns monthly lead totals for the last 6 calendar months.
 * Used by the Analytics bar chart component. Always returns exactly 6 data
 * points (oldest → newest), filling zeros for months with no leads.
 *
 * @inputs  req.user._id — owner isolation applied via $match stage
 * @outputs 200 successResponse with:
 *   [{ month: 'Jan', total: 5, won: 2 }, { month: 'Feb', ... }, ...]
 * @sideEffects  Read-only aggregation on the leads collection. No writes.
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getMonthlyStats] owner:', req.user._id);
    }

    // Calculate the start date: first day of the month 5 months ago
    const now       = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const aggregation = await Lead.aggregate([
      // Stage 1 — owner isolation + date window filter
      {
        $match: {
          owner: req.user._id,
          createdAt: { $gte: startDate }
        }
      },

      // Stage 2 — group by year+month; count total and won leads
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          won: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Won'] }, 1, 0]
            }
          }
        }
      },

      // Stage 3 — sort chronologically (oldest first)
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Short month name look-up table (0-indexed)
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Build a lookup keyed by "YYYY-M" for quick access
    const aggMap = {};
    aggregation.forEach(({ _id, total, won }) => {
      aggMap[`${_id.year}-${_id.month}`] = { total, won };
    });

    // Build the last-6-months result array (oldest → newest), zero-filling gaps
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key   = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const entry = aggMap[key] || { total: 0, won: 0 };

      result.push({
        month: MONTH_NAMES[d.getMonth()],
        total: entry.total,
        won:   entry.won
      });
    }

    return successResponse(res, result, 'Monthly stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};
