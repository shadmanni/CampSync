/**
 * CampusSync Theme Tokens
 * Matches docs/design.md specification exactly.
 */

export const colors = {
  // Backgrounds & Canvas
  bgPrimary: "#0b0f19",
  bgSurface: "rgba(17, 24, 39, 0.8)",
  bgSurfaceSolid: "#111827",
  bgGlass: "rgba(30, 41, 59, 0.65)",
  bgGlassSolid: "#1e293b",
  bgGlassHighlight: "rgba(99, 102, 241, 0.12)",

  // Borders
  borderGlass: "rgba(255, 255, 255, 0.1)",
  borderHighlight: "rgba(99, 102, 241, 0.4)",
  borderSubtle: "rgba(255, 255, 255, 0.06)",

  // Brand & Primary Accents
  primary: "#6366f1",
  primaryDark: "#4f46e5",
  primaryLight: "#818cf8",

  // Function & Status Accents
  accentCyan: "#06b6d4",
  accentEmerald: "#10b981",
  accentAmber: "#f59e0b",
  accentRose: "#f43f5e",

  // Typography
  textMain: "#f8fafc",
  textMuted: "#94a3b8",
  textSubtle: "#64748b",
  textInverse: "#0b0f19"
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
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999
};

export const typography = {
  h1: { fontSize: 28, fontWeight: "700", color: colors.textMain, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: "600", color: colors.textMain, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: "600", color: colors.textMain },
  bodyLg: { fontSize: 16, fontWeight: "400", color: colors.textMain, lineHeight: 24 },
  body: { fontSize: 14, fontWeight: "400", color: colors.textMuted, lineHeight: 20 },
  bodySm: { fontSize: 12, fontWeight: "400", color: colors.textSubtle, lineHeight: 16 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textMain },
  badge: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }
};
