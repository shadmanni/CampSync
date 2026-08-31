import express from "express";
import { getItems, createItem, placeBid } from "../controllers/bidController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/items", getItems);
router.post("/items", optionalAuth, createItem);
router.post("/items/:id/bid", optionalAuth, placeBid);

export default router;
