import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// More route groups (vehicles, inventory) get mounted here as we build them.

export default app;
