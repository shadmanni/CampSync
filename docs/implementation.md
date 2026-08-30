# CampusSync — Implementation & Execution Plan

> **Note**: Owned by Member 1 (Lead) and Member 7 (DevOps/Integration). **Rule**: All team members must read and update this document alongside `memory.md`, `design.md`, and `architecture.md` whenever work progresses.

---

## 1. Project Architecture Strategy

CampusSync is engineered as a **dual-platform system with a single shared core**:
1. **Web Client (`client/`)**: Built with React + Vite, customized for laptop/desktop screen real estate and fast multitasking.
2. **Android App (`app/`)**: Built with React Native (Expo), customized for on-the-go mobile usage, touch interactions, and notifications.
3. **Backend Engine (`server/`)**: Centralized Node.js + Express + Socket.io server providing unified REST endpoints and WebSocket events.
4. **Shared Cloud Database**: Single PostgreSQL/Supabase/MongoDB database serving both clients simultaneously.

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
│   ├── app.json                # Expo config & Android permissions
│   └── package.json
└── server/                     # Backend API & WebSocket Engine (Node.js/Express)
    ├── src/
    │   ├── controllers/        # auth, connect, bid, ride, nearby
    │   ├── middleware/         # authMiddleware.js, rateLimiter.js
    │   ├── routes/             # apiRoutes.js
    │   ├── sockets/            # socketHandler.js
    │   ├── store/              # mockDb.js / dbAdapter.js
    │   └── server.js
    ├── package.json
    └── .env.example
```

---

## 3. Execution Phases & Timeline (6-Week Roadmap)

### Phase 1 — Setup & Dual-Platform Architecture (Week 1)
- [x] Create project workspace layout (`client/`, `server/`, `docs/`, `app/`).
- [x] Formulate architecture contracts for shared database and unified REST/Socket APIs.
- [x] Scaffold React + Vite client app (`client/`) with design tokens.
- [x] Scaffold Node.js + Express backend (`server/`) with mock data store & JWT auth.
- [ ] Scaffold React Native / Expo app (`app/`) with matching theme tokens and navigation.

### Phase 2 — Core Module Implementation (Weeks 2–3)
- [ ] **Web Frontend (Members 3 & 4)**: Build CampusConnect, CampusBid, CampusRide, and CampusNearby views for laptop browsers.
- [ ] **Mobile App Team**: Build matching mobile screens with bottom navigation, pull-to-refresh, and slide-up drawers.
- [ ] **Backend Team (Members 5 & 6)**: Implement unified OTP Auth, CampusConnect APIs, CampusBid concurrency logic, CampusRide seat management, and live Socket broadcasts.

### Phase 3 — Integration & Hosting Pipeline (Week 4)
- [ ] **Member 7 (DevOps/Integration)**:
  - Deploy Node.js server on **Railway** / **Render** with WebSocket support enabled.
  - Connect managed **Supabase** / **PostgreSQL** cloud database.
  - Deploy Web Client on **Vercel** with `VITE_API_URL` configured.
  - Configure **Expo EAS** to generate standalone Android APK/AAB build.
- [ ] Connect both Web and Android apps to the live cloud backend URL.

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
```

### C. Android Mobile App (Expo)
```bash
cd app
npx create-expo-app@latest ./ --template blank
npm install socket.io-client @react-navigation/native @react-navigation/bottom-tabs expo-secure-store lucide-react-native
npx expo start --android
```

---

## 5. Cloud Hosting & Deployment Guide

### 1. Hosting Backend Server & WebSockets (Railway / Render)
1. Push repo to GitHub.
2. Link `server/` directory on Railway or Render.
3. Set environment variables:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   DATABASE_URL=postgresql://user:password@host:5432/campussync
   CORS_ORIGIN=https://campussync.vercel.app,http://localhost:5173
   ```
4. Railway/Render automatically provisions an HTTPS/WSS endpoint (e.g. `https://api-campussync.up.railway.app`).

### 2. Hosting Web Application (Vercel)
1. Link `client/` directory on Vercel.
2. Build Settings:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variable:
   - `VITE_API_URL=https://api-campussync.up.railway.app`
4. Deploy.

### 3. Building Android App (Expo EAS)
1. In `app/app.json`, configure Android package name (`com.campussync.app`).
2. Run EAS build to generate APK:
   ```bash
   npm install -g eas-cli
   eas login
   eas build -p android --profile preview
   ```
3. Download and install the resulting `.apk` on Android devices.

---

## 6. Cross-Platform QA & Real-Time Sync Checklist

| Test Scenario | Laptop (Web) Action | Mobile (Android) Action | Expected Result |
|---|---|---|---|
| **Real-Time Bid Sync** | Place a higher bid on Web | View item in Android App | Android screen updates highest bid instantly without refreshing via Socket.io. |
| **Carpool Seat Update** | Join carpool from Android App | View ride list on Web | Available seat counter decrements live on Web dashboard. |
| **Authentication Session** | Login via college email on Web | Login with same credentials on Mobile | Both receive valid JWT tokens and can access protected user features. |
| **Post Creation** | Publish new post on Web | Feed open on Android App | Android feed receives `connect:new_post` socket event and prepends post. |
