/**
 * CampusSync — "Campus Pop" Theme Tokens (Light-Mode Only)
 * Faithfully mirrors client/src/styles/tokens.css :root (light skin).
 *
 * Canvas: warm cream  #FDFBF5
 * Surface: pure white #FFFFFF
 * Ink: rich near-black #17150F
 * Borders: 1.5px solid ink
 * Shadows: hard offset blocks (4px 4px 0)
 */

/* ---- Module accent colours ------------------------------------------------ */
export const moduleColors = {
  violet:     '#6E56F8',
  violetSoft: '#EEEAFF',
  coral:      '#FF6B35',
  coralSoft:  '#FFEDE5',
  mint:       '#12B886',
  mintSoft:   '#E1F8F0',
  sky:        '#0EA5E9',
  skySoft:    '#E2F4FE',
  sun:        '#FFB703',
  sunSoft:    '#FFF4D9',
  rose:       '#F43F5E',
  roseSoft:   '#FFE8EC',
};

/* ---- Surfaces & ink ------------------------------------------------------- */
export const colors = {
  // Canvas
  canvas:       '#FDFBF5',
  canvasTint:   '#F6F1E4',
  surface:      '#FFFFFF',
  surface2:     '#FBF8F1',
  surfaceInset: '#F3EFE4',

  // Ink
  ink:          '#17150F',
  inkSoft:      '#58524A',
  inkFaint:     '#8E877A',
  inkInvert:    '#FDFBF5',

  // Lines
  line:         'rgba(23, 21, 15, 0.12)',
  lineStrong:   'rgba(23, 21, 15, 0.88)',

  // On-accent (for text on accent-filled backgrounds)
  onAccent:     '#FFFFFF',

  // Semantic
  error:        '#F43F5E',
  errorSoft:    '#FFE8EC',
  success:      '#12B886',
  successSoft:  '#E1F8F0',
  warning:      '#FFB703',
  warningSoft:  '#FFF4D9',

  // Module re-exports for convenience
  ...moduleColors,
};

/* ---- Neo-pop shadows (hard ink offsets) ----------------------------------- */
export const shadows = {
  hard:   { shadowColor: '#17150F', shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.9, shadowRadius: 0, elevation: 6 },
  hardSm: { shadowColor: '#17150F', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 0.9, shadowRadius: 0, elevation: 4 },
  hardLg: { shadowColor: '#17150F', shadowOffset: { width: 7, height: 7 }, shadowOpacity: 0.9, shadowRadius: 0, elevation: 10 },
  soft:   { shadowColor: '#17150F', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 24, elevation: 3 },
  pressed:{ shadowColor: '#17150F', shadowOffset: { width: 1, height: 1 }, shadowOpacity: 0.9, shadowRadius: 0, elevation: 2 },
};

/* ---- Borders -------------------------------------------------------------- */
export const borders = {
  card:    { borderWidth: 1.5, borderColor: colors.lineStrong },
  subtle:  { borderWidth: 1, borderColor: colors.line },
  accent:  (color) => ({ borderWidth: 1.5, borderColor: color }),
};

/* ---- Spacing -------------------------------------------------------------- */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  containerPadding: 20,
};

/* ---- Radii ---------------------------------------------------------------- */
export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 9999,
};

/* ---- Typography ----------------------------------------------------------- */
export const typography = {
  h1:      { fontSize: 28, fontWeight: '800', color: colors.ink, letterSpacing: -0.5 },
  h2:      { fontSize: 22, fontWeight: '700', color: colors.ink, letterSpacing: -0.3 },
  h3:      { fontSize: 18, fontWeight: '700', color: colors.ink },
  bodyLg:  { fontSize: 16, fontWeight: '400', color: colors.ink, lineHeight: 24 },
  body:    { fontSize: 14, fontWeight: '400', color: colors.inkSoft, lineHeight: 20 },
  bodySm:  { fontSize: 12, fontWeight: '400', color: colors.inkFaint, lineHeight: 16 },
  label:   { fontSize: 13, fontWeight: '600', color: colors.ink },
  badge:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  micro:   { fontSize: 10, fontWeight: '600', color: colors.inkFaint },
  num:     { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
};
