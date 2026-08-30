import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { router as apiRouter } from "./routes/api.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Attach Socket.io instance to request pipeline
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount REST API
app.use("/api", apiRouter);

// Base Health Endpoint
app.get("/", (req, res) => {
  res.json({
    name: "CampusSync API Service",
    status: "Online",
    modules: ["CampusConnect", "CampusBid", "CampusRide & Events", "CampusNearby"],
    docs: "/docs/architecture.md"
  });
});

// Socket.io Real-time Event Handlers
io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 CampusSync Server listening on http://localhost:${PORT}`);
});
