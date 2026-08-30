import { seed } from './seed.js';

/**
 * Thin fetch wrapper over the CampusSync REST API.
 *
 * Two things beyond plain fetch:
 *
 * 1. A timeout. A hung request during a live demo is worse than a failed one,
 *    because the UI just sits on a spinner with nothing to say.
 *
 * 2. An explicit offline fallback. If the API cannot be reached, reads fall
 *    back to bundled seed data and the app raises a banner saying so. This is
 *    deliberately *visible* — the point is that the UI stays walkable when the
 *    server is down, not that a viewer is fooled into thinking it is live.
 */

const TIMEOUT_MS = 6000;

/** Subscribers to connectivity changes (the offline banner listens here). */
const listeners = new Set();

export const connection = {
  online: true,
  /** True once a request has actually failed, so we do not warn pre-emptively. */
  degraded: false,
};

function setDegraded(next) {
  if (connection.degraded === next) return;
  connection.degraded = next;
  connection.online = !next;
  listeners.forEach((fn) => fn(connection));
}

export function onConnectionChange(fn) {
  listeners.add(fn);
  fn(connection);
  return () => listeners.delete(fn);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * The JWT issued at verification.
 *
 * Every write route runs `optionalAuth`, which prefers `req.user.name` over the
 * display name in the body — so sending this is what makes a post or a bid
 * actually attributable to the verified account rather than to a guest.
 */
function authHeader() {
  try {
    const token = localStorage.getItem('campussync_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  if (signal) signal.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(`/api${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...authHeader(),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      // A 4xx is the server working correctly and rejecting us (bad bid, full
      // ride). That is not a connectivity problem, so do not mark degraded.
      if (res.status < 500) setDegraded(false);
      throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
    }

    setDegraded(false);
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    // Network error, DNS failure, timeout, or unparseable body.
    setDegraded(true);
    throw new ApiError(
      err.name === 'AbortError' ? 'The server took too long to respond.' : 'Cannot reach the CampusSync API.',
      0,
    );
  } finally {
    clearTimeout(timer);
  }
}

/** GET that degrades to bundled seed data instead of throwing. */
async function readOr(path, fallback) {
  try {
    return await request(path);
  } catch (err) {
    if (err.status === 0) return structuredClone(fallback);
    throw err;
  }
}

export const api = {
  /* ---- Auth & campus verification (Member 5) ---------------------------- */
  requestOtp: (email) => request('/auth/request-otp', { method: 'POST', body: { email } }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: { email, otp } }),

  /* ---- CampusConnect ---------------------------------------------------- */
  getPosts: (category) =>
    readOr(
      category && category !== 'All'
        ? `/connect/posts?category=${encodeURIComponent(category)}`
        : '/connect/posts',
      category && category !== 'All'
        ? seed.posts.filter((p) => p.category === category)
        : seed.posts,
    ),
  createPost: (payload) => request('/connect/posts', { method: 'POST', body: payload }),
  upvotePost: (id) => request(`/connect/posts/${id}/upvote`, { method: 'POST' }),
  addComment: (id, payload) =>
    request(`/connect/posts/${id}/comments`, { method: 'POST', body: payload }),

  /* ---- CampusBid -------------------------------------------------------- */
  getItems: () => readOr('/bid/items', seed.items),
  createItem: (payload) => request('/bid/items', { method: 'POST', body: payload }),
  placeBid: (id, payload) => request(`/bid/items/${id}/bid`, { method: 'POST', body: payload }),

  /* ---- CampusRide & Events ---------------------------------------------- */
  getRides: () => readOr('/ride/rides', seed.rides),
  createRide: (payload) => request('/ride/rides', { method: 'POST', body: payload }),
  joinRide: (id, payload) => request(`/ride/rides/${id}/join`, { method: 'POST', body: payload }),
  getEvents: () => readOr('/ride/events', seed.events),
  /* One-way increment server-side — there is no un-RSVP endpoint. */
  rsvpEvent: (id) => request(`/ride/events/${id}/rsvp`, { method: 'POST' }),

  /* ---- CampusNearby ----------------------------------------------------- */
  getDeals: () => readOr('/nearby/deals', seed.deals),
};
