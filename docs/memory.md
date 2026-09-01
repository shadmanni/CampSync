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
- **Core 7 Pillars (6 Dashboard Tabs + Auth)**:
  1. **CampusAuth**: College email OTP verification (`@learner.manipal.edu`, `@manipal.edu`), JWT issuance, 60s cooldown (2s dev), 5-attempt brute-force protection.
  2. **CampusConnect**: Verified community discussion feed, topic/department filtering, anonymous/named post options, comment threads, upvotes & downvotes.
  3. **CampusBid & Marketplace**: Student second-hand store (books, electronics, furniture) + live auction bidding engine with atomic concurrency guard.
  4. **CampusSkills**: Skill-sharing network for 1-on-1 tutoring, coding, design, music, and peer exchange.
  5. **CampusTasks**: Micro-task marketplace for campus errands (printouts, moving, food/parcel delivery) with atomic task claim.
  6. **CampusRide & Events**: Carpool sharing with overbooking-safe atomic seat decrements and campus event discovery.
  7. **CampusNearby**: Local discovery feed featuring student discounts, partner deals, and promo codes.

---

## 2. Decision Log

| Date | Category | Decision Summary | Rationale |
|---|---|---|---|
| 2026-09-01 | Database & Cloud | Added automated Supabase PostgreSQL setup script (`setup-supabase.js`) and dynamic remote SSL connection detection in `dbAdapter.js`. | Allows immediate provisioning of all 11 tables and indices on Supabase pooler/direct connection strings with auto password-bracket sanitization. |
| 2026-09-01 | Monorepo DX | Added root `package.json` with `concurrently` orchestration (`npm run dev`, `npm run db:setup`, etc.). | Enables single-command booting of both frontend and backend dev servers from workspace root. |
| 2026-09-01 | Authentication | Refined campus email validation strictly to official Manipal university domains (`@learner.manipal.edu`, `@manipal.edu`). | Enforces genuine student onboarding in alignment with the target campus deployment. |
| 2026-09-01 | Dev Experience | Added localhost IP rate-limit bypass and reduced development OTP cooldown to 2 seconds (`process.env.NODE_ENV !== 'production'`). | Speeds up rapid local testing and automated CI execution without throttling developers. |
| 2026-08-30 | Concurrency | Adopted single atomic guarded SQL updates for Bidding, Ride booking, and Task claims. | Eliminates check-then-act race conditions; ensures atomic seat decrement, task claiming, and highest bid consistency under high concurrent student load. |
| 2026-08-30 | Modules | Expanded backend from 4 to 7 core pillars with dedicated Skill Sharing (`/api/skills`) and Micro-tasks (`/api/tasks`). | Directly addresses all student problem statement items (errands, peer skill tutoring, second-hand marketplace). |
| 2026-08-30 | Security & Auth | Added IP rate-limiting, 60s email cooldown, and 5-attempt lockout on OTP verification. | Prevents OTP brute-forcing and email spam attacks. |
| 2026-08-30 | Token Storage | Adopted `expo-secure-store` exclusively for JWT on Mobile, `localStorage` on Web. | Provides secure hardware-backed keychain storage on Android without mixing AsyncStorage. |
| 2026-08-30 | CORS Policy | Configured multi-origin CORS supporting Vite, React, Expo, and production URLs. | Allows seamless local dev and production cross-origin communication between web and mobile apps. |
| 2026-08-30 | Hosting Topology | Server on **Render.com (Web Service)**, Database on **Supabase / Render Managed PostgreSQL**, Web on **Vercel**, Android App on **Expo EAS**. | Colocating the Node.js server with cloud PostgreSQL ensures high reliability, persistent storage, and zero-maintenance automated provisioning. |

---

## 3. Current Project State

- **Phase**: Phase 3 — Full Integration (Frontend + Mobile + Backend + Cloud DB)
- **Key Milestones Achieved**:
  - [x] Workspace structure established (`client/`, `server/`, `docs/`, `app/`) with root monorepo scripts.
  - [x] Documentation suite updated (`memory.md`, `design.md`, `architecture.md`, `implementation.md`).
  - [x] All 7 backend modules implemented with controllers, routes, and socket broadcasters.
  - [x] Dual-mode Database Adapter (`dbAdapter.js`) + Supabase/Render PostgreSQL automated migration script (`setup-supabase.js`).
  - [x] Automated test suite (`test-api.js`) passing 33/33 tests with 0 failures under Manipal auth domain.
  - [x] Web Client 2-theme design system, scroll physics, contexts, and modals.
  - [x] Mobile App (React Native/Expo) Milestone 1 complete with SecureStore auth & CampusConnect.
