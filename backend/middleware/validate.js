import { validationResult } from 'express-validator';

/**
 * Validation runner middleware.
 * Executes validation checks, collects results, and returns standardized validation errors.
 * 
 * @param {Array} validations - Array of express-validator validation chains.
 * @returns {Function} Express middleware function.
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations sequentially/parallelly on the request
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors to match the [{ field, message }] structure
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // support express-validator v7 path, fallback to param
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors
    });
  };
};

export default validate;
