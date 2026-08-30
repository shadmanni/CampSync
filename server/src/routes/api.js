import express from "express";
import jwt from "jsonwebtoken";
import { mockDb } from "../store/mockDb.js";

export const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "campussync_super_secret_jwt_key_2026";

// Store active OTPs in memory for verification flow
const otpStore = new Map();

/* ==========================================================================
   MODULE: AUTH & CAMPUS VERIFICATION (Member 5)
   ========================================================================== */

// Request OTP to College Email
router.post("/auth/request-otp", (req, res) => {
  const { email } = req.body;
  if (!email || (!email.endsWith("@college.edu") && !email.endsWith("@campus.ac.in") && !email.endsWith("@university.edu"))) {
    return res.status(400).json({ error: "Access restricted. Please use a valid college email address." });
  }

  // Generate 6-digit OTP code (fixed 123456 for easy prototype demoing)
  const otp = "123456";
  otpStore.set(email, otp);

  return res.json({
    message: "OTP sent successfully to college email.",
    demoNotice: "Prototype OTP code is: 123456"
  });
});

// Verify OTP & Issue JWT Token
router.post("/auth/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  const validOtp = otpStore.get(email) || "123456"; // Fallback to 123456 for demo ease

  if (otp !== validOtp) {
    return res.status(400).json({ error: "Invalid OTP verification code." });
  }

  let user = mockDb.users.find(u => u.email === email);
  if (!user) {
    user = {
      id: `u-${Date.now()}`,
      email,
      name: email.split("@")[0].replace(".", " ").toUpperCase(),
      department: "Computer Science",
      hostel: "Hostel Block A",
      isVerified: true
    };
    mockDb.users.push(user);
  }

  const token = jwt.sign({ id: user.id, email: user.email, isVerified: true }, JWT_SECRET, { expiresIn: "7d" });

  return res.json({
    token,
    user
  });
});

/* ==========================================================================
   MODULE 1: CAMPUSCONNECT (Member 5)
   ========================================================================== */

router.get("/connect/posts", (req, res) => {
  const { category, search } = req.query;
  let filtered = [...mockDb.posts];

  if (category && category !== "All") {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }

  res.json(filtered);
});

router.post("/connect/posts", (req, res) => {
  const { title, content, category, isAnonymous, authorName } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  const newPost = {
    id: `post-${Date.now()}`,
    authorId: "u-current",
    authorName: isAnonymous ? "Anonymous Student" : (authorName || "Verified Student"),
    isAnonymous: !!isAnonymous,
    title,
    content,
    category: category || "General",
    upvotes: 1,
    comments: [],
    createdAt: "Just now"
  };

  mockDb.posts.unshift(newPost);

  // Emit socket event if io instance attached
  if (req.io) {
    req.io.emit("connect:new_post", newPost);
  }

  res.status(201).json(newPost);
});

router.post("/connect/posts/:id/upvote", (req, res) => {
  const post = mockDb.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });

  post.upvotes += 1;
  res.json({ upvotes: post.upvotes });
});

router.post("/connect/posts/:id/comments", (req, res) => {
  const post = mockDb.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });

  const newComment = {
    id: `c-${Date.now()}`,
    authorName: req.body.authorName || "Verified Student",
    content: req.body.content,
    createdAt: "Just now"
  };

  post.comments.push(newComment);
  res.json(newComment);
});

/* ==========================================================================
   MODULE 2: CAMPUSBID MARKETPLACE (Member 6)
   ========================================================================== */

router.get("/bid/items", (req, res) => {
  res.json(mockDb.items);
});

router.post("/bid/items", (req, res) => {
  const { title, description, startingPrice, category, expiresAt } = req.body;
  if (!title || !startingPrice) {
    return res.status(400).json({ error: "Title and starting price are required." });
  }

  const newItem = {
    id: `item-${Date.now()}`,
    sellerId: "u-current",
    sellerName: "Verified Seller",
    title,
    description: description || "No description provided.",
    startingPrice: parseFloat(startingPrice),
    currentBid: parseFloat(startingPrice),
    highestBidderName: "No bids yet",
    bidCount: 0,
    status: "ACTIVE",
    expiresAt: expiresAt || "In 24 hours",
    category: category || "General"
  };

  mockDb.items.unshift(newItem);
  res.status(201).json(newItem);
});

router.post("/bid/items/:id/bid", (req, res) => {
  const item = mockDb.items.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Item listing not found." });

  const amount = parseFloat(req.body.amount);
  if (isNaN(amount) || amount <= item.currentBid) {
    return res.status(400).json({ error: `Bid must be higher than current bid (₹${item.currentBid}).` });
  }

  item.currentBid = amount;
  item.bidCount += 1;
  item.highestBidderName = req.body.bidderName || "Verified Student";

  if (req.io) {
    req.io.emit("bid:new_highest", {
      itemId: item.id,
      currentBid: item.currentBid,
      highestBidderName: item.highestBidderName,
      bidCount: item.bidCount
    });
  }

  res.json(item);
});

/* ==========================================================================
   MODULE 3: CAMPUSRIDE & EVENTS (Member 5)
   ========================================================================== */

router.get("/ride/rides", (req, res) => {
  res.json(mockDb.rides);
});

router.post("/ride/rides", (req, res) => {
  const { origin, destination, departureTime, totalSeats, pricePerSeat } = req.body;
  if (!origin || !destination || !departureTime) {
    return res.status(400).json({ error: "Origin, destination, and departure time required." });
  }

  const newRide = {
    id: `ride-${Date.now()}`,
    driverId: "u-current",
    driverName: "Verified Student Driver",
    origin,
    destination,
    departureTime,
    totalSeats: parseInt(totalSeats) || 4,
    availableSeats: parseInt(totalSeats) || 4,
    pricePerSeat: parseFloat(pricePerSeat) || 50,
    passengers: []
  };

  mockDb.rides.unshift(newRide);
  res.status(201).json(newRide);
});

router.post("/ride/rides/:id/join", (req, res) => {
  const ride = mockDb.rides.find(r => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: "Ride not found." });

  if (ride.availableSeats <= 0) {
    return res.status(400).json({ error: "Sorry, this carpool is fully booked!" });
  }

  ride.availableSeats -= 1;
  const passengerName = req.body.passengerName || "Verified Passenger";
  ride.passengers.push(passengerName);

  if (req.io) {
    req.io.emit("ride:seat_updated", {
      rideId: ride.id,
      availableSeats: ride.availableSeats
    });
  }

  res.json(ride);
});

router.get("/ride/events", (req, res) => {
  res.json(mockDb.events);
});

/* ==========================================================================
   MODULE 4: CAMPUSNEARBY (Member 6)
   ========================================================================== */

router.get("/nearby/deals", (req, res) => {
  res.json(mockDb.deals);
});
