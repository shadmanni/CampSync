/**
 * CampusSync Theme Tokens
 * Faithfully matches Stitch UI Design System (DESIGN.md).
 */

export const colors = {
  // Backgrounds & Canvas
  bgPrimary: "#F9F9FB",         // Soft editorial canvas
  bgSurface: "#FFFFFF",         // Pure White floating cards
  bgSurfaceSolid: "#FFFFFF",
  bgGlass: "#FFFFFF",
  bgSubtle: "#F4F2FD",
  bgDim: "#EDE8FA",            // Soft indigo tint

  // Brand Primaries (Deep Indigo)
  primary: "#2D1B69",           // Deep Indigo for primary actions/headers
  primaryHeader: "#180052",     // Darker Indigo for hero banners
  primaryLight: "#4A3A87",
  primaryTint: "rgba(45, 27, 105, 0.08)",

  // Brand Accents (Warm Orange & Functionals)
  secondary: "#FF6F3C",         // Warm Orange primary action CTA
  accentOrange: "#FF6F3C",
  accentOrangeLight: "#FFF0EB",
  accentCyan: "#06B6D4",
  accentEmerald: "#10B981",
  accentEmeraldLight: "rgba(16, 185, 129, 0.12)",
  accentAmber: "#F59E0B",
  accentRose: "#BA1A1A",
  accentRoseLight: "#FFDAD6",

  // Borders & Outlines
  borderGlass: "rgba(0, 0, 0, 0.08)",
  borderSubtle: "rgba(0, 0, 0, 0.04)",
  borderHighlight: "rgba(45, 27, 105, 0.25)",
  outline: "#CAC4D2",

  // Typography
  textPrimary: "#1A1A1A",
  textMain: "#1A1C1D",
  textMuted: "#484550",
  textSubtle: "#797582",
  textInverse: "#FFFFFF"
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  containerPadding: 20
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700", color: colors.textMain, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "700", color: colors.textMain, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600", color: colors.textMain },
  bodyLg: { fontSize: 16, fontWeight: "400", color: colors.textMain, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: "400", color: colors.textMuted, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: "400", color: colors.textSubtle, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMain },
  badge: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }
};
