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
  1. **CampusConnect**: Verified community discussion feed, topic/department filtering, anonymous/named post options, comment threads.
  2. **CampusBid**: Student marketplace with live item listings, bid placement, current highest bid validation, and listing status management.
  3. **CampusRide & Events**: Carpool sharing with live seat-count tracking, event creation, and campus discovery.
  4. **CampusNearby**: Local discovery feed featuring events, student discounts, partner deals, and community posts.

---

## 2. Team Roster & Role Assignments

| Role ID | Owner Title | Key Focus Area & Deliverables |
|---|---|---|
| **Member 1** | Project/Product Lead | Requirements, cross-platform architecture, feature prioritization, tickets, daily standups. |
| **Member 2** | UI/UX Designer | User flows for Laptop (Web) & Mobile (Android), unified design tokens in `docs/design.md`. |
| **Member 3** | Web Frontend Lead | Web client (`client/`) implementation for Laptop/Desktop — **CampusConnect** & **CampusRide**. |
| **Member 4** | Web Frontend Dev | Web client (`client/`) implementation for Laptop/Desktop — **CampusBid** & **CampusNearby**. |
| **Member 5** | Backend Developer 1 | College email + OTP campus verification, JWT auth, **CampusConnect** & **CampusRide & Events** APIs. |
| **Member 6** | Backend Developer 2 | Database schema design, PostgreSQL queries, **CampusBid** bidding logic (concurrency, validation) & **CampusNearby** APIs. |
| **Member 7** | Mobile & DevOps | Android App (`app/` React Native/Expo), cloud deployment (**Render Server + Render PostgreSQL + Vercel + Expo EAS**). |
| **Member 8** | QA, Security & Docs | Cross-platform sync testing (Web vs Android), auth security audit, documentation suite maintenance. |

---

## 3. Current Project State

- **Phase**: Phase 1 — Initial Design, Architecture & Workspace Setup
- **Active Sprint Focus**: Scaffold modular backend server with Render PostgreSQL database adapter, align REST API contracts, and prepare Expo mobile baseline.
- **Key Milestones Achieved**:
  - [x] Workspace structure established (`client/`, `server/`, `docs/`).
  - [x] Initial codebase pushed to GitHub repo `https://github.com/shadmanni/CampSync.git` on branch `abhijeet`.
  - [x] Documentation suite fully aligned with Render Server + Render Managed PostgreSQL architecture (`memory.md`, `design.md`, `architecture.md`, `implementation.md`).
  - [x] Android app workflow established using React Native + Expo (eliminating Android Studio requirement).

---

## 4. Decision Log

| Date | Category | Decision Summary | Rationale |
|---|---|---|---|
| 2026-08-30 | Product Strategy | Split client delivery into Web (Laptop) and Android App (Mobile) with single shared backend & DB. | Caters to how students actually access campus utilities (laptops in hostels/classes, mobile phones while commuting and attending events). |
| 2026-08-30 | Technology Stack | React + Vite for Web, React Native (Expo) for Android App, Node.js + Express for Backend. | Maximizes code and skill reuse across web and mobile frontend while delivering native mobile performance. |
| 2026-08-30 | Hosting Topology | Server on **Render.com (Web Service)**, Database on **Render Managed PostgreSQL**, Web on **Vercel**, Android App on **Expo EAS**. | Colocating the Node.js server and PostgreSQL database on Render ensures zero network latency and private internal networking. Vercel provides fast global CDN for the web app. |
| 2026-08-30 | Mobile Tooling | Adopted Expo Go and Expo EAS Cloud Build (No Android Studio). | Enables rapid multi-member testing on real phones via QR code and cloud APK generation without heavy SDK installs. |
| 2026-08-30 | Security & Auth | Campus Verification via JWT + College Email OTP. | Ensures campus-only trust layer for marketplace, rides, and discussions across both Web and Android. |
| 2026-08-30 | Real-Time Engine | Socket.io integrated for cross-platform live seat-counts & bid updates. | Instant multi-device sync between web laptop users and Android smartphone users. |

---

## 5. Next Immediate Actions

1. Implement modular backend architecture (`controllers/`, `routes/`, `middleware/`, `sockets/`, `store/dbAdapter.js`).
2. Test all REST and Socket.io endpoints locally.
3. Commit and push backend updates to branch `abhijeet` on GitHub.
