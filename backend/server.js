import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Database config & middleware imports
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import leadRoutes from './routes/leadRoutes.js';

// Load environment variables at the entry point
dotenv.config();

// Create Express application instance
const app = express();

// --- 1. Global Middleware Configuration ---

// Secure HTTP headers with Helmet
app.use(helmet());

// Logging middleware in dev format
app.use(morgan('dev'));

// CORS configuration supporting frontend cross-origin requests
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  })
);

// Limit request JSON payload to 10kb to mitigate DoS threats
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded query parameters / form bodies
app.use(express.urlencoded({ extended: true }));



// --- 2. Route Registrations ---

// Base application health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date()
  });
});

// Authentication and user management endpoints
app.use('/api/auth', authRoutes);

// Leads tracking and analytical endpoints
app.use('/api/leads', leadRoutes);


// --- 3. Error Handling ---

// Global error handler middleware - must be registered after all route handlers
app.use(errorHandler);


// --- 4. Server Initialization ---

// Connect to MongoDB Atlas first, then start the server
connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
  });
}).catch((error) => {
  console.error('Failed to initialize server due to database connection failure:', error);
  process.exit(1);
});
