import express from "express";
import { getRides, createRide, joinRide, getEvents, rsvpEvent } from "../controllers/rideController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/rides", getRides);
router.post("/rides", optionalAuth, createRide);
router.post("/rides/:id/join", optionalAuth, joinRide);
router.get("/events", getEvents);
router.post("/events/:id/rsvp", rsvpEvent);

export default router;
