/**
 * CampusSync — Campus Pop Theme Tokens (Mobile)
 * Maps 1:1 with client/src/styles/tokens.css (Light Mode).
 */

export const colors = {
  // Surfaces & Canvas (Warm Cream & Pure White)
  canvas: "#FDFBF5",
  canvasTint: "#F6F1E4",
  surface: "#FFFFFF",
  surface2: "#FBF8F1",
  surfaceInset: "#F3EFE4",

  // Inks & Typography (Rich Espresso / Charcoal)
  ink: "#17150F",
  inkSoft: "#58524A",
  inkFaint: "#8E877A",
  inkInvert: "#FDFBF5",

  // Lines & Borders (1.5px solid ink borders)
  line: "rgba(23, 21, 15, 0.12)",
  lineStrong: "#17150F",
  lineLight: "rgba(23, 21, 15, 0.08)",

  // Module Identity Accents (Campus Pop)
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

  // Default Accent (Violet for App Foundation)
  primary: "#6E56F8",
  primarySoft: "#EEEAFF",
  secondary: "#FF6B35",

  // Functionals
  success: "#12B886",
  warning: "#FFB703",
  danger: "#F43F5E",

  // Aliases for compatibility
  bgPrimary: "#FDFBF5",
  bgSurface: "#FFFFFF",
  textPrimary: "#17150F",
  textMain: "#17150F",
  textMuted: "#58524A",
  textSubtle: "#8E877A",
  borderGlass: "rgba(23, 21, 15, 0.12)"
};

export const shadows = {
  hard: {
    shadowColor: "#17150F",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 4
  },
  hardSm: {
    shadowColor: "#17150F",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 2
  },
  hardLg: {
    shadowColor: "#17150F",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 6
  }
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  full: 999
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  containerPadding: 16
};

export const typography = {
  h1: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: 21, fontWeight: "800", color: colors.ink, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: "700", color: colors.ink },
  bodyLg: { fontSize: 15, fontWeight: "500", color: colors.ink, lineHeight: 22 },
  body: { fontSize: 14, fontWeight: "400", color: colors.inkSoft, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: "500", color: colors.inkFaint, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: "700", color: colors.ink },
  badge: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 }
};
