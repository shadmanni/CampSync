import express from "express";
import { getSkills, getSkillById, createSkill, deleteSkill } from "../controllers/skillController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / verified read
router.get("/", getSkills);
router.get("/:id", getSkillById);

// Protected routes (require student authentication)
router.post("/", authenticateToken, createSkill);
router.delete("/:id", authenticateToken, deleteSkill);

export default router;
