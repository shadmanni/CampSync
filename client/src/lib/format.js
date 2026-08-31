/** Small formatting helpers shared across all four modules. */

const rupee = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const money = (n) => rupee.format(Number(n) || 0);

/** Bare number with Indian digit grouping — for use next to a separate ₹ glyph. */
export const num = (n) => new Intl.NumberFormat('en-IN').format(Math.round(Number(n) || 0));

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || '?';

/**
 * Deterministic accent for an author avatar: the same name always gets the
 * same colour, so students become visually recognisable down a long feed.
 */
const AVATAR_HUES = ['--violet', '--coral', '--mint', '--sky', '--sun', '--rose'];

export const avatarToken = (seed = '') => {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_HUES[h % AVATAR_HUES.length];
};

/**
 * The API returns pre-rendered strings like "4 hours ago" for seeded rows and
 * "Just now" for fresh ones, so pass those straight through; only format when
 * we are handed a real timestamp.
 */
export function timeAgo(value) {
  if (!value) return '';
  if (typeof value === 'string' && !/^\d{4}-|^\d{10,}$/.test(value)) return value;

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return String(value);

  const secs = Math.round((Date.now() - then) / 1000);
  if (secs < 60) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const pluralize = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
