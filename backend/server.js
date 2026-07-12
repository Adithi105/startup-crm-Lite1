import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import mongoose from "mongoose";

// Database config & middleware imports
import connectDB from "./config/database.js";
import errorHandler from "./middleware/errorHandler.js";

// Route imports
import authRoutes from "./routes/authRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";

// Load environment variables at the entry point
dotenv.config();

// --- 0. Environment Validation ---
/**
 * Validates that all critical environment variables are set before startup.
 * Logs any missing variables and exits the process with code 1.
 */
const checkRequiredEnvVars = () => {
  const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "PORT"];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error(
      `CRITICAL CONFIG ERROR: Missing required environment variables: ${missingVars.join(", ")}`,
    );
    process.exit(1);
  }
};

// Run environment validation
checkRequiredEnvVars();

// Create Express application instance
const app = express();

// --- 1. Global Middleware Configuration ---

// Secure HTTP headers with Helmet
app.use(helmet());

// MongoDB injection protection - sanitizes query, parameters, and body inputs
//app.use(mongoSanitize());

// Request logging improvement: combined in production, dev in development
const isProduction = process.env.NODE_ENV === "production";
app.use(morgan(isProduction ? "combined" : "dev"));

// CORS configuration supporting frontend cross-origin requests
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "https://your-app.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, postman, or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Rate Limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs for auth routes
  message: "Too many auth attempts.",
});

// Apply rate limiters to paths
app.use("/api/auth/", authLimiter);
app.use("/api/", generalLimiter);

// Limit request JSON payload to 10kb to mitigate DoS threats
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded query parameters / form bodies
app.use(express.urlencoded({ extended: true }));

// --- 2. Route Registrations ---

// Base application health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date(),
  });
});

// Authentication and user management endpoints
app.use("/api/auth", authRoutes);

// Leads tracking and analytical endpoints
app.use("/api/leads", leadRoutes);

// --- 3. Error Handling ---

// Global error handler middleware - must be registered after all route handlers
app.use(errorHandler);

// --- 4. Server Initialization & Graceful Shutdown ---

let server;

// Connect to MongoDB Atlas first, then start the server
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    const NODE_ENV = process.env.NODE_ENV || "development";

    server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    });
  })
  .catch((error) => {
    console.error(
      "Failed to initialize server due to database connection failure:",
      error,
    );
    process.exit(1);
  });

/**
 * Handles graceful shutdown by stopping the HTTP server and closing database connections cleanly.
 * @param {string} signal - The signal that triggered the shutdown (e.g., SIGINT, SIGTERM)
 */
const gracefulShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Server shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("HTTP server closed.");
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed.");
        process.exit(0);
      } catch (err) {
        console.error("Error during database disconnection:", err);
        process.exit(1);
      }
    });
  } else {
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during database disconnection:", err);
      process.exit(1);
    }
  }
};

// Handle process termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
