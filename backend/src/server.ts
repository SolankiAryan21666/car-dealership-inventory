import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDb } from "./config/db";

const PORT = process.env.PORT || 5000;

// Connect to the database FIRST, then start listening — so the server never
// accepts requests before it can actually talk to MongoDB.
const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
