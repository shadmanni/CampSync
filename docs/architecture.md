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
 │  │  │ Core Services:         │   │ Market & Task Engine:  │          │         │  │
 │  │  │ - College Auth & OTP   │   │ - Bidding & Auctions   │          │         │  │
 │  │  │ - Connect Social Feed  │   │ - Skill-Sharing Net    │          │         │  │
 │  │  │ - Cab Sharing Carpool  │   │ - Micro-Tasks / Gigs   │          │         │  │
 │  │  │ - Local Deals & Events │   │ - Second-Hand Store    │          │         │  │
 │  │  └───────────┬────────────┘   └───────────┬────────────┘          │         │  │
 │  └──────────────┼────────────────────────────┼───────────────────────┴───────┬─┘  │
 │                 │ Private Internal Network (Zero Latency & No Egress Cost)   │    │
 │  ┌──────────────▼────────────────────────────▼───────────────────────────────▼─┐  │
 │  │            Render Managed PostgreSQL Database (campsync_db)                 │  │
 │  │   Users  │ Posts │ Comments │ Items │ Bids │ Skills │ Tasks │ Rides │ Deals │  │
 │  └─────────────────────────────────────────────────────────────────────────────┘  │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Platform Architecture & Hosting Topology

### A. Infrastructure Specifications

| Component | Technology | Hosting Provider | Deployment & Operational Details |
|---|---|---|---|
| **Backend API & WebSockets** | Node.js (v18+) + Express + Socket.io | **Render.com (Web Service)** | Persistent process support, automatic HTTPS/WSS, auto-deploy from `CampSync.git` repo. |
| **Shared Database** | PostgreSQL 15+ | **Render Managed PostgreSQL (`campsync_db`)** | Hosted in same Render region, private internal network URL (`DATABASE_URL`), persistent storage, automatic schema migrations. |
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

### A. Users & Verification (`users` & `otp_verifications`)
- `users`: `id`, `email`, `name`, `department`, `hostel`, `is_verified`, `created_at`
- `otp_verifications`: `email`, `otp_code`, `attempts_remaining`, `expires_at`, `last_requested_at`, `request_count`

### B. CampusConnect Posts (`posts` & `comments`)
- `posts`: `id`, `author_id`, `author_name`, `is_anonymous`, `title`, `content`, `category`, `upvotes`, `created_at`
- `comments`: `id`, `post_id`, `author_name`, `content`, `created_at`

### C. Student Marketplace & CampusBid (`items` & `bids`)
- `items`: `id`, `seller_id`, `seller_name`, `title`, `description`, `starting_price`, `current_bid`, `highest_bidder_id`, `highest_bidder_name`, `bid_count`, `status` (`ACTIVE`, `SOLD`, `EXPIRED`), `listing_type` (`AUCTION`, `FIXED_PRICE`), `condition`, `contact_info`, `expires_at`, `category`, `created_at`
- `bids`: `id`, `item_id`, `bidder_id`, `bidder_name`, `amount`, `created_at`

### D. Skill-Sharing Network (`skills`)
- `skills`: `id`, `user_id`, `user_name`, `user_department`, `user_hostel`, `title`, `description`, `category` (Tech & Coding, Academics & Tutoring, Design & Media, Music & Arts, Languages), `type` (`OFFER`, `REQUEST`), `pricing`, `contact`, `created_at`

### E. Micro-Tasks & Campus Gigs (`tasks`)
- `tasks`: `id`, `creator_id`, `creator_name`, `creator_hostel`, `title`, `description`, `reward`, `category`, `pickup_location`, `drop_location`, `status` (`OPEN`, `ASSIGNED`, `COMPLETED`, `CANCELLED`), `assigned_to_id`, `assigned_to_name`, `deadline`, `created_at`

### F. CampusRide & Events (`rides`, `passengers`, `events`)
- `rides`: `id`, `driver_id`, `driver_name`, `origin`, `destination`, `departure_time`, `total_seats`, `available_seats`, `price_per_seat`, `created_at`
- `passengers`: `id`, `ride_id`, `passenger_id`, `passenger_name`, `seats_booked`, `joined_at`
- `events`: `id`, `organizer_id`, `title`, `description`, `venue`, `date_time`, `attendees_count`, `category`, `created_at`

### G. CampusNearby (`deals`)
- `deals`: `id`, `title`, `business_name`, `is_partner`, `discount_percent`, `code`, `category`, `distance`, `valid_until`

---

## 4. API Endpoint Contracts

### Auth & Campus Verification
- `POST /api/auth/request-otp` — `{ email }` → Send 6-digit OTP code to college email (rate-limited, 60s cooldown).
- `POST /api/auth/verify-otp` — `{ email, otp }` → Returns JWT auth token & user profile (5-attempt lockout).
- `GET /api/auth/me` — Requires Bearer Token → Returns authenticated user object.

### CampusConnect Feed APIs
- `GET /api/connect/posts` → Returns list of posts with comments and vote scores.
- `POST /api/connect/posts` — `{ title, content, category, isAnonymous }` → Creates post.
- `POST /api/connect/posts/:id/upvote` → Increments upvote counter.
- `POST /api/connect/posts/:id/downvote` → Decrements upvote counter.
- `POST /api/connect/posts/:id/comments` — `{ content }` → Adds threaded comment.

### CampusBid & Student Marketplace
- `GET /api/bid/items` → Returns active marketplace listings (Fixed price & Auction).
- `POST /api/bid/items` — `{ title, description, startingPrice, category, expiresAt, listingType, condition, contactInfo }` → Creates listing.
- `POST /api/bid/items/:id/bid` — `{ amount, bidderName }` → Atomic guarded bid update; broadcasts `bid:new_highest`.

### Skill-Sharing Network
- `GET /api/skills?category=&type=&search=` → Returns skills filtered by category and type (`OFFER` vs `REQUEST`).
- `GET /api/skills/:id` → Returns single skill profile.
- `POST /api/skills` — `{ title, description, category, type, pricing, contact }` → Creates skill offer/request.
- `DELETE /api/skills/:id` → Removes skill listing.

### Micro-Tasks & Campus Gigs
- `GET /api/tasks?status=&category=` → Returns tasks filtered by status (`OPEN`, `ASSIGNED`, `COMPLETED`).
- `GET /api/tasks/:id` → Returns task details.
- `POST /api/tasks` — `{ title, description, reward, category, pickupLocation, dropLocation, deadline }` → Creates task.
- `POST /api/tasks/:id/accept` → Atomic guarded assignment (`WHERE status = 'OPEN'`); broadcasts `task:assigned`.
- `POST /api/tasks/:id/complete` → Marks task completed.

### CampusRide & Events
- `GET /api/ride/rides` → Returns upcoming carpools with passenger lists.
- `POST /api/ride/rides` — `{ origin, destination, departureTime, totalSeats, pricePerSeat }` → Posts ride.
- `POST /api/ride/rides/:id/join` — `{ seatsCount }` → Atomic guarded seat decrement (`WHERE available_seats >= n`); broadcasts `ride:seat_updated`.
- `GET /api/ride/events` → Returns campus events.
- `POST /api/ride/events/:id/rsvp` → Increments event attendee counter.

### CampusNearby Deals
- `GET /api/nearby/deals` → Returns local cafe/store discounts and promo codes.

---

## 5. Real-Time Socket.io Event Specification

| Socket Event Name | Direction | Payload | Description |
|---|---|---|---|
| `bid:new_highest` | Server → All Clients | `{ itemId, currentBid, highestBidderName, bidCount }` | Broadcasted when a higher bid is placed in real-time. |
| `ride:seat_updated` | Server → All Clients | `{ rideId, availableSeats }` | Broadcasted when a student joins or leaves a carpool. |
| `task:created` | Server → All Clients | `{ task }` | Broadcasted when a new micro-task or errand is posted. |
| `task:assigned` | Server → All Clients | `{ taskId, status, assignedToName }` | Broadcasted when a runner accepts an errand. |
| `task:completed` | Server → All Clients | `{ taskId, status }` | Broadcasted when a task is marked completed. |
| `skill:created` | Server → All Clients | `{ skill }` | Broadcasted when a student offers or requests a skill. |
| `connect:new_post` | Server → All Clients | `{ post }` | Broadcasted when a new community post is published. |
