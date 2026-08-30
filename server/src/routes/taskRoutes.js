import express from "express";
import { getTasks, getTaskById, createTask, acceptTask, completeTask } from "../controllers/taskController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / verified read
router.get("/", getTasks);
router.get("/:id", getTaskById);

// Protected routes (require student authentication)
router.post("/", authenticateToken, createTask);
router.post("/:id/accept", authenticateToken, acceptTask);
router.post("/:id/complete", authenticateToken, completeTask);

export default router;
