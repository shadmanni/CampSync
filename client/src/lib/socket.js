import { useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Single shared Socket.io connection.
 *
 * The server emits three events today:
 *   connect:new_post    — a post landed in the CampusConnect feed
 *   bid:new_highest     — someone outbid the current high bid
 *   ride:seat_updated   — a carpool seat was taken
 *
 * Created lazily on first subscription so a viewer who never opens a live
 * module does not hold a socket open.
 */

let socket = null;

function getSocket() {
  if (socket) return socket;

  socket = io({
    // Same origin: Vite proxies /socket.io through to the API in dev, and in
    // production the client is served behind the same host.
    transports: ['websocket', 'polling'],
    // Give up after a while instead of retrying forever against a dead API
    // and flooding the console during an offline demo.
    reconnectionAttempts: 6,
    reconnectionDelay: 1200,
    reconnectionDelayMax: 6000,
    timeout: 5000,
    autoConnect: true,
  });

  return socket;
}

/**
 * Subscribe to one server event for the lifetime of a component.
 *
 * `handler` is stashed in a ref-free closure re-registered on change, which is
 * fine here because every call site passes a `useCallback`-stable handler.
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
