import { seed } from './seed.js';

/**
 * Fetch wrapper over the CampusSync REST API with environment support,
 * timeout controls, and bundled seed fallback when offline.
 */

const TIMEOUT_MS = 6000;
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/** Subscribers to connectivity changes (the offline banner listens here). */
const listeners = new Set();

export const connection = {
  online: true,
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
    const res = await fetch(`${API_BASE}${path}`, {
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
      if (res.status < 500) setDegraded(false);
      throw new ApiError(data?.error || `Request failed (${res.status})`, res.status);
    }

    setDegraded(false);
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
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
  /* ---- Auth & Campus Verification --------------------------------------- */
  requestOtp: (email) => request('/auth/request-otp', { method: 'POST', body: { email } }),
  verifyOtp: (email, otp) => request('/auth/verify-otp', { method: 'POST', body: { email, otp } }),
  getMe: () => request('/auth/me'),

  /* ---- CampusConnect (Discussions & Voting) ------------------------------ */
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
  downvotePost: (id) => request(`/connect/posts/${id}/downvote`, { method: 'POST' }),
  addComment: (id, payload) =>
    request(`/connect/posts/${id}/comments`, { method: 'POST', body: payload }),

  /* ---- CampusBid & Marketplace (Auctions & Store) ----------------------- */
  getItems: () => readOr('/bid/items', seed.items),
  createItem: (payload) => request('/bid/items', { method: 'POST', body: payload }),
  placeBid: (id, payload) => request(`/bid/items/${id}/bid`, { method: 'POST', body: payload }),

  /* ---- CampusSkills (Skill-Sharing Network) ------------------------------ */
  getSkills: ({ category, type, search } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (type && type !== 'ALL') params.append('type', type);
    if (search && search.trim()) params.append('search', search.trim());
    const query = params.toString() ? `?${params.toString()}` : '';
    return readOr(`/skills${query}`, seed.skills || []);
  },
  getSkillById: (id) => request(`/skills/${id}`),
  createSkill: (payload) => request('/skills', { method: 'POST', body: payload }),
  deleteSkill: (id) => request(`/skills/${id}`, { method: 'DELETE' }),

  /* ---- CampusTasks (Micro-Tasks & Campus Gigs) --------------------------- */
  getTasks: ({ status, category } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (category && category !== 'All') params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return readOr(`/tasks${query}`, seed.tasks || []);
  },
  getTaskById: (id) => request(`/tasks/${id}`),
  createTask: (payload) => request('/tasks', { method: 'POST', body: payload }),
  acceptTask: (id, payload = {}) => request(`/tasks/${id}/accept`, { method: 'POST', body: payload }),
  completeTask: (id) => request(`/tasks/${id}/complete`, { method: 'POST' }),

  /* ---- CampusRide & Events ---------------------------------------------- */
  getRides: () => readOr('/ride/rides', seed.rides),
  createRide: (payload) => request('/ride/rides', { method: 'POST', body: payload }),
  joinRide: (id, payload) => request(`/ride/rides/${id}/join`, { method: 'POST', body: payload }),
  getEvents: () => readOr('/ride/events', seed.events),
  rsvpEvent: (id) => request(`/ride/events/${id}/rsvp`, { method: 'POST' }),

  /* ---- CampusNearby (Discounts & Deals) --------------------------------- */
  getDeals: () => readOr('/nearby/deals', seed.deals),
};
