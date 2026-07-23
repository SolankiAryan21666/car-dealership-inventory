import { Router } from "express";
import { create, list } from "../controllers/vehicleController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, create);
router.get("/", protect, list);

export default router;
