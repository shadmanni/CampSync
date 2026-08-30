# CampusSync — Memory & Project Log

> **Note**: This document must be read and updated continuously as project decisions, progress, and architectural shifts occur.

---

## 1. Project Identity & Overview

- **Project Name**: CampusSync ("One app for everything that happens on campus")
- **Course Context**: CPI (Creativity, Problem Solving & Innovation) | Team of 8
- **Platform Strategy**: 
  - **Part 1 — Website**: Optimized for Laptop / Desktop screens with rich responsive dashboards (Hosted on Vercel).
  - **Part 2 — Android Mobile App**: Optimized for Android mobile devices on-the-go with bottom navigation and quick touch actions (Built via Expo / Expo EAS, zero Android Studio required).
  - **Single Shared Backend & Database**: Both clients consume the identical Node.js + Express REST API, **Render Managed PostgreSQL database**, and real-time Socket.io events.
- **Core Modules**:
  1. **CampusConnect**: Verified community discussion feed, topic/department filtering, anonymous/named post options, comment threads, upvotes.
  2. **CampusBid**: Student marketplace with live item listings, concurrency-guarded atomic bid placement, highest bid validation, and real-time socket updates.
  3. **CampusRide & Events**: Carpool sharing with overbooking-safe atomic seat decrements, event creation, and campus discovery.
  4. **CampusNearby**: Local discovery feed featuring events, student discounts, partner deals, and community posts.

---

## 2. Team Roster & Role Assignments

| Role ID | Owner Title | Key Focus Area & Deliverables |
|---|---|---|
| **Member 1** | Project/Product Lead | Requirements, cross-platform architecture, feature prioritization, tickets, daily standups. |
| **Member 2** | UI/UX Designer | User flows for Laptop (Web) & Mobile (Android), unified design tokens in `docs/design.md`. |
| **Member 3** | Web Frontend Lead | Web client (`client/`) implementation for Laptop/Desktop — **CampusConnect** & **CampusRide**. |
| **Member 4** | Web Frontend Dev | Web client (`client/`) implementation for Laptop/Desktop — **CampusBid** & **CampusNearby**. |
| **Member 5** | Backend Developer 1 | College email + OTP campus verification, JWT auth, rate limiting, **CampusConnect** & **CampusRide & Events** APIs. |
| **Member 6** | Backend Developer 2 | Database schema design, PostgreSQL queries & migrations, **CampusBid** atomic bidding logic & **CampusNearby** APIs. |
| **Member 7** | Mobile & DevOps | Android App (`app/` React Native/Expo), cloud deployment (**Render Server + Render PostgreSQL + Vercel + Expo EAS**). |
| **Member 8** | QA, Security & Docs | Cross-platform sync testing (Web vs Android), auth security audit, test suite maintenance (`test-api.js`). |

---

## 3. Current Project State

- **Phase**: Phase 2 — Core Module Development & Integration
- **Active Sprint Focus**: Mobile App Milestone 1 Completed; proceeding to Milestone 2 (CampusBid Marketplace).
- **Key Milestones Achieved**:
  - [x] Workspace structure established (`client/`, `server/`, `docs/`, `app/`).
  - [x] Documentation suite created and maintained (`memory.md`, `design.md`, `architecture.md`, `implementation.md`).
  - [x] Modular MVC backend server implemented with Node.js, Express, and Socket.io.
  - [x] Render PostgreSQL adapter (`dbAdapter.js`) + DDL schema (`schema.sql`) implemented with atomic concurrency guards for bids and carpools.
  - [x] Auth rate-limiting, cooldown, and lockout protection implemented.
  - [x] Automated test suite (`test-api.js`) passing 22/22 tests with 0 failures.
  - [x] **Mobile App Milestone 1 Completed**:
    - Scaffolding with React Native & Expo (zero Android Studio).
    - Dark glassmorphic design system (`theme.js`) matching `docs/design.md` exactly.
    - Modular Axios client with `expo-secure-store` Bearer token interceptor.
    - Complete College Email OTP Verification flow (`EmailVerify`, `OtpVerify`, `VerifiedDone`).
    - CampusConnect Feed, Post Details, Comments, Optimistic Upvotes, and real-time Socket.io sync.
    - All code pushed to GitHub repository `https://github.com/shadmanni/CampSync.git` on branch `abhijeet`.

---

## 4. Decision Log

| Date | Category | Decision Summary | Rationale |
|---|---|---|---|
| 2026-08-30 | Mobile Architecture | Phased vertical delivery (Milestone 1: Foundation + Auth + CampusConnect; Milestone 2: Bid; Milestone 3: Ride; Milestone 4: Nearby). | Ensures working end-to-end user journeys tested against the backend at each stage. |
| 2026-08-30 | Token Storage | Adopted `expo-secure-store` exclusively for JWT and session persistence. | Provides secure hardware-backed keychain storage on Android without mixing AsyncStorage. |
| 2026-08-30 | Design Consistency | Enforced exact `docs/design.md` tokens (`#0b0f19`, `#6366f1`, `#06b6d4`, `#10b981`) across mobile UI. | Maintains brand cohesion with the web dashboard. |
| 2026-08-30 | Concurrency | Adopted single atomic guarded SQL updates for Bidding & Ride booking. | Eliminates check-then-act race conditions; ensures atomic seat decrement and highest bid consistency. |
| 2026-08-30 | Hosting Topology | Server on **Render.com (Web Service)**, Database on **Render Managed PostgreSQL**, Web on **Vercel**, Android App on **Expo EAS**. | Colocating the Node.js server and PostgreSQL database on Render ensures zero network latency and private internal networking. Vercel provides fast global CDN for the web app. |

---

## 5. Next Immediate Actions

1. Proceed to **Milestone 2**: Implement **CampusBid Marketplace** on Mobile (live auction cards, image galleries, bidding increment sheets, and atomic bid placement).
2. Proceed to **Milestone 3**: Implement **CampusRide & Events** on Mobile (carpool routes, atomic seat reservations, and event RSVPs).
3. Proceed to **Milestone 4**: Implement **CampusNearby** on Mobile (partner discounts and coupon copy).
