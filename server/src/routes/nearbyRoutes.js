import express from "express";
import { getDeals } from "../controllers/nearbyController.js";

const router = express.Router();

router.get("/deals", getDeals);

export default router;
