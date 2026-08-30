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
  1. **CampusConnect**: Verified community discussion feed, topic/department filtering, anonymous/named post options, comment threads, upvotes & downvotes.
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
- **Active Sprint Focus**: Frontend client integration and mobile app baseline.
- **Key Milestones Achieved**:
  - [x] Workspace structure established (`client/`, `server/`, `docs/`).
  - [x] Complete documentation suite created (`memory.md`, `design.md`, `architecture.md`, `implementation.md`).
  - [x] Modular MVC backend server implemented with Node.js, Express, and Socket.io.
  - [x] Render PostgreSQL adapter (`dbAdapter.js`) + DDL schema (`schema.sql`) implemented with atomic concurrency guards for bids and carpools.
  - [x] Auth rate-limiting, cooldown, and lockout protection implemented.
  - [x] Automated test suite (`test-api.js`) passing 22/22 tests with 0 failures.
  - [x] Code pushed to GitHub repository `https://github.com/shadmanni/CampSync.git` on branch `abhijeet`.

---

## 4. Decision Log

| Date | Category | Decision Summary | Rationale |
|---|---|---|---|
| 2026-08-30 | Concurrency | Adopted single atomic guarded SQL updates for Bidding & Ride booking. | Eliminates check-then-act race conditions; ensures atomic seat decrement and highest bid consistency under high concurrent student load. |
| 2026-08-30 | Security & Auth | Added IP rate-limiting, 60s email cooldown, and 5-attempt lockout on OTP verification. | Prevents OTP brute-forcing and email spam attacks. |
| 2026-08-30 | CORS Policy | Configured multi-origin CORS supporting Vite, React, Expo, and production URLs. | Allows seamless local dev and production cross-origin communication between web and mobile apps. |
| 2026-08-30 | Product Strategy | Split client delivery into Web (Laptop) and Android App (Mobile) with single shared backend & DB. | Caters to how students access campus utilities (laptops in rooms, mobile phones on the move). |
| 2026-08-30 | Hosting Topology | Server on **Render.com (Web Service)**, Database on **Render Managed PostgreSQL**, Web on **Vercel**, Android App on **Expo EAS**. | Colocating the Node.js server and PostgreSQL database on Render ensures zero network latency and private internal networking. Vercel provides fast global CDN for the web app. |
| 2026-08-30 | Mobile Tooling | Adopted Expo Go and Expo EAS Cloud Build (No Android Studio). | Enables rapid multi-member testing on real phones via QR code and cloud APK generation without heavy SDK installs. |

---

## 5. Next Immediate Actions

1. Connect the Web client (`client/`) to the modular backend API and Socket.io endpoints.
2. Scaffold the mobile app (`app/`) with React Native / Expo.
3. Test end-to-end multi-device sync between Web and Mobile clients.
