import express from "express";
import authRoutes from "./authRoutes.js";
import connectRoutes from "./connectRoutes.js";
import bidRoutes from "./bidRoutes.js";
import skillRoutes from "./skillRoutes.js";
import taskRoutes from "./taskRoutes.js";
import rideRoutes from "./rideRoutes.js";
import nearbyRoutes from "./nearbyRoutes.js";

export const router = express.Router();

// Mount all module sub-routers
router.use("/auth", authRoutes);
router.use("/connect", connectRoutes);
router.use("/bid", bidRoutes);
router.use("/skills", skillRoutes);
router.use("/tasks", taskRoutes);
router.use("/ride", rideRoutes);
router.use("/nearby", nearbyRoutes);

// Health probe
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.1.0",
    modules: [
      "CampusConnect",
      "CampusBid",
      "CampusSkills",
      "CampusTasks",
      "CampusRide",
      "CampusNearby"
    ]
  });
});
