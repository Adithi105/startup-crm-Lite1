import { errorResponse } from '../utils/apiResponse.js';

/**
 * Global Express error handling middleware.
 * Intercepts errors thrown during request processing and returns standardized responses.
 * 
 * Handles:
 * - Mongoose ValidationError -> 400 Bad Request with field-by-field error messages.
 * - Mongoose CastError -> 404 Resource not found.
 * - MongoDB duplicate key error (code 11000) -> 409 Email already exists.
 * - JWT verification errors (JsonWebTokenError, TokenExpiredError) -> 401.
 * - All other general exceptions -> 500 Server error.
 * 
 * Exposes stack trace only when running in development environment.
 * 
 * @param {Object} err - Error object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const errorHandler = (err, req, res, next) => {
  // Log the error internally for debugging
  console.error('Error Intercepted by Global Handler:', err);

  let statusCode = 500;
  let message = 'Server error';
  let errors = null;

  // 1. Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }
  // 2. Mongoose CastError (invalid MongoDB ObjectId format)
  else if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }
  // 3. MongoDB duplicate key error (code 11000)
  else if (err.code === 11000) {
    statusCode = 409;
    message = 'Email already exists';
  }
  // 4. JWT errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
  }
  // 5. Default server error (handled by initial values: 500, 'Server error')
  else {
    statusCode = 500;
    message = 'Server error';
  }

  // Include stack trace only in development mode
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({
      success: false,
      message: err.message || message,
      errors,
      stack: err.stack
    });
  }

  // Production error response
  return errorResponse(res, message, statusCode, errors);
};

export default errorHandler;

