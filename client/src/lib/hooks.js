import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';

/* ==========================================================================
   Scroll physics
   ========================================================================== */

/* The single live Lenis instance, kept at module scope so that anything which
   opens an overlay can freeze the page without threading a prop down to it.
   Null whenever smooth scrolling is off (reduced motion, or before mount). */
let activeLenis = null;

/** Freeze/unfreeze inertial scrolling. Safe to call when Lenis is not running. */
export function lockScroll(locked) {
  if (!activeLenis) return;
  if (locked) activeLenis.stop();
  else activeLenis.start();
}

/**
 * Inertial smooth scrolling for the whole document.
 *
 * Lenis drives `window.scrollTo` on a rAF loop, which means native
 * `window.scrollY` stays truthful — so framer-motion's `useScroll`,
 * IntersectionObserver and anchor offsets all keep working. (A transform-based
 * smooth-scroll library would break all three.)
 *
 * Returns the instance so callers can `scrollTo(target)` with the same easing
 * the wheel uses, instead of a jarring native jump.
 */
export function useSmoothScroll({ enabled = true } = {}) {
  const lenisRef = useRef(null);
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    if (!enabled) return undefined;

    // Respect the OS setting — inertial scrolling is exactly the kind of
    // motion that triggers vestibular discomfort.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      // Exponential ease-out: fast pickup, long glide, no rubber-band at rest.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      // Touch devices already have excellent native inertia; hijacking it
      // makes phones feel worse, not better.
      syncTouch: false,
      touchMultiplier: 1.6,
    });

    lenisRef.current = lenis;
    activeLenis = lenis;
    setInstance(lenis);

    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      if (activeLenis === lenis) activeLenis = null;
      setInstance(null);
    };
  }, [enabled]);

  const scrollTo = useCallback((target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -90, duration: 1.1, ...options });
    } else if (typeof target === 'string') {
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: typeof target === 'number' ? target : 0, behavior: 'smooth' });
    }
  }, []);

  /* Modals must freeze the page behind them; Lenis needs to be told, since
     `overflow: hidden` alone does not stop its rAF loop. */
  const setLocked = useCallback((locked) => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (locked) lenis.stop();
    else lenis.start();
  }, []);

  return { lenis: instance, scrollTo, setLocked };
}

/* ==========================================================================
   Pointer-driven micro-interactions
   ========================================================================== */

/**
 * Magnetic hover: the element leans toward the cursor while it is nearby and
 * springs back on exit. Attach the returned ref to any element.
 *
 * `strength` is the fraction of the cursor offset the element travels.
 */
export function useMagnetic({ strength = 0.28, radius = 90 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    // Pointer-follow makes no sense without a hovering pointer.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    let raf = null;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;

    const tick = () => {
      // Critically-damped-ish lerp toward the target; cheaper than a spring
      // and indistinguishable at these distances.
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;

      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
        if (tx === 0 && ty === 0) el.style.transform = '';
      }
    };

    const start = () => {
      if (raf == null) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const falloff = Math.max(0, 1 - dist / (Math.max(r.width, r.height) / 2 + radius));
      tx = dx * strength * falloff;
      ty = dy * strength * falloff;
      start();
    };

    const onLeave = () => {
      tx = 0;
      ty = 0;
      start();
    };

    // Listen on the window so the magnet engages *before* the cursor
    // technically enters the element — that is what sells the effect.
    window.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = '';
    };
  }, [strength, radius]);

  return ref;
}

/**
 * Subtle 3D tilt toward the cursor, plus a moving specular highlight exposed
 * as the CSS custom properties `--mx` / `--my` (0-100%).
 */
export function useTilt({ max = 7, scale = 1.012 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      el.style.transform =
        `perspective(900px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) ` +
        `rotateY(${((px - 0.5) * max).toFixed(2)}deg) scale(${scale})`;
    };

    const onLeave = () => {
      el.style.transform = '';
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [max, scale]);

  return ref;
}

/* ==========================================================================
   Numbers
   ========================================================================== */

/**
 * Animate a number toward `value` with ease-out.
 *
 * Used for live bids and seat counts: when a socket event changes ₹1,850 to
 * ₹2,000, the digits roll instead of teleporting, which is what makes a
 * remote change legible as *something just happened*.
 */
export function useCountUp(value, { duration = 750, decimals = 0 } = {}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;

    if (from === to) return undefined;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = to;
      setDisplay(to);
      return undefined;
    }

    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(Number(current.toFixed(decimals)));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      // Land on the true value even if we unmount mid-flight, so a remount
      // never animates from a stale midpoint.
      fromRef.current = to;
    };
  }, [value, duration, decimals]);

  return display;
}

/* ==========================================================================
   Environment
   ========================================================================== */

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 860px)');

/** Fire a callback on a bare keypress, ignoring keystrokes aimed at inputs. */
export function useHotkey(key, handler, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      const tag = e.target?.tagName;
      const typing =
        tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable;
      if (typing && e.key !== 'Escape') return;
      if (e.key.toLowerCase() === key.toLowerCase()) handler(e);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [key, handler, enabled]);
}

/** Runs before paint so a locked scrollbar never flashes. */
export function useBodyScrollLock(locked) {
  useLayoutEffect(() => {
    if (!locked) return undefined;
    const { overflow, paddingRight } = document.body.style;
    // Compensate for the vanishing scrollbar so the layout does not jump.
    const gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [locked]);
}

/** True only after `value` changes at least once — used to flash "updated" states. */
export function useHasChanged(value, resetAfter = 1600) {
  const [changed, setChanged] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setChanged(true);
    const t = setTimeout(() => setChanged(false), resetAfter);
    return () => clearTimeout(t);
  }, [value, resetAfter]);

  return changed;
}
