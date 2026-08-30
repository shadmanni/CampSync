import { useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Single shared Socket.io connection with auth token support and environment routing.
 *
 * Supported server events:
 *   connect:new_post    — a post landed in the CampusConnect feed
 *   bid:new_highest     — someone outbid the current high bid
 *   ride:seat_updated   — a carpool seat was taken
 *   task:created        — a new micro-task/errand posted
 *   task:assigned       — a runner claimed an errand
 *   task:completed      — a task marked completed
 *   skill:created       — new skill offered/requested
 */

let socket = null;

function getSocket() {
  if (socket) return socket;

  const url = import.meta.env.VITE_API_URL || undefined;
  const token = typeof window !== 'undefined' ? localStorage.getItem('campussync_token') : null;

  socket = io(url, {
    transports: ['websocket', 'polling'],
    auth: {
      token: token || '',
    },
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 6000,
    autoConnect: true,
  });

  return socket;
}

/**
 * Subscribe to one server event for the lifetime of a component.
 */
export function useSocketEvent(event, handler, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled || !handler) return undefined;

    const s = getSocket();
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
  }, [event, handler, enabled]);
}

/** Track whether the realtime channel is actually up, for the live indicator. */
export function useSocketStatus(onChange) {
  useEffect(() => {
    if (!onChange) return undefined;

    const s = getSocket();
    const up = () => onChange(true);
    const down = () => onChange(false);

    onChange(s.connected);
    s.on('connect', up);
    s.on('disconnect', down);
    s.on('connect_error', down);

    return () => {
      s.off('connect', up);
      s.off('disconnect', down);
      s.off('connect_error', down);
    };
  }, [onChange]);
}
