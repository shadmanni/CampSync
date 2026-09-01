# CampusSync — Implementation & Execution Plan

> **Note**: Owned by Member 1 (Lead) and Member 7 (DevOps/Integration). **Rule**: All team members must read and update this document alongside `memory.md`, `design.md`, and `architecture.md` whenever work progresses.

---

## 1. Project Architecture Strategy

CampusSync is engineered as a **dual-platform system with a single shared core**:
1. **Web Client (`client/`)**: Built with React + Vite, hosted on **Vercel** (Global Edge CDN), tailored for laptop/desktop screen real estate.
2. **Android App (`app/`)**: Built with React Native + Expo, tested via **Expo Go** (physical phone live reload), and built into APKs via **Expo EAS** (no Android Studio required).
3. **Backend Engine (`server/`)**: Centralized Node.js + Express + Socket.io server hosted on **Render.com** (Web Service).
4. **Shared Database**: **Render Managed PostgreSQL Database (`campsync_db`)** directly connected to the server via Render's internal zero-latency network.

---

## 2. Directory Layout Blueprint
```
CPI/
├── package.json                # Root monorepo orchestration (concurrent dev, db:setup)
├── docs/                       # Project documentation suite
│   ├── memory.md               # Project memory, decisions & state
│   ├── design.md               # Visual design tokens & dual UI specs
│   ├── architecture.md         # System diagram, database schema & API contracts
│   └── implementation.md       # Execution plan, run steps & deployment guide
├── client/                     # Web Application (React + Vite - Laptop/Desktop)
│   ├── src/
│   │   ├── components/         # Button, Card, Badge, Modal, Navbar
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── modules/            # Connect, Bid, Ride, Nearby, Auth
│   │   ├── styles/             # design-system.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── app/                        # Android Mobile App (React Native / Expo)
│   ├── src/
│   │   ├── components/         # Mobile UI widgets, BottomSheet, TouchCards
│   │   ├── navigation/         # BottomTabNavigator, StackNavigator
│   │   ├── screens/            # ConnectScreen, BidScreen, RideScreen, NearbyScreen
│   │   ├── services/           # api.js, socket.js, authStorage.js
│   │   └── theme/              # themeTokens.js (matches design.md)
│   ├── app.json                # Expo config & Android package name
│   └── package.json
└── server/                     # Backend API & WebSocket Engine (Node.js/Express)
    ├── src/
    │   ├── controllers/        # auth, connect, bid, ride, nearby, skills, tasks
    │   ├── middleware/         # authMiddleware.js, errorHandler.js
    │   ├── routes/             # api.js, authRoutes, connectRoutes, bidRoutes, rideRoutes, nearbyRoutes, skillRoutes, taskRoutes
    │   ├── sockets/            # socketHandler.js
    │   ├── store/              # dbAdapter.js, schema.sql, mockDb.js
    │   └── server.js
    ├── setup-supabase.js       # Automated Supabase schema creation & table setup script
    ├── test-api.js             # Automated integration & concurrency test suite
    ├── package.json
    └── .env.example
```

---

## 3. Execution Phases & Timeline (6-Week Roadmap)

### Phase 1 — Setup & Dual-Platform Architecture (Week 1)
- [x] Create project workspace layout (`client/`, `server/`, `docs/`, `app/`).
- [x] Formulate architecture contracts for Render server, Render/Supabase PostgreSQL DB, and unified REST/Socket APIs.
- [x] Scaffold React + Vite client app (`client/`) with design tokens.
- [x] Scaffold Node.js + Express backend (`server/`) with mock data store & JWT auth.
- [x] Scaffold React Native / Expo app (`app/`) with matching theme tokens and navigation.

### Phase 2 — Modular Backend & Cloud Database (Weeks 2–3)
- [x] **Backend Team (Members 5 & 6)**: Build modular controllers (`auth`, `connect`, `bid`, `skills`, `tasks`, `ride`, `nearby`), PostgreSQL migration scripts (`schema.sql`), and real-time Socket.io handlers.
- [x] Implement atomic concurrency guards for Bidding, Carpool bookings, and Task claims.
- [x] Implement OTP rate limiting, cooldown, and lockout protection.
- [x] Run automated test suite (`test-api.js`) — **33/33 tests passing with 0 failures**.
- [x] **Web Frontend (Members 3 & 4)**: Build CampusConnect, CampusBid, CampusSkills, CampusTasks, CampusRide, and CampusNearby views.
- [x] **Mobile App (Member 7)**: Build matching mobile screens with bottom navigation, pull-to-refresh, touch scroll chips, and slide-up drawers.

### Phase 3 — Cloud Hosting & Mobile Synchronization (Week 4)
- [x] **Member 7 (DevOps/Integration)**:
  - Database schema & adapters configured for Supabase / Render Managed PostgreSQL database.
  - Automated database setup via `npm run db:setup` (`setup-supabase.js`).
  - Deployable Node.js web service for `server/` with `DATABASE_URL` wired.
  - Web client configured with proxy and responsive desktop layouts.
  - Mobile client configured on Expo with local Web fallback and SecureStore JWT persistence.
- [x] Verify both Web and Mobile connect to the same backend and sync in real time.

### Phase 4 — Testing, Security & Presentation (Weeks 5–6)
- [x] **Member 8 (QA & Security)**: Execute cross-platform testing (actions on Web immediately reflect on Mobile app in real-time).
- [x] Security audit: College email OTP verification enforcement (`@learner.manipal.edu`, `@manipal.edu`) and rate limiting.
- [x] Mobile UI optimization: Single-column responsive layouts, horizontal touch-scrolling pills, and safe-area bottom modals.

---

## 4. Local Development & Run Commands

### A. One-Command Full Stack (Recommended)
From the workspace root (`CPI/`):
```bash
# Run both Server & Client concurrently:
npm run dev

# Provision/Migrate Supabase PostgreSQL Database:
npm run db:setup
```

### B. Individual Services
```bash
# Web Client only:
npm run client          # or: cd client && npm run dev

# Backend Server only:
npm run server          # or: cd server && npm start

# Expo Mobile App:
npm run app             # or: cd app && npm start

# Run automated integration & race-condition test suite:
node server/test-api.js
```

---

## 5. Cloud Hosting & Database Guide

### 1. Supabase PostgreSQL Database Setup (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a project.
2. In Project Settings → **Database** → **Connection String**, copy the **Transaction Pooler** or **Direct** connection URL.
3. In `server/.env`, set:
   ```env
   DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
   ```
4. Run the automated schema provisioning script:
   ```bash
   npm run db:setup
   ```
   *This automatically verifies connectivity, handles remote SSL, and provisions all 11 tables and indices.*

### 2. Render Database Setup (Alternative: Render Managed PostgreSQL)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Name: `campsync-db`, Database: `campsync_db`, User: `campsync_user`.
4. Region: Choose closest region (e.g., Singapore or Frankfurt).
5. Click **Create Database**.
6. Copy the **Internal Database URL** and set `DATABASE_URL` in `server/.env`.
7. Run `npm run db:setup`.

### 2. Render Server Setup (Node.js Web Service)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your GitHub repository: `https://github.com/shadmanni/CampSync.git` (branch `abhijeet`).
3. Settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `JWT_SECRET`: `campussync_super_secret_jwt_key_2026`
   - `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
   - `CORS_ORIGIN`: `*` (or your Vercel URL)
5. Click **Create Web Service**. Render will deploy your live API and WebSocket endpoint (e.g., `https://campsync-server.onrender.com`).

### 3. Web Client Hosting (Vercel)
1. Go to [Vercel](https://vercel.com) and click **Add New** → **Project**.
2. Import `CampSync` GitHub repository.
3. Configure Project:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://campsync-server.onrender.com`
5. Click **Deploy**.

### 4. Android App APK Build (Expo EAS)
1. In `app/app.json`, configure Android bundle identifier:
   ```json
   {
     "expo": {
       "name": "CampusSync",
       "slug": "campussync",
       "android": {
         "package": "com.campussync.app"
       }
     }
   }
   ```
2. Build standalone APK in the cloud without Android Studio:
   ```bash
   npm install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```
3. Download the generated `.apk` file and install it directly on any Android phone.

---

## 6. Cross-Platform QA & Real-Time Sync Checklist

| Test Scenario | Laptop (Web) Action | Mobile (Android) Action | Expected Result |
|---|---|---|---|
| **Real-Time Bid Sync** | Place a higher bid on Web | View item in Android App | Android screen updates highest bid instantly without refreshing via Socket.io. |
| **Carpool Seat Update** | Join carpool from Android App | View ride list on Web | Available seat counter decrements live on Web dashboard. |
| **Authentication Session** | Login via college email on Web | Login with same credentials on Mobile | Both receive valid JWT tokens and can access protected user features. |
| **Post Creation** | Publish new post on Web | Feed open on Android App | Android feed receives `connect:new_post` socket event and prepends post. |
