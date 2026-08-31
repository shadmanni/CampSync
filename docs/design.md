# CampusSync — Design System & UI Specification

> Owned by Member 2 (UI/UX) with Members 3 & 4 (Web Frontend). This document
> describes the system **as implemented** in `client/src/styles/`. If a value
> here and a value in `tokens.css` disagree, `tokens.css` wins — update this doc.

---

## 1. Direction: "Campus Pop"

A bright, high-contrast, slightly playful identity that reads as *built by
students, for students* — and a matching dark mode for people who prefer it.

Three rules define the look:

1. **Ink edges, not shadows.** Cards and buttons are drawn with a 2px ink border
   and a hard offset block beneath them, like a sticker on paper. Blur-based
   drop shadows are reserved for floating chrome.
2. **One accent per module.** Colour carries navigation meaning; it is not
   decoration. Wrapping any subtree in `.accent-violet` / `.accent-coral` /
   `.accent-mint` / `.accent-sky` recolours every button, ring and badge inside
   it without a single prop being passed down.
3. **Numbers are typographic events.** Prices, seat counts and timers are set in
   a monospace face with tabular figures, and they *animate* to new values, so a
   change arriving from another device is legible as something that happened.

### Why light is the default

Classroom projectors and shared displays wash out dark UIs badly. The default is
light so the demo survives whatever room it lands in; dark mode is one tap away
in the navbar and persists per browser.

---

## 2. Token layer (`client/src/styles/tokens.css`)

Both themes are the **same declarations resolving different variables**. No
component file contains a theme conditional. Dark mode is applied by setting
`data-theme="dark"` on `<html>`, which an inline script in `index.html` does
before first paint so there is no flash.

### Accents

| Token | Light | Dark | Module |
|---|---|---|---|
| `--violet` | `#6E56F8` | `#8B78FF` | CampusConnect |
| `--coral` | `#FF6B35` | `#FF854F` | CampusBid |
| `--amber` | `#F59E0B` | `#FBBF24` | CampusSkills |
| `--emerald` | `#10B981` | `#34D399` | CampusTasks |
| `--mint` | `#12B886` | `#2BD9A5` | CampusRide & Events |
| `--sky` | `#0EA5E9` | `#38BDF8` | CampusNearby |
| `--sun` | `#FFB703` | `#FFC53D` | warnings, scarcity |
| `--rose` | `#F43F5E` | `#FB7185` | errors, outbid |

`--accent` / `--accent-soft` / `--on-accent` are the indirection layer. **Always
style against `--accent`, never a named hue**, so a component works in any
module scope.

### Mobile Touch & Responsive Guidelines
- `.scroll-x`: Used on category pills and segmented bars for smooth horizontal scrolling without layout breaking.
- `.card-pop`: Solid 2px ink borders, hard offset drop shadows (`--shadow-hard`), and zero top colored lines for a unified, clean aesthetic across every page.
- `Modal`: Sits at `z-index: 2000` as a bottom drawer on mobile with safe-area bottom padding.
- `MobileTabBar`: Fixed thumb-reachable bottom bar at `z-index: 90`.

### Surfaces & ink

| Token | Light | Dark |
|---|---|---|
| `--canvas` | `#FDFBF5` | `#0C0B10` |
| `--surface` | `#FFFFFF` | `#17151F` |
| `--surface-2` | `#FBF8F1` | `#1E1B29` |
| `--surface-inset` | `#F3EFE4` | `#100E17` |
| `--ink` | `#17150F` | `#F6F4FF` |
| `--ink-soft` | `#58524A` | `#A7A0BE` |
| `--ink-faint` | `#8E877A` | `#6E6788` |
| `--line` | `rgba(23,21,15,.12)` | `rgba(255,255,255,.09)` |
| `--line-strong` | `rgba(23,21,15,.88)` | `rgba(255,255,255,.24)` |

### Elevation — the one place the themes differ in kind

`--shadow-hard` is a **4px offset ink block** in light and collapses to a
**rim + soft glow** in dark. Same token, same class, physically different light.
This is why `.card-pop` needs no theme branch.

### Type

| Role | Family | Notes |
|---|---|---|
| Display | Bricolage Grotesque | Headings, brand, big numerals |
| Body | Plus Jakarta Sans | All prose and UI text |
| Numeric | JetBrains Mono | Prices, seats, timers, codes, promo codes |

Scale is fluid (`clamp()`): `--t-hero`, `--t-display`, `--t-title`,
`--t-heading`, `--t-body`, `--t-small`, `--t-micro`.

---

## 3. Motion system (`client/src/lib/motion.js`)

Every animation pulls its spring from one shared vocabulary. That is what makes
four independently-built modules feel like one object.

| Spring | Use |
|---|---|
| `spring.snappy` | Anything the user directly caused |
| `spring.soft` | Things that move on their own |
| `spring.bouncy` | Small celebratory pops (toggles, copy confirmation) |
| `spring.layout` | Shared `layoutId` transitions — over-damped, never overshoots |

**Scroll physics** — `useSmoothScroll()` in `lib/hooks.js` runs Lenis on a rAF
loop. It drives real `window.scrollY`, so `useScroll`, IntersectionObserver and
anchors all keep working. Overlays call `lockScroll(true)` to freeze it;
scrollable regions inside a dialog carry `data-lenis-prevent`.

**Signature interactions**

- Sticky scrollytelling on the landing page: scroll progress *selects* which
  module panel is on screen rather than just moving past it.
- Hero parallax at three depths (copy, sub-copy, cards).
- `layoutId` navigation indicator: one element physically travels between tabs.
- Magnetic buttons (`useMagnetic`) and cursor tilt on cards (`useTilt`).
- `useCountUp` rolls every live number; `confetti.js` fires only on a real
  successful bid.

**Reduced motion is honoured throughout.** Lenis does not initialise, magnetic
and tilt hooks no-op, confetti is skipped, and CSS animations collapse.

---

## 4. Component classes (`client/src/styles/components.css`)

| Class | Purpose |
|---|---|
| `.card` | Standard content surface, soft shadow |
| `.card-pop` | Signature slab — ink edge + offset block. Add `.is-interactive` for press physics |
| `.card-glass` | Blurred chrome (navbar, mobile tab bar) |
| `.card-inset` | Recessed panel — price blocks, comment bubbles |
| `.card-topline` | Accent hairline along the top edge |
| `.btn` + `-primary` / `-ink` / `-ghost` / `-soft`, `-sm` / `-lg` / `-icon` / `-block` | Buttons |
| `.chip` | Filter pills (`data-active`) |
| `.badge`, `.badge-outline` | Status and metadata |
| `.dot-live` | Pulsing realtime indicator |
| `.input`, `.field`, `.field-label`, `.switch` | Forms |
| `.skel` | Shimmer skeleton, shaped like the real card |
| `.meter`, `.marquee`, `.empty`, `.rule`, `.spin` | Utilities |

---

## 5. Platform form factors

### Web (laptop / desktop)
Sticky glass navbar with module pills and the theme toggle; `1180px` max shell;
`auto-fill minmax(330px, 1fr)` card grid; hover elevation and cursor tilt;
number keys `1`–`4` jump between modules during a demo; `Esc` closes overlays.

### Mobile (< 860px, and the Android app)
The desktop pills are replaced by a fixed bottom tab bar with 48px minimum tap
targets. **Modals become bottom sheets you can throw downward to dismiss** — the
`Modal` component switches behaviour on its own via `useIsMobile()`. Safe-area
insets are respected on every fixed element.

The Android app must map its `StyleSheet` values 1:1 to the hex values in the
tables above.

---

## 6. Rules for anyone adding UI

1. Never hard-code a colour. If you need one that does not exist, add a token.
2. Style against `--accent`, not a named hue, unless the colour carries fixed
   semantics (`--rose` for errors, `--sun` for scarcity).
3. Every list needs three states: skeleton, empty, and error. `SkeletonGrid` and
   `EmptyState` exist in `components/ui.jsx` — use them.
4. Every mutation is optimistic **and rolls back on failure**. Never leave a lie
   on screen.
5. Never invent a spring inline. Import one from `lib/motion.js`.
6. If it moves, check it under `prefers-reduced-motion: reduce`.
