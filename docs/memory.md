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
  1. **CampusAuth**: College email OTP verification (`@college.edu`), JWT issuance, 60s cooldown, 5-attempt brute-force protection.
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
| 2026-08-30 | Concurrency | Adopted single atomic guarded SQL updates for Bidding, Ride booking, and Task claims. | Eliminates check-then-act race conditions; ensures atomic seat decrement, task claiming, and highest bid consistency under high concurrent student load. |
| 2026-08-30 | Modules | Expanded backend from 4 to 7 core pillars with dedicated Skill Sharing (`/api/skills`) and Micro-tasks (`/api/tasks`). | Directly addresses all student problem statement items (errands, peer skill tutoring, second-hand marketplace). |
| 2026-08-30 | Security & Auth | Added IP rate-limiting, 60s email cooldown, and 5-attempt lockout on OTP verification. | Prevents OTP brute-forcing and email spam attacks. |
| 2026-08-30 | Token Storage | Adopted `expo-secure-store` exclusively for JWT on Mobile, `localStorage` on Web. | Provides secure hardware-backed keychain storage on Android without mixing AsyncStorage. |
| 2026-08-30 | CORS Policy | Configured multi-origin CORS supporting Vite, React, Expo, and production URLs. | Allows seamless local dev and production cross-origin communication between web and mobile apps. |
| 2026-08-30 | Hosting Topology | Server on **Render.com (Web Service)**, Database on **Render Managed PostgreSQL**, Web on **Vercel**, Android App on **Expo EAS**. | Colocating the Node.js server and PostgreSQL database on Render ensures zero network latency and private internal networking. Vercel provides fast global CDN for the web app. |

---

## 3. Current Project State

- **Phase**: Phase 3 — Full Integration (Frontend + Mobile + Backend)
- **Key Milestones Achieved**:
  - [x] Workspace structure established (`client/`, `server/`, `docs/`, `app/`).
  - [x] Documentation suite updated (`memory.md`, `design.md`, `architecture.md`, `implementation.md`).
  - [x] All 7 backend modules implemented with controllers, routes, and socket broadcasters.
  - [x] Dual-mode Database Adapter (`dbAdapter.js`) + Render PostgreSQL schema (`schema.sql`).
  - [x] Automated test suite (`test-api.js`) passing 33/33 tests with 0 failures.
  - [x] Web Client 2-theme design system, scroll physics, contexts, and modals.
  - [x] Mobile App (React Native/Expo) Milestone 1 complete with SecureStore auth & CampusConnect.
