# CampusSync 🎓⚡
> **One unified application for everything that happens on campus.**
> Built for students, by students. High-contrast Neo-Brutalist Pop design, real-time WebSocket sync, and multi-device parity across Web and Mobile.

---

## 📌 Overview

CampusSync eliminates fragmented college WhatsApp groups, Discord servers, and messy notice boards by consolidating campus life into six core real-time modules:

1. **💬 CampusConnect**: College-verified social feed with anonymous confessions, academic discussions, lost & found notices, and live upvoting.
2. **🔨 CampusBid**: Real-time student marketplace and live auctions with instant countdowns, outbid notifications, and anti-sniping protection.
3. **✨ CampusSkills**: 1-on-1 peer tutoring and skill exchange directory with categorized offering/requesting profiles.
4. **📦 CampusTasks**: Micro-tasks and campus gigs (printout runs, luggage shifts, parcel pickups) with upfront cash rewards and atomic runner assignment.
5. **🚗 CampusRide & Events**: Cab-sharing fare splitters (airport/railway station runs) with live seat countdowns, plus campus club event calendars.
6. **🏷️ CampusNearby**: Curated student discounts and promo codes from verified local campus partners.

---

## 🏗️ Architecture & Technology Stack

```
                     ┌──────────────────────────────────────┐
                     │         CAMPUSSYNC ECOSYSTEM         │
                     └──────────────────┬───────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
┌──────────────────────────────┐                          ┌──────────────────────────────┐
│       WEB APPLICATION        │                          │          MOBILE APP          │
│ React 18 + Vite + CSS Tokens │                          │ React Native + Expo (SDK 51) │
│   Desktop & Mobile Browser   │                          │       iOS / Android / Web    │
└──────────────┬───────────────┘                          └──────────────┬───────────────┘
               │                                                         │
               └────────────────────────────┬────────────────────────────┘
                                            │ REST API & WebSocket (Socket.io)
                                            ▼
                           ┌──────────────────────────────────┐
                           │      CENTRAL BACKEND ENGINE      │
                           │   Node.js + Express + Socket.io  │
                           │     JWT College-Email OTP Auth   │
                           │    Atomic Concurrency Safety     │
                           └────────────────┬─────────────────┘
                                            │
                                            ▼
                           ┌──────────────────────────────────┐
                           │      DATA STORAGE LAYER          │
                           │     PostgreSQL / Render DB       │
                           │  (Zero-config in-memory fallback)│
                           └──────────────────────────────────┘
```

### Stack Components:
- **Web Client**: React 18, Vite, Framer Motion, Lucide Icons, Custom CSS Tokens (Zero Tailwind).
- **Mobile Client**: React Native, Expo, React Navigation (Bottom Tabs + Native Stack), Lucide React Native.
- **Backend API**: Node.js, Express, Socket.io, JSON Web Tokens (JWT), PostgreSQL (`pg`), Async Mutex / Atomic Transaction Guards.
- **Design System**: Neo-Brutalist "Campus Pop" with 2px ink borders, hard offset shadows, fluid typography, light/dark themes, and horizontal touch-scroll filters.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- `npm` (v9 or higher)

---

### 2. Start the Backend API Server
```bash
cd server
npm install
npm start
```
> Server runs on `http://localhost:5000` with WebSocket support.

---

### 3. Start the Web Client
```bash
cd client
npm install
npm run dev
```
> Web client runs on `http://localhost:3000` (and on LAN network `http://<your-ip>:3000`).

---

### 4. Start the Mobile App (Expo)
```bash
cd app
npm install
npx expo start --web
```
> Mobile preview runs on `http://localhost:8081`. To test on physical devices, use Expo Go on your local network.

---

## 🔐 Prototype Authentication Credentials

CampusSync uses college email domain verification (`@college.edu`, `@campus.ac.in`, `@university.edu`).

- **Test Email**: `alex.tech@college.edu` (or any `@*.edu` address)
- **Demo Verification OTP**: `123456`

---

## ⚡ Real-Time WebSocket Events

| Event Name | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `connect:new_post` | Server ➔ Clients | `{ post }` | Broadcasts a newly submitted discussion thread. |
| `connect:upvoted` | Server ➔ Clients | `{ postId, upvotes }` | Live upvote counter sync. |
| `bid:new_highest` | Server ➔ Clients | `{ itemId, currentBid, ... }` | Broadcasts new winning bid in real time. |
| `task:created` | Server ➔ Clients | `{ task }` | Notifies available runners of a new gig. |
| `task:assigned` | Server ➔ Clients | `{ task }` | Broadcasts atomic runner claim. |
| `task:completed` | Server ➔ Clients | `{ task }` | Marks task as completed and settles reward. |
| `skill:created` | Server ➔ Clients | `{ skill }` | Notifies students of a new tutoring listing. |
| `ride:seat_updated`| Server ➔ Clients | `{ rideId, availableSeats }` | Real-time carpool seat count decrement/increment. |

---

## 🧪 Automated Testing & QA

Run the full 7-pillar integration and concurrency test suite:
```bash
cd server
node test-api.js
```
> **33 / 33 Integration & Concurrency Tests Passing (100% Success Rate)**.

---

## 📱 Mobile Responsiveness Features

- **Horizontal Swipe Navigation (`.scroll-x`)**: Filter pills and segmented controls use native momentum touch-scrolling.
- **Single-Column Grid Fallback**: Responsive cards adapt automatically on small viewports with no horizontal overflow.
- **Thumb-Reachable Bottom Tab Bar (`MobileTabBar`)**: Fixed bottom glassmorphism bar with safe-area spacing and active indicator animations.
- **Accessible Touch Targets**: Minimum 44–48px interactive click areas across all buttons and inputs.
- **Z-Index Layering**: Modal drawers and overlays sit cleanly at `z-index: 2000` above bottom bars with blurred backdrops.

---

## 👥 Contributors (CPI Team of 8)
- **Member 1**: System Architecture & DevOps
- **Member 2**: UI/UX & Design Tokens
- **Member 3 & 4**: Web Frontend (React + Vite)
- **Member 5 & 6**: Backend & Database (Node.js + PostgreSQL)
- **Member 7**: Mobile Client (React Native + Expo)
- **Member 8**: QA Testing & Validation
