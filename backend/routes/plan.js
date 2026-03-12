import express from "express";
import auth from "../middleware/auth.js";
import { createPlan, getUserDashboard } from "../controllers/planController.js";

const router = express.Router();

// ✅ Create plan (frontend calls this)
router.post("/", auth, createPlan);

// ✅ Dashboard (frontend calls this)
router.get("/dashboard", auth, getUserDashboard);

export default router;
