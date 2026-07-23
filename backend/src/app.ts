import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import vehicleRoutes from "./routes/vehicleRoutes";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
// More route groups (inventory actions) get mounted here as we build them.

export default app;
