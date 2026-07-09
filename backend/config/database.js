import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

/**
 * Establishes a connection to the MongoDB Atlas database using the MONGODB_URI environment variable.
 * Logs connection host upon success, or logs error and exits the process upon failure.
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    // Note: Mongoose 9.x no longer supports deprecated options: useNewUrlParser and useUnifiedTopology.
    // They are enabled by default and passing them explicitly will cause a connection crash.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;


