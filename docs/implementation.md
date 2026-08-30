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
    │   ├── controllers/        # auth, connect, bid, ride, nearby
    │   ├── middleware/         # authMiddleware.js, errorHandler.js
    │   ├── routes/             # api.js, authRoutes, connectRoutes, bidRoutes, rideRoutes, nearbyRoutes
    │   ├── sockets/            # socketHandler.js
    │   ├── store/              # dbAdapter.js, schema.sql, mockDb.js
    │   └── server.js
    ├── test-api.js             # Automated integration & concurrency test suite
    ├── package.json
    └── .env.example
```

---

## 3. Execution Phases & Timeline (6-Week Roadmap)

### Phase 1 — Setup & Dual-Platform Architecture (Week 1)
- [x] Create project workspace layout (`client/`, `server/`, `docs/`, `app/`).
- [x] Formulate architecture contracts for Render server, Render PostgreSQL DB, and unified REST/Socket APIs.
- [x] Scaffold React + Vite client app (`client/`) with design tokens.
- [x] Scaffold Node.js + Express backend (`server/`) with mock data store & JWT auth.
- [ ] Scaffold React Native / Expo app (`app/`) with matching theme tokens and navigation.

### Phase 2 — Modular Backend & Cloud Database (Weeks 2–3)
- [x] **Backend Team (Members 5 & 6)**: Build modular controllers (`auth`, `connect`, `bid`, `ride`, `nearby`), PostgreSQL migration scripts (`schema.sql`), and real-time Socket.io handlers.
- [x] Implement atomic concurrency guards for Bidding and Carpool bookings.
- [x] Implement OTP rate limiting, cooldown, and lockout protection.
- [x] Run automated test suite (`test-api.js`) — 22/22 tests passing.
- [ ] **Web Frontend (Members 3 & 4)**: Build CampusConnect, CampusBid, CampusRide, and CampusNearby views for laptop browsers.
- [ ] **Mobile App (Member 7)**: Build matching mobile screens with bottom navigation, pull-to-refresh, and slide-up drawers.

### Phase 3 — Render Cloud Hosting & EAS Build (Week 4)
- [ ] **Member 7 (DevOps/Integration)**:
  - Create **Render Managed PostgreSQL** database instance (`campsync_db`).
  - Deploy **Render Web Service** for `server/` with internal `DATABASE_URL` wired.
  - Deploy Web Client on **Vercel** with `VITE_API_URL` pointed to Render live backend.
  - Configure **Expo EAS** to generate standalone Android APK (`eas build -p android --profile preview`).
- [ ] Verify both Web (laptop) and Android App (mobile) connect to the live Render backend.

### Phase 4 — Testing, Security & Presentation (Weeks 5–6)
- [ ] **Member 8 (QA & Security)**: Execute cross-platform testing (action on Web immediately reflects on Android app in real-time).
- [ ] Security audit: College email OTP verification enforcement and rate limiting.
- [ ] Prepare live multi-device demo (laptop screen showing Web client side-by-side with Android phone app).

---

## 4. Local Development & Run Commands

### A. Web Client (Laptop)
```bash
cd client
npm install
npm run dev
# Running on http://localhost:5173
```

### B. Backend Server
```bash
cd server
npm install
npm run dev
# Running on http://localhost:5000 (API & Socket.io)

# Run automated integration & race-condition test suite:
node test-api.js
```

### C. Android Mobile App (Expo — No Android Studio Required)
```bash
cd app
npx create-expo-app@latest ./ --template blank
npm install socket.io-client @react-navigation/native @react-navigation/bottom-tabs expo-secure-store lucide-react-native
npx expo start
# Scan QR code using Expo Go app on your Android phone!
```

---

## 5. Cloud Hosting & Deployment Guide

### 1. Render Database Setup (Render Managed PostgreSQL)
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **PostgreSQL**.
3. Name: `campsync-db`, Database: `campsync_db`, User: `campsync_user`.
4. Region: Choose closest region (e.g., Singapore or Frankfurt).
5. Click **Create Database**.
6. Copy the **Internal Database URL** (e.g., `postgres://campsync_user:xxx@dpg-xxx-a:5432/campsync_db`).

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
