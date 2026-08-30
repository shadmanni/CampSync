# CampusSync — System Architecture & API Contracts

> **Note**: Owned jointly by Member 1 (Architecture), Member 5 (Backend 1), and Member 6 (Backend 2). Used by Member 3, 4 (Web Frontend), Mobile App Team, Member 7 (DevOps), and Member 8 (QA).

---

## 1. High-Level Architecture Overview

CampusSync follows a **single centralized backend with dual client platforms** (Web for Laptop/Desktop users and Android Mobile App for smartphone users). Both platforms share the exact same database, business logic, authentication system, and real-time event pipeline.

```
 ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
 │     WEB CLIENT (React + Vite)        │     │    ANDROID APP (React Native / Expo) │
 │       Target: Laptop / Desktop       │     │        Target: Android Mobile        │
 │  CampusConnect  │  CampusBid         │     │  CampusConnect  │  CampusBid         │
 │  CampusRide     │  CampusNearby      │     │  CampusRide     │  CampusNearby      │
 └───────────────────┬──────────────────┘     └───────────────────┬──────────────────┘
                     │                                            │
                     │  HTTPS REST API & WebSocket (Socket.io)    │
                     └────────────────────┬───────────────────────┘
                                          │
 ┌────────────────────────────────────────▼──────────────────────────────────────────┐
 │                        BACKEND SERVER LAYER (Node.js / Express)                   │
 │                                                                                   │
 │  ┌────────────────────────┐   ┌────────────────────────┐   ┌───────────────────┐  │
 │  │ Auth & OTP Middleware  │   │ Socket.io Event Engine │   │ API Rate Limiter  │  │
 │  └───────────┬────────────┘   └───────────┬────────────┘   └─────────┬─────────┘  │
 │              │                            │                          │            │
 │  ┌───────────▼────────────┐   ┌───────────▼────────────┐             │            │
 │  │ Member 5 Services      │   │ Member 6 Services      │             │            │
 │  │ - Campus Verification  │   │ - Bidding Concurrency  │             │            │
 │  │ - Connect Feed & Posts │   │ - Market Listings      │             │            │
 │  │ - Ride & Seat Logic    │   │ - Nearby Deals Feed    │             │            │
 │  └───────────┬────────────┘   └───────────┬────────────┘             │            │
 └──────────────┼────────────────────────────┼──────────────────────────┴────────────┘
                │ Managed PostgreSQL / Supabase / MongoDB
 ┌──────────────▼────────────────────────────▼───────────────────────────────────────┐
 │                               SHARED DATABASE LAYER                               │
 │     Users   │   Posts   │   Comments   │   Bids   │   Items   │   Rides   │ Deals │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Architecture & Hosting Strategy

### A. Hosting Infrastructure Breakdown

| Component | Target Platform | Recommended Hosting Solution | Details |
|---|---|---|---|
| **Backend API & WebSockets** | Node.js + Express + Socket.io | **Railway.app** / **Render.com** (or Ubuntu VPS via DigitalOcean + PM2 + NGINX) | Persistent process support, automatic HTTPS/WSS, WebSocket upgrade support. |
| **Shared Database** | Relational / Document Store | **Supabase (PostgreSQL)** / **Neon.tech** / **MongoDB Atlas** | Cloud-hosted, high-availability, shared connection pool. |
| **Website (Laptop)** | React + Vite Single Page App | **Vercel** / **Netlify** / **Cloudflare Pages** | Global Edge CDN, fast asset delivery, auto-deploy from GitHub. |
| **Mobile App (Android)** | React Native (Expo) | **Expo EAS (Cloud Build) & Google Play / Direct APK** | Standalone Android APK & AAB distribution. |

### B. Client-to-Backend Connection Model

1. **Unified REST API Base URL**:
   - Both Web and Android connect to `https://api.yourdomain.com/api` (or environment variable `API_URL`).
2. **Unified WebSocket Connection**:
   - Both platforms connect to the same Socket.io server instance (`socket.io-client`).
3. **Shared Authentication (JWT)**:
   - User logs in once from either Web or Mobile via college email OTP verification.
   - Server returns signed JWT token.
   - **Web**: Persisted in `localStorage` or `httpOnly Cookies`.
   - **Android**: Persisted in `Expo SecureStore` / `AsyncStorage`.
   - All protected requests pass header: `Authorization: Bearer <token>`.

---

## 3. Database Schema (Entities & Relationships)

### A. Users & Verification (`users`)
- `id` (UUID, Primary Key)
- `email` (String, Unique, Must end with college domain e.g. `@college.edu`)
- `name` (String)
- `department` (String)
- `hostel` (String)
- `isVerified` (Boolean, default `false`)
- `createdAt` (Timestamp)

### B. CampusConnect Posts (`posts` & `comments`)
- `posts`: `id`, `authorId` (User UUID), `isAnonymous` (Boolean), `title`, `content`, `category`, `upvotes` (Integer), `createdAt`
- `comments`: `id`, `postId` (Post UUID), `authorId` (User UUID), `content`, `createdAt`

### C. CampusBid Marketplace (`items` & `bids`)
- `items`: `id`, `sellerId` (User UUID), `title`, `description`, `startingPrice` (Float), `currentBid` (Float), `highestBidderId` (User UUID), `status` (`ACTIVE`, `SOLD`, `EXPIRED`), `expiresAt`
- `bids`: `id`, `itemId` (Item UUID), `bidderId` (User UUID), `amount` (Float), `timestamp`

### D. CampusRide & Events (`rides` & `events`)
- `rides`: `id`, `driverId` (User UUID), `origin`, `destination`, `departureTime`, `totalSeats` (Integer), `availableSeats` (Integer), `pricePerSeat` (Float)
- `events`: `id`, `organizerId` (User UUID), `title`, `description`, `venue`, `dateTime`, `attendeesCount` (Integer)

### E. CampusNearby (`deals`)
- `deals`: `id`, `title`, `businessName`, `isPartner` (Boolean), `discountPercent` (Integer), `code` (String), `category`, `validUntil`

---

## 4. API Endpoint Contracts

### Auth & Campus Verification (Member 5)
- `POST /api/auth/request-otp` — `{ email }` → Send 6-digit OTP code to college email.
- `POST /api/auth/verify-otp` — `{ email, otp }` → Returns JWT auth token & user profile.
- `GET /api/auth/me` — Requires Bearer Token → Returns authenticated user object.

### CampusConnect Feed APIs (Member 5)
- `GET /api/connect/posts?category=academic&search=` → Returns list of posts.
- `POST /api/connect/posts` — `{ title, content, category, isAnonymous }` → Creates post.
- `POST /api/connect/posts/:id/upvote` → Toggles upvote counter.
- `POST /api/connect/posts/:id/comments` — `{ content }` → Adds comment.

### CampusBid Marketplace APIs (Member 6)
- `GET /api/bid/items?status=ACTIVE` → Returns active marketplace listings.
- `POST /api/bid/items` — `{ title, description, startingPrice, expiresAt }` → Creates listing.
- `POST /api/bid/items/:id/bid` — `{ amount }` → Validates higher bid, updates item currentBid, emits socket update.

### CampusRide & Events APIs (Member 5)
- `GET /api/ride/rides` → Returns upcoming carpools.
- `POST /api/ride/rides` — `{ origin, destination, departureTime, totalSeats, pricePerSeat }` → Posts ride.
- `POST /api/ride/rides/:id/join` — `{ seatsCount }` → Decrements `availableSeats` safely, emits live seat update.
- `GET /api/ride/events` → Returns campus events.

### CampusNearby APIs (Member 6)
- `GET /api/nearby/deals?partnerOnly=false` → Returns local discounts & events.

---

## 5. Real-Time Socket.io Event Specification

| Socket Event Name | Direction | Payload | Description |
|---|---|---|---|
| `ride:seat_updated` | Server → All Clients (Web & App) | `{ rideId, availableSeats }` | Broadcasted when a student joins or leaves a carpool. |
| `bid:new_highest` | Server → All Clients (Web & App) | `{ itemId, currentBid, highestBidderName }` | Broadcasted when a higher bid is successfully placed in real-time. |
| `connect:new_post` | Server → All Clients (Web & App) | `{ post }` | Broadcasted when a new community post is published. |
