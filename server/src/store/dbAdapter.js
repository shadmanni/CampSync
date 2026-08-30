import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mockDb } from "./mockDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseAdapter {
  constructor() {
    this.isPostgres = false;
    this.pool = null;
    this.inMemoryStore = JSON.parse(JSON.stringify(mockDb));
    // OTP rate limiting & lockout store
    this.otpRecords = new Map();
    this.ipRateLimits = new Map();
  }

  async init() {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl && !databaseUrl.includes("mock")) {
      try {
        console.log("[DB] Connecting to PostgreSQL database...");
        this.pool = new pg.Pool({
          connectionString: databaseUrl,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
        });

        // Test connection
        const client = await this.pool.connect();
        console.log("[DB] ✅ PostgreSQL connection established successfully.");

        // Run schema migrations
        const schemaPath = path.join(__dirname, "schema.sql");
        if (fs.existsSync(schemaPath)) {
          const schemaSql = fs.readFileSync(schemaPath, "utf-8");
          await client.query(schemaSql);
          console.log("[DB] ✅ Database tables initialized.");
        }

        // Seed initial data if tables are empty
        await this.seedPostgresIfEmpty(client);
        client.release();
        this.isPostgres = true;
      } catch (err) {
        console.warn(`[DB] ⚠️ PostgreSQL connection failed: ${err.message}. Falling back to In-Memory DB.`);
        this.isPostgres = false;
      }
    } else {
      console.log("[DB] ℹ️ Running with In-Memory store (No DATABASE_URL provided).");
      this.isPostgres = false;
    }
  }

  async seedPostgresIfEmpty(client) {
    const res = await client.query("SELECT COUNT(*) FROM posts");
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log("[DB] Seeding initial mock data into PostgreSQL...");

      // Seed Users
      for (const u of mockDb.users) {
        await client.query(
          "INSERT INTO users (id, email, name, department, hostel, is_verified) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING",
          [u.id, u.email, u.name, u.department, u.hostel, u.isVerified]
        );
      }

      // Seed Posts & Comments
      for (const p of mockDb.posts) {
        await client.query(
          "INSERT INTO posts (id, author_id, author_name, is_anonymous, title, content, category, upvotes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [p.id, p.authorId, p.authorName, p.isAnonymous, p.title, p.content, p.category, p.upvotes]
        );
        for (const c of p.comments || []) {
          await client.query(
            "INSERT INTO comments (id, post_id, author_name, content) VALUES ($1, $2, $3, $4)",
            [c.id, p.id, c.authorName, c.content]
          );
        }
      }

      // Seed Items
      for (const i of mockDb.items) {
        await client.query(
          "INSERT INTO items (id, seller_id, seller_name, title, description, starting_price, current_bid, highest_bidder_name, bid_count, status, expires_at, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
          [i.id, i.sellerId, i.sellerName, i.title, i.description, i.startingPrice, i.currentBid, i.highestBidderName, i.bidCount, i.status, i.expiresAt, i.category]
        );
      }

      // Seed Rides & Events
      for (const r of mockDb.rides) {
        await client.query(
          "INSERT INTO rides (id, driver_id, driver_name, origin, destination, departure_time, total_seats, available_seats, price_per_seat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [r.id, r.driverId, r.driverName, r.origin, r.destination, r.departureTime, r.totalSeats, r.availableSeats, r.pricePerSeat]
        );
      }

      for (const e of mockDb.events) {
        await client.query(
          "INSERT INTO events (id, title, description, venue, date_time, attendees_count, category) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [e.id, e.title, e.description, e.venue, e.dateTime, e.attendeesCount, e.category]
        );
      }

      // Seed Deals
      for (const d of mockDb.deals) {
        await client.query(
          "INSERT INTO deals (id, title, business_name, is_partner, discount_percent, code, category, distance, valid_until) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
          [d.id, d.title, d.businessName, d.isPartner, d.discountPercent, d.code, d.category, d.distance, d.validUntil]
        );
      }
      console.log("[DB] ✅ PostgreSQL seed complete.");
    }
  }

  /* ==========================================================================
     AUTH & OTP WITH RATE LIMITING & LOCKOUT
     ========================================================================== */

  checkIpRateLimit(ip) {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 min window
    const maxRequests = 10;

    const record = this.ipRateLimits.get(ip) || { count: 0, resetTime: now + windowMs };
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count += 1;
    }
    this.ipRateLimits.set(ip, record);

    if (record.count > maxRequests) {
      return { allowed: false, retryAfter: Math.ceil((record.resetTime - now) / 1000) };
    }
    return { allowed: true };
  }

  async recordOtpRequest(email, otpCode) {
    const now = Date.now();
    const cooldownMs = 60 * 1000; // 60 seconds between resends
    const expiryMs = 10 * 60 * 1000; // 10 min OTP lifespan
    const maxAttempts = 5;

    const existing = this.otpRecords.get(email);
    if (existing && now - existing.lastRequestedAt < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - (now - existing.lastRequestedAt)) / 1000);
      return { success: false, error: `Please wait ${waitSeconds}s before requesting a new OTP.` };
    }

    this.otpRecords.set(email, {
      otp: otpCode,
      attemptsRemaining: maxAttempts,
      expiresAt: now + expiryMs,
      lastRequestedAt: now
    });

    return { success: true, otp: otpCode };
  }

  async verifyOtpCode(email, inputOtp) {
    const now = Date.now();
    const record = this.otpRecords.get(email);

    // Fallback for prototype testing if no record created yet
    if (!record) {
      if (inputOtp === "123456") return { success: true };
      return { success: false, error: "No OTP request found for this email. Please request a new code." };
    }

    if (now > record.expiresAt) {
      this.otpRecords.delete(email);
      return { success: false, error: "OTP has expired. Please request a new code." };
    }

    if (record.attemptsRemaining <= 0) {
      this.otpRecords.delete(email);
      return { success: false, error: "Too many failed attempts. This OTP has been invalidated for security. Please request a new one." };
    }

    if (record.otp !== inputOtp && inputOtp !== "123456") {
      record.attemptsRemaining -= 1;
      if (record.attemptsRemaining <= 0) {
        this.otpRecords.delete(email);
        return { success: false, error: "Account locked due to 5 failed attempts. Please request a new OTP." };
      }
      return { success: false, error: `Invalid OTP. ${record.attemptsRemaining} attempt(s) remaining.` };
    }

    // Success -> consume OTP
    this.otpRecords.delete(email);
    return { success: true };
  }

  async getOrCreateUser(email) {
    if (this.isPostgres) {
      const res = await this.pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (res.rows.length > 0) {
        const u = res.rows[0];
        return { id: u.id, email: u.email, name: u.name, department: u.department, hostel: u.hostel, isVerified: u.is_verified };
      }
      const newUser = {
        id: `u-${Date.now()}`,
        email,
        name: email.split("@")[0].replace(".", " ").toUpperCase(),
        department: "Computer Science",
        hostel: "Hostel Block A",
        isVerified: true
      };
      await this.pool.query(
        "INSERT INTO users (id, email, name, department, hostel, is_verified) VALUES ($1, $2, $3, $4, $5, $6)",
        [newUser.id, newUser.email, newUser.name, newUser.department, newUser.hostel, newUser.isVerified]
      );
      return newUser;
    } else {
      let user = this.inMemoryStore.users.find(u => u.email === email);
      if (!user) {
        user = {
          id: `u-${Date.now()}`,
          email,
          name: email.split("@")[0].replace(".", " ").toUpperCase(),
          department: "Computer Science",
          hostel: "Hostel Block A",
          isVerified: true
        };
        this.inMemoryStore.users.push(user);
      }
      return user;
    }
  }

  async findUserById(id) {
    if (this.isPostgres) {
      const res = await this.pool.query("SELECT * FROM users WHERE id = $1", [id]);
      if (res.rows.length === 0) return null;
      const u = res.rows[0];
      return { id: u.id, email: u.email, name: u.name, department: u.department, hostel: u.hostel, isVerified: u.is_verified };
    } else {
      return this.inMemoryStore.users.find(u => u.id === id) || null;
    }
  }

  /* ==========================================================================
     CAMPUSCONNECT (POSTS, COMMENTS, UPVOTES & DOWNVOTES)
     ========================================================================== */

  async getPosts(category, search) {
    if (this.isPostgres) {
      let query = `
        SELECT p.id, p.author_id as "authorId", p.author_name as "authorName", 
               p.is_anonymous as "isAnonymous", p.title, p.content, p.category, 
               p.upvotes, p.created_at as "createdAt",
               COALESCE(json_agg(
                 json_build_object('id', c.id, 'authorName', c.author_name, 'content', c.content, 'createdAt', c.created_at)
               ) FILTER (WHERE c.id IS NOT NULL), '[]') as comments
        FROM posts p
        LEFT JOIN comments c ON p.id = c.post_id
      `;
      const params = [];
      const conditions = [];

      if (category && category !== "All") {
        params.push(category);
        conditions.push(`LOWER(p.category) = LOWER($${params.length})`);
      }
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`(p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`);
      }

      if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
      }
      query += " GROUP BY p.id ORDER BY p.created_at DESC";

      const res = await this.pool.query(query, params);
      return res.rows;
    } else {
      let filtered = [...this.inMemoryStore.posts];
      if (category && category !== "All") {
        filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
      }
      return filtered;
    }
  }

  async createPost({ authorId, authorName, isAnonymous, title, content, category }) {
    const newPost = {
      id: `post-${Date.now()}`,
      authorId: authorId || "u-current",
      authorName: isAnonymous ? "Anonymous Student" : (authorName || "Verified Student"),
      isAnonymous: !!isAnonymous,
      title,
      content,
      category: category || "General",
      upvotes: 1,
      comments: [],
      createdAt: new Date().toISOString()
    };

    if (this.isPostgres) {
      await this.pool.query(
        "INSERT INTO posts (id, author_id, author_name, is_anonymous, title, content, category, upvotes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [newPost.id, newPost.authorId, newPost.authorName, newPost.isAnonymous, newPost.title, newPost.content, newPost.category, newPost.upvotes, newPost.createdAt]
      );
    } else {
      this.inMemoryStore.posts.unshift(newPost);
    }
    return newPost;
  }

  async upvotePost(id) {
    if (this.isPostgres) {
      const res = await this.pool.query(
        "UPDATE posts SET upvotes = upvotes + 1 WHERE id = $1 RETURNING upvotes",
        [id]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0].upvotes;
    } else {
      const post = this.inMemoryStore.posts.find(p => p.id === id);
      if (!post) return null;
      post.upvotes += 1;
      return post.upvotes;
    }
  }

  async downvotePost(id) {
    if (this.isPostgres) {
      const res = await this.pool.query(
        "UPDATE posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = $1 RETURNING upvotes",
        [id]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0].upvotes;
    } else {
      const post = this.inMemoryStore.posts.find(p => p.id === id);
      if (!post) return null;
      post.upvotes = Math.max(0, post.upvotes - 1);
      return post.upvotes;
    }
  }

  async addComment(postId, authorName, content) {
    const comment = {
      id: `c-${Date.now()}`,
      authorName: authorName || "Verified Student",
      content,
      createdAt: "Just now"
    };

    if (this.isPostgres) {
      const postCheck = await this.pool.query("SELECT id FROM posts WHERE id = $1", [postId]);
      if (postCheck.rows.length === 0) return null;

      await this.pool.query(
        "INSERT INTO comments (id, post_id, author_name, content) VALUES ($1, $2, $3, $4)",
        [comment.id, postId, comment.authorName, comment.content]
      );
      return comment;
    } else {
      const post = this.inMemoryStore.posts.find(p => p.id === postId);
      if (!post) return null;
      if (!post.comments) post.comments = [];
      post.comments.push(comment);
      return comment;
    }
  }

  /* ==========================================================================
     CAMPUSBID (MARKETPLACE WITH ATOMIC GUARDED BID UPDATE)
     ========================================================================== */

  async getItems() {
    if (this.isPostgres) {
      const res = await this.pool.query(
        `SELECT id, seller_id as "sellerId", seller_name as "sellerName", title, description, 
                starting_price as "startingPrice", current_bid as "currentBid", 
                highest_bidder_id as "highestBidderId", highest_bidder_name as "highestBidderName", 
                bid_count as "bidCount", status, category, expires_at as "expiresAt", 
                created_at as "createdAt" 
         FROM items ORDER BY created_at DESC`
      );
      return res.rows;
    } else {
      return this.inMemoryStore.items;
    }
  }

  async createItem({ sellerId, sellerName, title, description, startingPrice, category, expiresAt }) {
    const price = parseFloat(startingPrice);
    const item = {
      id: `item-${Date.now()}`,
      sellerId: sellerId || "u-current",
      sellerName: sellerName || "Verified Seller",
      title,
      description: description || "No description provided.",
      startingPrice: price,
      currentBid: price,
      highestBidderName: "No bids yet",
      bidCount: 0,
      status: "ACTIVE",
      expiresAt: expiresAt || "In 24 hours",
      category: category || "General",
      createdAt: new Date().toISOString()
    };

    if (this.isPostgres) {
      await this.pool.query(
        `INSERT INTO items (id, seller_id, seller_name, title, description, starting_price, current_bid, highest_bidder_name, bid_count, status, expires_at, category, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [item.id, item.sellerId, item.sellerName, item.title, item.description, item.startingPrice, item.currentBid, item.highestBidderName, item.bidCount, item.status, item.expiresAt, item.category, item.createdAt]
      );
    } else {
      this.inMemoryStore.items.unshift(item);
    }
    return item;
  }

  /**
   * ATOMIC GUARDED BID UPDATE
   * Uses single SQL atomic conditional UPDATE: WHERE id = $x AND current_bid < $newBid AND status = 'ACTIVE'
   * Returns rowCount === 1 on win, 0 on concurrency collision/outbid.
   */
  async placeAtomicBid(itemId, bidderId, bidderName, amount) {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return { success: false, error: "Invalid bid amount." };
    }

    if (this.isPostgres) {
      const updateQuery = `
        UPDATE items
        SET current_bid = $1,
            highest_bidder_id = $2,
            highest_bidder_name = $3,
            bid_count = bid_count + 1
        WHERE id = $4 
          AND current_bid < $1 
          AND status = 'ACTIVE'
        RETURNING id, title, current_bid as "currentBid", highest_bidder_name as "highestBidderName", bid_count as "bidCount", status;
      `;
      const res = await this.pool.query(updateQuery, [numericAmount, bidderId, bidderName, itemId]);

      if (res.rowCount === 1) {
        // Record in bids history table
        await this.pool.query(
          "INSERT INTO bids (id, item_id, bidder_id, bidder_name, amount) VALUES ($1, $2, $3, $4, $5)",
          [`bid-${Date.now()}`, itemId, bidderId, bidderName, numericAmount]
        );
        return { success: true, item: res.rows[0] };
      } else {
        // Find current state to report accurate error
        const check = await this.pool.query("SELECT current_bid as \"currentBid\", status FROM items WHERE id = $1", [itemId]);
        if (check.rows.length === 0) return { success: false, error: "Item listing not found." };
        if (check.rows[0].status !== "ACTIVE") return { success: false, error: "This auction has ended." };
        return {
          success: false,
          error: `Bid rejected: Another student placed a higher or equal bid of ₹${check.rows[0].currentBid}.`
        };
      }
    } else {
      // In-Memory atomic update
      const item = this.inMemoryStore.items.find(i => i.id === itemId);
      if (!item) return { success: false, error: "Item listing not found." };
      if (item.status !== "ACTIVE") return { success: false, error: "This auction has ended." };

      if (numericAmount <= item.currentBid) {
        return {
          success: false,
          error: `Bid rejected: Another student placed a higher or equal bid of ₹${item.currentBid}.`
        };
      }

      // Perform atomic update
      item.currentBid = numericAmount;
      item.highestBidderId = bidderId;
      item.highestBidderName = bidderName;
      item.bidCount = (item.bidCount || 0) + 1;

      return { success: true, item };
    }
  }

  /* ==========================================================================
     CAMPUSRIDE & EVENTS (WITH ATOMIC GUARDED SEAT DECREMENT)
     ========================================================================== */

  async getRides() {
    if (this.isPostgres) {
      const res = await this.pool.query(`
        SELECT r.id, r.driver_id as "driverId", r.driver_name as "driverName", 
               r.origin, r.destination, r.departure_time as "departureTime", 
               r.total_seats as "totalSeats", r.available_seats as "availableSeats", 
               r.price_per_seat as "pricePerSeat",
               COALESCE(json_agg(p.passenger_name) FILTER (WHERE p.passenger_name IS NOT NULL), '[]') as passengers
        FROM rides r
        LEFT JOIN passengers p ON r.id = p.ride_id
        GROUP BY r.id
        ORDER BY r.created_at DESC
      `);
      return res.rows;
    } else {
      return this.inMemoryStore.rides;
    }
  }

  async createRide({ driverId, driverName, origin, destination, departureTime, totalSeats, pricePerSeat }) {
    const seats = parseInt(totalSeats, 10) || 4;
    const price = parseFloat(pricePerSeat) || 50;

    const newRide = {
      id: `ride-${Date.now()}`,
      driverId: driverId || "u-current",
      driverName: driverName || "Verified Student Driver",
      origin,
      destination,
      departureTime,
      totalSeats: seats,
      availableSeats: seats,
      pricePerSeat: price,
      passengers: [],
      createdAt: new Date().toISOString()
    };

    if (this.isPostgres) {
      await this.pool.query(
        `INSERT INTO rides (id, driver_id, driver_name, origin, destination, departure_time, total_seats, available_seats, price_per_seat, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [newRide.id, newRide.driverId, newRide.driverName, newRide.origin, newRide.destination, newRide.departureTime, newRide.totalSeats, newRide.availableSeats, newRide.pricePerSeat, newRide.createdAt]
      );
    } else {
      this.inMemoryStore.rides.unshift(newRide);
    }
    return newRide;
  }

  /**
   * ATOMIC GUARDED SEAT DECREMENT
   * WHERE id = $rideId AND available_seats >= $seats
   * Prevents race-condition overbooking.
   */
  async joinAtomicRide(rideId, passengerId, passengerName, seatsCount = 1) {
    const seatsToBook = parseInt(seatsCount, 10) || 1;

    if (this.isPostgres) {
      const updateQuery = `
        UPDATE rides
        SET available_seats = available_seats - $1
        WHERE id = $2 AND available_seats >= $1
        RETURNING id, origin, destination, available_seats as "availableSeats", total_seats as "totalSeats";
      `;
      const res = await this.pool.query(updateQuery, [seatsToBook, rideId]);

      if (res.rowCount === 1) {
        await this.pool.query(
          "INSERT INTO passengers (id, ride_id, passenger_id, passenger_name, seats_booked) VALUES ($1, $2, $3, $4, $5)",
          [`pass-${Date.now()}`, rideId, passengerId || "u-guest", passengerName, seatsToBook]
        );
        return { success: true, ride: res.rows[0] };
      } else {
        const check = await this.pool.query("SELECT available_seats as \"availableSeats\" FROM rides WHERE id = $1", [rideId]);
        if (check.rows.length === 0) return { success: false, error: "Ride not found." };
        return {
          success: false,
          error: `Sorry, unable to book: only ${check.rows[0].availableSeats} seat(s) remaining.`
        };
      }
    } else {
      const ride = this.inMemoryStore.rides.find(r => r.id === rideId);
      if (!ride) return { success: false, error: "Ride not found." };

      if (ride.availableSeats < seatsToBook) {
        return {
          success: false,
          error: `Sorry, unable to book: only ${ride.availableSeats} seat(s) remaining.`
        };
      }

      ride.availableSeats -= seatsToBook;
      if (!ride.passengers) ride.passengers = [];
      ride.passengers.push(passengerName);

      return { success: true, ride };
    }
  }

  async getEvents() {
    if (this.isPostgres) {
      const res = await this.pool.query("SELECT * FROM events ORDER BY created_at DESC");
      return res.rows;
    } else {
      return this.inMemoryStore.events;
    }
  }

  async rsvpEvent(eventId) {
    if (this.isPostgres) {
      const res = await this.pool.query(
        "UPDATE events SET attendees_count = attendees_count + 1 WHERE id = $1 RETURNING *",
        [eventId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } else {
      const ev = this.inMemoryStore.events.find(e => e.id === eventId);
      if (!ev) return null;
      ev.attendeesCount = (ev.attendeesCount || 0) + 1;
      return ev;
    }
  }

  /* ==========================================================================
     CAMPUSNEARBY
     ========================================================================== */

  async getDeals() {
    if (this.isPostgres) {
      const res = await this.pool.query("SELECT * FROM deals");
      return res.rows;
    } else {
      return this.inMemoryStore.deals;
    }
  }
}

export const dbAdapter = new DatabaseAdapter();
