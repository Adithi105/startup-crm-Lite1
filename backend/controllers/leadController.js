import Lead from '../models/Lead.js';
import {
  successResponse,
  errorResponse
} from '../utils/apiResponse.js';

// Valid status enum values (mirrors Lead model schema)
const VALID_STATUSES = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];

// Short month name look-up table (0-indexed, January = index 0)
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieves a paginated, filtered, and sorted list of leads owned by the
 * authenticated user. All filter parameters are additive and optional.
 *
 * @inputs  req.user._id — injected by protect middleware (owner isolation)
 * @inputs  req.query — {
 *            page      {number}  page number, default 1
 *            limit     {number}  results per page, default 20, max 100
 *            sortBy    {string}  field to sort by, default 'createdAt'
 *            sortOrder {string}  'asc' | 'desc', default 'desc'
 *            status    {string}  exact match on Lead.status (skipped if 'All')
 *            search    {string}  case-insensitive $regex on name, company, email
 *            source    {string}  exact match on Lead.source (skipped if 'All')
 *            dateFrom  {string}  ISO date string — createdAt >= dateFrom
 *            dateTo    {string}  ISO date string — createdAt <= dateTo (end-of-day)
 *          }
 * @outputs 200 JSON: {
 *            success: true,
 *            data: Lead[],
 *            pagination: { total, page, limit, pages, hasNext, hasPrev }
 *          }
 * @sideEffects  Reads from the leads collection. No writes.
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      page      = 1,
      limit     = 20,
      sortBy    = 'createdAt',
      sortOrder = 'desc',
      status,
      search,
      source,
      dateFrom,
      dateTo
    } = req.query;

    // ── Build filter: always scope to the authenticated owner ──────────────
    const filter = { owner: req.user._id };

    // Optional status filter (ignore if falsy or literal "All")
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Optional source filter (ignore if falsy or literal "All")
    if (source && source !== 'All') {
      filter.source = source;
    }

    // Optional date-range filter on createdAt — add only if at least one bound exists
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Extend to end-of-day so the full dateTo day is included
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endOfDay;
      }
    }

    // Optional full-text search — case-insensitive $regex across name, company, email
    if (search && search.trim() !== '') {
      filter.$or = [
        { name:    { $regex: search.trim(), $options: 'i' } },
        { company: { $regex: search.trim(), $options: 'i' } },
        { email:   { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // ── Pagination & sorting config ─────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // hard cap at 100
    const skip     = (pageNum - 1) * limitNum;
    const sortDir  = sortOrder === 'asc' ? 1 : -1;
    const sortSpec = { [sortBy]: sortDir };

    if (process.env.NODE_ENV === 'development') {
      console.log(
        '[getLeads] filter:', JSON.stringify(filter),
        '| sort:', sortSpec,
        '| page:', pageNum,
        '| limit:', limitNum
      );
    }

    // ── Execute find + count in parallel ───────────────────────────────────
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sortSpec).skip(skip).limit(limitNum),
      Lead.countDocuments(filter)
    ]);

    const pages   = Math.max(1, Math.ceil(total / limitNum));
    const hasNext = pageNum < pages;
    const hasPrev = pageNum > 1;

    return res.status(200).json({
      success: true,
      data: leads,
      pagination: { total, page: pageNum, limit: limitNum, pages, hasNext, hasPrev }
    });
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
 * @inputs  req.body      — { name, company, email, phone?, status?, source?, notes? }
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
      _id:   req.params.id,
      owner: req.user._id  // owner isolation: another user cannot read this lead
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
 * @inputs  req.params.id   — MongoDB ObjectId of the lead
 *          req.body.status — new status string
 *          req.user._id    — used to enforce owner isolation
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
      _id:   req.params.id,
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
 * Returns comprehensive aggregate statistics for the Dashboard in a SINGLE
 * MongoDB aggregation pipeline query using $facet. All computations are
 * owner-isolated via an initial $match stage.
 *
 * Pipeline strategy ($facet runs 4 sub-pipelines in one DB round-trip):
 *   A. "overview"         — per-status counts (used to derive total + statusBreakdown)
 *   B. "thisMonth"        — count of leads created in the current calendar month
 *   C. "lastMonth"        — count of leads created in the previous calendar month
 *   D. "sourceBreakdown"  — per-source counts
 *
 * @inputs  req.user._id — owner isolation applied via initial $match stage
 * @outputs 200 successResponse with:
 *   {
 *     totalLeads:      number,    // total leads for this user
 *     statusBreakdown: {          // count per status, all statuses present (0 if none)
 *       New: n, Contacted: n, 'Meeting Scheduled': n,
 *       'Proposal Sent': n, Won: n, Lost: n
 *     },
 *     conversionRate:  number,    // (Won / total) * 100, rounded to 1 decimal; 0 if total = 0
 *     sourceBreakdown: { Website: n, Referral: n, LinkedIn: n, ... },
 *     thisMonthLeads:  number,    // count for current calendar month
 *     lastMonthLeads:  number,    // count for previous calendar month
 *     growthRate:      number     // ((thisMonth - lastMonth) / lastMonth) * 100; 100 if lastMonth = 0 & thisMonth > 0
 *   }
 * @sideEffects  Read-only aggregation on the leads collection. No writes.
 */
export const getLeadStats = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getLeadStats] owner:', req.user._id);
    }

    // Pre-compute calendar month boundaries
    const now            = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [result] = await Lead.aggregate([
      // Stage 1 — scope every sub-pipeline to this owner's leads only
      { $match: { owner: req.user._id } },

      // Stage 2 — $facet: 4 independent sub-pipelines, single DB round-trip
      {
        $facet: {
          // A: per-status counts — used to build statusBreakdown + totalLeads
          overview: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],

          // B: leads created in the current calendar month
          thisMonth: [
            { $match: { createdAt: { $gte: thisMonthStart } } },
            { $count: 'count' }
          ],

          // C: leads created in the previous calendar month
          lastMonth: [
            {
              $match: {
                createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
              }
            },
            { $count: 'count' }
          ],

          // D: per-source counts
          sourceBreakdown: [
            { $group: { _id: '$source', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // ── A: Build statusBreakdown object + derive totalLeads ───────────────
    const statusBreakdown = {};
    VALID_STATUSES.forEach((s) => (statusBreakdown[s] = 0)); // seed all to 0

    let totalLeads = 0;
    (result.overview || []).forEach(({ _id, count }) => {
      if (_id && Object.prototype.hasOwnProperty.call(statusBreakdown, _id)) {
        statusBreakdown[_id] = count;
      }
      totalLeads += count;
    });

    const wonLeads = statusBreakdown['Won'] || 0;

    // Edge case: avoid division by zero when there are no leads at all
    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(1))
      : 0;

    // ── D: Build sourceBreakdown object ───────────────────────────────────
    const sourceBreakdown = {};
    (result.sourceBreakdown || []).forEach(({ _id, count }) => {
      if (_id) sourceBreakdown[_id] = count;
    });

    // ── B & C: Extract month counts ───────────────────────────────────────
    const thisMonthLeads = result.thisMonth?.[0]?.count ?? 0;
    const lastMonthLeads = result.lastMonth?.[0]?.count ?? 0;

    // Edge case: avoid division by zero when lastMonth = 0
    let growthRate = 0;
    if (lastMonthLeads > 0) {
      growthRate = parseFloat(
        (((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100).toFixed(1)
      );
    } else if (thisMonthLeads > 0) {
      // Had zero last month but leads this month → treat as 100% growth
      growthRate = 100;
    }

    return successResponse(res, {
      totalLeads,
      statusBreakdown,
      conversionRate,
      sourceBreakdown,
      thisMonthLeads,
      lastMonthLeads,
      growthRate
    }, 'Lead stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/stats/monthly
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Returns per-month lead statistics for the last 6 calendar months.
 * Always returns exactly 6 data points sorted oldest → newest (left-to-right
 * chronological order for charts). Months with zero leads are zero-filled.
 *
 * @inputs  req.user._id — owner isolation applied via initial $match stage
 * @outputs 200 successResponse with Array<{
 *   month:          string,  // 'Jan 2025', 'Feb 2025', ...
 *   total:          number,  // all leads created in that month
 *   won:            number,  // leads with status 'Won' in that month
 *   lost:           number,  // leads with status 'Lost' in that month
 *   conversionRate: number   // (won / total) * 100, 1 decimal; 0 if total = 0
 * }>
 * @sideEffects  Read-only aggregation on the leads collection. No writes.
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('[getMonthlyStats] owner:', req.user._id);
    }

    // First moment of the month 5 months ago (covers the full 6-month window)
    const now       = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const aggregation = await Lead.aggregate([
      // Stage 1 — owner isolation + date window
      {
        $match: {
          owner:     req.user._id,
          createdAt: { $gte: startDate }
        }
      },

      // Stage 2 — group by year + month; tally total, won, and lost
      {
        $group: {
          _id: {
            year:  { $year:  '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          won:  { $sum: { $cond: [{ $eq: ['$status', 'Won']  }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } }
        }
      },

      // Stage 3 — sort chronologically oldest → newest (charts render left → right)
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Build a lookup map keyed by "YYYY-M" for O(1) access
    const aggMap = {};
    aggregation.forEach(({ _id, total, won, lost }) => {
      aggMap[`${_id.year}-${_id.month}`] = { total, won, lost };
    });

    // Produce exactly 6 entries (oldest → newest), zero-filling missing months
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key   = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const label = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
      const entry = aggMap[key] ?? { total: 0, won: 0, lost: 0 };

      // Edge case: avoid division by zero for months with no leads
      const conversionRate = entry.total > 0
        ? parseFloat(((entry.won / entry.total) * 100).toFixed(1))
        : 0;

      result.push({
        month:          label,       // e.g. 'Jan 2025'
        total:          entry.total,
        won:            entry.won,
        lost:           entry.lost,
        conversionRate
      });
    }

    return successResponse(res, result, 'Monthly stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/leads/search?q=ali&limit=5
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Lightweight autocomplete / quick-search endpoint designed to back a debounced
 * SearchBar component. Returns only the minimal fields needed for dropdown
 * suggestions; response is hard-capped at 5 results (max 10) for performance.
 *
 * Searches name, company, and email with a case-insensitive $regex. Uses the
 * compound index { owner, name } and { owner, company } for fast lookups.
 *
 * @inputs  req.user._id    — owner isolation; only searches this user's leads
 *          req.query.q     — {string} search term; required, min 1 non-space char
 *          req.query.limit — {number} max results to return; default 5, hard cap 10
 * @outputs 200 successResponse with Array<{
 *   _id:     ObjectId,
 *   name:    string,
 *   company: string,
 *   email:   string,
 *   status:  string
 * }>
 *          400 errorResponse if `q` is missing or blank
 * @sideEffects  Read-only query on the leads collection. No writes.
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim() === '') {
      return errorResponse(res, 'Query parameter `q` is required', 400);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[searchLeads] owner:', req.user._id, '| q:', q);
    }

    const limitNum = Math.min(10, Math.max(1, parseInt(limit, 10)));

    const leads = await Lead.find(
      {
        owner: req.user._id,
        $or: [
          { name:    { $regex: q.trim(), $options: 'i' } },
          { company: { $regex: q.trim(), $options: 'i' } },
          { email:   { $regex: q.trim(), $options: 'i' } }
        ]
      },
      // Projection — only the fields the SearchBar dropdown needs
      { _id: 1, name: 1, company: 1, email: 1, status: 1 }
    ).limit(limitNum);

    return successResponse(res, leads, 'Search results retrieved successfully');
  } catch (error) {
    next(error);
  }
};
