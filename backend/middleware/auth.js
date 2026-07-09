import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Authentication protector middleware.
 * Verifies JWT in Authorization header, checks user existence, and attaches user to the request.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Extract JWT from Authorization header: 'Bearer <token>'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'No token provided, access denied', 401);
    }

    // 2. Verify token with JWT secret key
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token has expired, please login again', 401);
      }
      return errorResponse(res, 'Token is invalid', 401);
    }

    // 3. Find user in the database (excluding password field)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists', 401);
    }

    // 4. Attach user object to req.user for subsequent middlewares/controllers
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default protect;
