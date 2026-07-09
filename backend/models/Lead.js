import mongoose from 'mongoose';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Lead Schema definition for tracking potential customers/leads.
 */
const leadSchema = new mongoose.Schema(
  {
    /**
     * The full name of the lead contact person.
     * Must be between 2 and 100 characters, trimmed.
     * @type {string}
     */
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      minLength: [2, 'Lead name must be at least 2 characters long'],
      maxLength: [100, 'Lead name cannot exceed 100 characters']
    },

    /**
     * The company or organization name the lead represents.
     * Trimmed.
     * @type {string}
     */
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },

    /**
     * Email address of the lead.
     * Trimmed and validated against standard email regex format.
     * @type {string}
     */
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return emailRegex.test(v);
        },
        message: 'Email must be a valid email address'
      }
    },

    /**
     * Phone number of the lead.
     * Trimmed. Optional field.
     * @type {string}
     */
    phone: {
      type: String,
      trim: true
    },

    /**
     * The current status of the lead in the sales funnel.
     * Must match frontend enum values exactly. Default is 'New'.
     * @type {string}
     */
    status: {
      type: String,
      enum: {
        values: ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'],
        message: 'Status must be one of: New, Contacted, Meeting Scheduled, Proposal Sent, Won, Lost'
      },
      default: 'New'
    },

    /**
     * The marketing or acquisition source of the lead.
     * Must match frontend enum values exactly. Default is 'Website'.
     * @type {string}
     */
    source: {
      type: String,
      enum: {
        values: ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'],
        message: 'Source must be one of: Website, Referral, LinkedIn, Cold Call, Email Campaign, Other'
      },
      default: 'Website'
    },

    /**
     * Additional notes, details, or communications log about the lead.
     * Maximum 1000 characters. Optional field.
     * @type {string}
     */
    notes: {
      type: String,
      maxLength: [1000, 'Notes cannot exceed 1000 characters']
    },

    /**
     * Reference to the User (Account/Sales Representative) who owns and created the lead.
     * @type {mongoose.Schema.Types.ObjectId}
     */
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Lead owner is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for optimized database queries
// Compound index on owner and status for filtering leads by status for specific users/owners
leadSchema.index({ owner: 1, status: 1 });

// Index on email for fast lookups of lead details by email address
leadSchema.index({ email: 1 });

/**
 * Virtual field to compute the age of the lead in days.
 * Calculated as the floor value of the difference between current date and creation date.
 * @returns {number} The age of the lead in days since creation.
 */
leadSchema.virtual('age').get(function () {
  if (!this.createdAt) {
    return 0;
  }
  const differenceInTime = Date.now() - this.createdAt.getTime();
  return Math.floor(differenceInTime / (1000 * 3600 * 24));
});

// Create the model
const Lead = mongoose.model('Lead', leadSchema);

// Export both the model and schema separately
export { leadSchema };
export { Lead };
export default Lead;
