import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * User Schema definition for authentication and user management.
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * The display name of the user.
     * Must be between 2 and 50 characters, trimmed.
     * @type {string}
     */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minLength: [2, 'Name must be at least 2 characters long'],
      maxLength: [50, 'Name cannot exceed 50 characters']
    },

    /**
     * Unique email address for the user, used as login identifier.
     * Normalized to lowercase, trimmed, and validated against email regex format.
     * @type {string}
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return emailRegex.test(v);
        },
        message: 'Email must be a valid email address'
      }
    },

    /**
     * Hashed password for user authentication.
     * Must be at least 6 characters in length (before hashing).
     * @type {string}
     */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password must be at least 6 characters long']
    },

    /**
     * Role of the user, used for authorization/access control.
     * Default role is 'user'. Must be either 'admin' or 'user'.
     * @type {string}
     */
    role: {
      type: String,
      enum: {
        values: ['admin', 'user'],
        message: 'Role must be either admin or user'
      },
      default: 'user'
    },

    /**
     * Flag indicating if the user account is active.
     * Inactive users cannot log in.
     * @type {boolean}
     */
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save hook to hash the password before saving a user document.
 * Only hashes the password if it has been modified or is new.
 */
userSchema.pre('save', async function () {
  const user = this;

  // Only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

/**
 * Compares a candidate plain text password with the user's stored hashed password.
 * @param {string} candidatePassword - The plain text password to check.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Overrides the toJSON method to strip sensitive information (like password) before serialization.
 * @returns {Object} User document as a plain object without password.
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create the model
const User = mongoose.model('User', userSchema);

// Export both the model and schema separately
export { userSchema };
export { User };
export default User;
