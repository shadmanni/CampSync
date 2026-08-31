import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { router as apiRouter } from "./routes/api.js";
import { dbAdapter } from "./store/dbAdapter.js";
import { setupSocketHandlers } from "./sockets/socketHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure multi-origin CORS support (Web Client, Expo Android App, Local Dev)
const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:19006"
];

const envOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(s => s.trim())
  : [];

const allowedOrigins = [...defaultAllowedOrigins, ...envOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (such as mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Also allow any vercel.app or onrender.com preview domains
    if (origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for prototype campus network testing
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io with matching multi-origin policy
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Setup real-time socket events
setupSocketHandlers(io);

// Attach Socket.io instance to request pipeline
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount REST API
app.use("/api", apiRouter);

// Base Health & Metadata Endpoint
app.get("/", (req, res) => {
  res.json({
    name: "CampusSync Unified API Engine",
    status: "Online",
    database: dbAdapter.isPostgres ? "PostgreSQL (Render Managed)" : "In-Memory / Local",
    clientsSupported: ["Web (React/Vite)", "Mobile (React Native/Expo)"],
    modules: [
      "CampusConnect",
      "CampusBid & Marketplace",
      "CampusSkills",
      "CampusTasks",
      "CampusRide & Events",
      "CampusNearby"
    ],
    docs: "/docs/architecture.md"
  });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Initialize Database Adapter and start server
async function startServer() {
  await dbAdapter.init();

  server.listen(PORT, () => {
    console.log(`🚀 CampusSync Server listening on http://localhost:${PORT}`);
    console.log(`📡 Real-time Socket.io active on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal error starting CampusSync Server:", err);
  process.exit(1);
});

export { app, server, io };
