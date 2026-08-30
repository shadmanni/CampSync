# CampusSync — Design System & UI Specifications

> **Note**: Owned by Member 2 (UI/UX Designer). Used by Web Frontend Developers (Member 3 & 4) and Mobile App Developers for visual consistency across Web & Android.

---

## 1. Visual Design Philosophy & Aesthetics

CampusSync features a modern, high-contrast, glassmorphic UI tailored for vibrant campus engagement. The visual identity remains strictly unified between the **Web (Laptop)** and **Android Mobile App**:
- **Dark Mode First with Vibrant Accent Pops**: Sleek obsidian canvas (`#0b0f19`) paired with neon violet (`#6366f1`) and emerald cyan (`#06b6d4`) accents.
- **Glassmorphism & Layering**: Translucent card backgrounds (`rgba(30, 41, 59, 0.7)`), subtle backdrop blurs (`12px`), and delicate 1px border highlights (`rgba(255, 255, 255, 0.1)`).
- **Typography & Readability**: Primary font family: **Inter** or **Outfit** via Google Fonts. Clean visual hierarchy, high-contrast text, clear badge labels.
- **Dynamic Micro-Interactions**: Soft hover elevations (web), haptic-like press feedback (app), glowing ring state indicators, and smooth state transitions.

---

## 2. Design Tokens (Shared Across Web & Mobile)

```css
:root {
  /* Color Palette */
  --bg-primary: #0b0f19;
  --bg-surface: rgba(17, 24, 39, 0.8);
  --bg-glass: rgba(30, 41, 59, 0.65);
  --border-glass: rgba(255, 255, 255, 0.1);
  --border-highlight: rgba(99, 102, 241, 0.4);

  /* Primary & Accent Colors */
  --primary-500: #6366f1;
  --primary-600: #4f46e5;
  --accent-cyan: #06b6d4;
  --accent-emerald: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;

  /* Text Colors */
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --text-subtle: #64748b;

  /* Effects */
  --backdrop-blur: blur(14px);
  --radius-lg: 16px;
  --radius-md: 10px;
  --radius-sm: 6px;
  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.25);
}
```

---

## 3. Platform-Specific Form Factor Guidelines

### A. Web Application (Target: Laptop / Desktop)
- **Navigation**: Top sticky glass navbar with active module pills, live search bar, user status pill, and notification drawer.
- **Grid Layout**: Multi-column responsive layout (2-column or 3-column masonry feed on large viewports `1024px+`).
- **Interactions**: Hover elevation states, keyboard shortcuts (`/` for search, `Esc` to close modals), desktop modal dialogs.
- **Data Density**: Higher density tables/lists with inline action buttons.

### B. Android App (Target: Mobile)
- **Navigation**: Fixed bottom navigation bar (Home/Connect, Bid, Ride, Nearby, Profile) + top header with notification bell.
- **Layout**: Single-column vertical scroll with thumb-reachable touch targets (minimum `48px` tap targets).
- **Interactions**: Bottom action sheets for bidding/joining rides, pull-to-refresh feeds, floating action buttons (FAB) for "New Post" or "Post Ride".
- **Real-Time Indicators**: Floating status banners / snackbars for live updates (`"New highest bid: ₹1,200"`).

---

## 4. UI Component Specs by Module

### A. CampusConnect (Community Discussion)
- **Feed Card**: Post author (or Anonymous badge), timestamp, hostel/department pill tag, main content body, upvote/downvote action count, comment counter.
- **Post Creator**: 
  - *Web*: Centered glass modal with markdown toolbar and category selector.
  - *Mobile*: Bottom slide-up drawer with quick-tap category pills.
- **Filter Bar**: Horizontal pill filters ("All Topics", "Hostel A", "CS Dept", "Events").

### B. CampusBid (Student Marketplace)
- **Item Listing Card**: Image container with badge ("Active", "Closing Soon"), title, starting price vs. current highest bid display, bid count, "Place Bid" action button.
- **Bidding Drawer / Modal**: Real-time highest bidder notice, fast increment buttons (+₹50, +₹100, +₹500), manual custom bid input, timer countdown.
- **Status Badges**:
  - `Active`: Emerald green pulse dot.
  - `Sold`: Slate gray filled badge.
  - `Outbid`: Rose red warning alert.

### C. CampusRide & Events (Carpool & Campus Gathering)
- **Ride Card**: Departure point → Destination route arrow, departure time tag, driver verified avatar, price per seat, **Live Seat Counter Pill** (e.g., `2 / 4 seats left`).
- **Join Ride Drawer**: Passenger count picker, instant socket seat update feedback.
- **Event Card**: Banner thumbnail, event title, venue tag, date/time, "I'm Going" RSVP counter button.

### D. CampusNearby (Local Discovery & Partner Deals)
- **Deal / Feed Card**: Partner verification badge ("Official Partner" vs "Student Community"), discount percentage highlight tag (e.g., `20% OFF`), distance badge (`0.5 km away`), coupon code copy button.

---

## 5. Handoff & Consistency Rules

1. **Shared Token Source**: Mobile app styles (`StyleSheet.create`) must map 1:1 to the color hex values defined in `--bg-primary`, `--primary-500`, `--accent-cyan`, etc.
2. **Interactive Feedback**: Always include skeleton loader states, empty search/filter states, and toast notifications for user actions (e.g., "Bid Placed Successfully!").
3. **Cross-Platform Parity**: A feature present on the web dashboard must be seamlessly accessible on the Android mobile app with mobile-optimized UX.
