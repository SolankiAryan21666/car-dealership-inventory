import express, { Application } from "express";
import cors from "cors";

const app: Application = express();

app.use(cors());
app.use(express.json());

// Route mounting will grow as we build each resource.
// Nothing mounted yet — auth routes come first via TDD.

export default app;
