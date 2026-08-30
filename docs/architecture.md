# CampusSync — System Architecture & API Contracts

> **Note**: Owned jointly by Member 1 (Architecture), Member 5 (Backend 1), and Member 6 (Backend 2). Used by Member 3, 4 (Web Frontend), Member 7 (Mobile & DevOps), and Member 8 (QA).

---

## 1. High-Level Architecture Overview

CampusSync follows a **single centralized backend with dual client platforms** (Web for Laptop/Desktop users and Android Mobile App for smartphone users). Both platforms share the exact same database, business logic, authentication system, and real-time event pipeline.

```
 ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
 │     WEB CLIENT (React + Vite)        │     │    ANDROID APP (React Native / Expo) │
 │       Target: Laptop / Desktop       │     │        Target: Android Mobile        │
 │          Hosted on Vercel            │     │        Tested on Expo Go / EAS       │
 └───────────────────┬──────────────────┘     └───────────────────┬──────────────────┘
                     │                                            │
                     │  HTTPS REST API & WebSocket (Socket.io)    │
                     └────────────────────┬───────────────────────┘
                                          │
 ┌────────────────────────────────────────▼──────────────────────────────────────────┐
 │                        RENDER.COM HOSTING INFRASTRUCTURE                          │
 │                                                                                   │
 │  ┌─────────────────────────────────────────────────────────────────────────────┐  │
 │  │              Node.js + Express + Socket.io Web Service Engine               │  │
 │  │  ┌────────────────────────┐   ┌────────────────────────┐   ┌─────────────┐  │  │
 │  │  │ Auth & OTP Middleware  │   │ Socket.io Event Engine │   │ Rate Limit  │  │  │
 │  │  └───────────┬────────────┘   └───────────┬────────────┘   └──────┬──────┘  │  │
 │  │              │                            │                       │         │  │
 │  │  ┌───────────▼────────────┐   ┌───────────▼────────────┐          │         │  │
 │  │  │ Member 5 Services      │   │ Member 6 Services      │          │         │  │
 │  │  │ - Campus Verification  │   │ - Bidding Concurrency  │          │         │  │
 │  │  │ - Connect Feed & Posts │   │ - Market Listings      │          │         │  │
 │  │  │ - Ride & Seat Logic    │   │ - Nearby Deals Feed    │          │         │  │
 │  │  └───────────┬────────────┘   └───────────┬────────────┘          │         │  │
 │  └──────────────┼────────────────────────────┼───────────────────────┴───────┬─┘  │
 │                 │ Private Internal Network (Zero Latency & No Egress Cost)   │    │
 │  ┌──────────────▼────────────────────────────▼───────────────────────────────▼─┐  │
 │  │            Render Managed PostgreSQL Database (campsync_db)                 │  │
 │  │     Users   │   Posts   │   Comments   │   Bids   │   Items   │   Rides     │  │
 │  └─────────────────────────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Architecture & Hosting Topology

### A. Infrastructure Specifications

| Component | Technology | Hosting Provider | Deployment & Operational Details |
|---|---|---|---|
| **Backend API & WebSockets** | Node.js (v18+) + Express + Socket.io | **Render.com (Web Service)** | Persistent process support, automatic HTTPS/WSS, auto-deploy from `CampSync.git` repo. |
| **Shared Database** | PostgreSQL 15+ | **Render Managed PostgreSQL (`campsync_db`)** | Hosted in same Render region, private internal network URL (`DATABASE_URL`), persistent storage. |
| **Website (Laptop)** | React + Vite Single Page App | **Vercel** | Global Edge CDN, automated preview/production deployments on push. |
| **Mobile App (Android)** | React Native (Expo) | **Expo Go (Dev) & Expo EAS (Cloud APK Build)** | Zero Android Studio required; live reload via Expo Go, cloud `.apk` builds via EAS. |

### B. Client-to-Backend Connection Model

1. **Unified REST API Base URL**:
   - Both Web and Android connect to `https://campsync-server.onrender.com/api` (configured via environment variables `VITE_API_URL` and `EXPO_PUBLIC_API_URL`).
2. **Unified WebSocket Connection**:
   - Both platforms connect to the same Socket.io server instance (`socket.io-client`).
3. **Shared Authentication (JWT)**:
   - User logs in once from either Web or Mobile via college email OTP verification.
   - Server returns signed JWT token.
   - **Web**: Persisted in `localStorage`.
   - **Android**: Persisted in `Expo SecureStore` / `AsyncStorage`.
   - All protected requests pass header: `Authorization: Bearer <token>`.

---

## 3. Database Schema (Entities & Relationships)

### A. Users & Verification (`users`)
- `id` (UUID / Serial, Primary Key)
- `email` (VARCHAR, Unique, Must end with college domain e.g. `@college.edu`)
- `name` (VARCHAR)
- `department` (VARCHAR)
- `hostel` (VARCHAR)
- `is_verified` (BOOLEAN, default `false`)
- `created_at` (TIMESTAMP)

### B. CampusConnect Posts (`posts` & `comments`)
- `posts`: `id`, `author_id` (User FK), `is_anonymous` (BOOLEAN), `title` (VARCHAR), `content` (TEXT), `category` (VARCHAR), `upvotes` (INTEGER), `created_at`
- `comments`: `id`, `post_id` (Post FK), `author_id` (User FK), `author_name` (VARCHAR), `content` (TEXT), `created_at`

### C. CampusBid Marketplace (`items` & `bids`)
- `items`: `id`, `seller_id` (User FK), `seller_name` (VARCHAR), `title` (VARCHAR), `description` (TEXT), `starting_price` (DECIMAL), `current_bid` (DECIMAL), `highest_bidder_id` (User FK), `highest_bidder_name` (VARCHAR), `bid_count` (INTEGER), `status` (`ACTIVE`, `SOLD`, `EXPIRED`), `expires_at` (TIMESTAMP), `category` (VARCHAR)
- `bids`: `id`, `item_id` (Item FK), `bidder_id` (User FK), `bidder_name` (VARCHAR), `amount` (DECIMAL), `created_at` (TIMESTAMP)

### D. CampusRide & Events (`rides`, `passengers`, `events`)
- `rides`: `id`, `driver_id` (User FK), `driver_name` (VARCHAR), `origin` (VARCHAR), `destination` (VARCHAR), `departure_time` (VARCHAR), `total_seats` (INTEGER), `available_seats` (INTEGER), `price_per_seat` (DECIMAL), `created_at`
- `passengers`: `id`, `ride_id` (Ride FK), `passenger_id` (User FK), `passenger_name` (VARCHAR), `joined_at`
- `events`: `id`, `organizer_id` (User FK), `title` (VARCHAR), `description` (TEXT), `venue` (VARCHAR), `date_time` (VARCHAR), `attendees_count` (INTEGER), `category` (VARCHAR)

### E. CampusNearby (`deals`)
- `deals`: `id`, `title` (VARCHAR), `business_name` (VARCHAR), `is_partner` (BOOLEAN), `discount_percent` (INTEGER), `code` (VARCHAR), `category` (VARCHAR), `distance` (VARCHAR), `valid_until` (VARCHAR)

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
- `POST /api/bid/items` — `{ title, description, startingPrice, category, expiresAt }` → Creates listing.
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
| `bid:new_highest` | Server → All Clients (Web & App) | `{ itemId, currentBid, highestBidderName, bidCount }` | Broadcasted when a higher bid is placed in real-time. |
| `connect:new_post` | Server → All Clients (Web & App) | `{ post }` | Broadcasted when a new community post is published. |
