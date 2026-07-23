import mongoose from "mongoose";

// This connects to a REAL MongoDB instance (local or Atlas) — different from
// testDb.ts, which spins up a temporary in-memory database only for test runs.
// The kata explicitly requires a real database for the running app.
export const connectDb = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};
