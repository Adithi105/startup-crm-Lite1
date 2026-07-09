import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Helper function to generate JWT.
 * Returns jwt.sign with user id, secret key and expiry duration.
 * 
 * @param {string} userId - The MongoDB ObjectId of the user.
 * @returns {string} Signed JWT.
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Register a new user in the system.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 'Email already exists', 409);
    }

    // 2. Create new User document (pre-save middleware handles hashing)
    const user = await User.create({ name, email, password });

    // 3. Generate JWT
    const token = generateToken(user._id);

    // 4. Return response (toJSON automatically strips the password field)
    return res.status(201).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email and explicitly select password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      // Security best practice: return a generic invalid credentials message
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 2. Compare plain text password with stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    // 3. Check if the user account is active
    if (!user.isActive) {
      return errorResponse(res, 'Account is deactivated', 403);
    }

    // 4. Generate JWT
    const token = generateToken(user._id);

    // 5. Return response (toJSON automatically strips the password field)
    return res.status(200).json({
      success: true,
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current user's profile.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const getProfile = async (req, res, next) => {
  try {
    // req.user is already loaded by the 'protect' middleware (password excluded)
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user's profile.
 * Allows updating name, and optionally updating the password if the current password is valid.
 * 
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next function.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    // Fetch user including password to validate credential changes if password update is requested
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // 1. Allow updating name only (email changes need a verification flow and are ignored here)
    if (name) {
      user.name = name;
    }

    // 2. Handle password update if newPassword is provided
    if (newPassword) {
      if (!currentPassword) {
        return errorResponse(res, 'Current password is required to change password', 400);
      }

      // Check current password correctness
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return errorResponse(res, 'Invalid current password', 400);
      }

      // Update password (pre-save middleware will automatically hash this new password)
      user.password = newPassword;
    }

    // 3. Save the changes
    await user.save();

    // 4. Return response (toJSON automatically strips the password field)
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
