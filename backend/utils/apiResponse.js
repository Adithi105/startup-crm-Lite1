/**
 * Sends a standardized success response.
 * @param {Object} res - Express response object.
 * @param {any} data - Payload data to return in response.
 * @param {string} message - Informational message about the response status.
 * @param {number} [statusCode=200] - HTTP status code (defaults to 200).
 */
export const successResponse = (res, data, message, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Sends a standardized error response.
 * @param {Object} res - Express response object.
 * @param {string} message - Description of the error.
 * @param {number} [statusCode=500] - HTTP status code (defaults to 500).
 * @param {any} [errors=null] - Detailed error details (validation errors, etc.).
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

/**
 * Sends a standardized paginated response.
 * @param {Object} res - Express response object.
 * @param {Array} data - Paginated data array.
 * @param {number} total - Total count of records matching query.
 * @param {number} page - Current page number.
 * @param {number} limit - Items limit per page.
 */
export const paginatedResponse = (res, data, total, page, limit) => {
  res.status(200).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  });
};
