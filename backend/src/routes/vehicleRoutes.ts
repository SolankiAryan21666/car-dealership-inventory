import { Router } from "express";
import { create, list, search } from "../controllers/vehicleController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Every vehicle route requires a logged-in user (protect), applied per-route
// so we can layer adminOnly on top of specific routes later (delete, restock)
// without affecting the ones that any authenticated user can access.
router.post("/", protect, create);
router.get("/", protect, list);
// IMPORTANT: /search must stay registered before any future GET /:id route,
// otherwise Express would treat "search" as an :id value and never reach this handler.
router.get("/search", protect, search);

export default router;
