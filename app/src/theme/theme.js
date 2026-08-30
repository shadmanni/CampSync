/**
 * CampusSync Mobile Theme — "Campus Pop" (Light Mode Only)
 * Faithfully matches client/src/styles/tokens.css
 */

export const colors = {
  // Surfaces & Canvas (Warm Cream & Pure White)
  canvas: "#FDFBF5",
  canvasTint: "#F6F1E4",
  surface: "#FFFFFF",
  surface2: "#FBF8F1",
  surfaceInset: "#F3EFE4",

  // Inks & Text (Deep Charcoal & Accents)
  ink: "#17150F",
  inkSoft: "#58524A",
  inkFaint: "#8E877A",
  inkInvert: "#FDFBF5",

  // Lines & Borders
  line: "rgba(23, 21, 15, 0.12)",
  lineStrong: "rgba(23, 21, 15, 0.92)",
  borderInk: "#17150F",

  // Module Identity Accents (Matches Web Exactly)
  violet: "#6E56F8",
  violetSoft: "#EEEAFF",

  coral: "#FF6B35",
  coralSoft: "#FFEDE5",

  mint: "#12B886",
  mintSoft: "#E1F8F0",

  sky: "#0EA5E9",
  skySoft: "#E2F4FE",

  sun: "#FFB703",
  sunSoft: "#FFF4D9",

  rose: "#F43F5E",
  roseSoft: "#FFE8EC",

  // Functional
  success: "#12B886",
  error: "#F43F5E",
  errorSoft: "#FFE8EC"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
  containerPadding: 16
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999
};

export const shadows = {
  // Neo-pop signature hard offset block shadows
  hard: {
    shadowColor: colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4
  },
  hardSm: {
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2
  },
  hardLg: {
    shadowColor: colors.ink,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6
  }
};

export const typography = {
  hero: { fontSize: 28, fontWeight: "800", color: colors.ink, letterSpacing: -0.8 },
  title: { fontSize: 22, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  heading: { fontSize: 17, fontWeight: "700", color: colors.ink, letterSpacing: -0.3 },
  subheading: { fontSize: 15, fontWeight: "600", color: colors.ink },
  bodyLg: { fontSize: 15, fontWeight: "400", color: colors.ink, lineHeight: 22 },
  body: { fontSize: 13.5, fontWeight: "400", color: colors.inkSoft, lineHeight: 19 },
  bodySm: { fontSize: 12, fontWeight: "500", color: colors.inkFaint, lineHeight: 16 },
  caption: { fontSize: 11, fontWeight: "600", color: colors.inkFaint },
  badge: { fontSize: 11.5, fontWeight: "800", letterSpacing: 0.2 },
  mono: { fontSize: 13, fontWeight: "700" }
};
