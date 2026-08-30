/**
 * A ~90-line confetti burst on a throwaway canvas.
 *
 * Written by hand rather than pulled in as a dependency because the whole
 * effect is projectile motion plus drag, and owning it means we can match the
 * brand palette and tear the canvas down the instant the last piece falls.
 *
 * Fired when a bid actually lands — a reward that only appears on real
 * success, never on page load.
 */

const PALETTE = ['#6E56F8', '#FF6B35', '#12B886', '#0EA5E9', '#FFB703', '#F43F5E'];

const GRAVITY = 0.32;
const DRAG = 0.988;
const SPIN_DRAG = 0.97;

export function burst(originEl, { count = 70, spread = Math.PI * 0.75 } = {}) {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Anchor the burst on the element the user actually clicked, so the
  // celebration comes out of the button rather than the middle of nowhere.
  const rect = originEl?.getBoundingClientRect?.();
  const originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 3;

  const canvas = document.createElement('canvas');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '9999',
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pieces = Array.from({ length: count }, () => {
    // Bias upward: -90deg is straight up, then fan out by `spread`.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const speed = 7 + Math.random() * 9;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 5,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.35,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      life: 1,
      // Slight per-piece decay variation so they do not all vanish together.
      decay: 0.008 + Math.random() * 0.007,
    };
  });

  let frame;
  const tick = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let alive = 0;

    for (const p of pieces) {
      if (p.life <= 0) continue;

      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      p.spin *= SPIN_DRAG;
      p.life -= p.decay;

      if (p.y > window.innerHeight + 40) continue;
      alive += 1;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      // Squash horizontally as it spins, which reads as a flat paper flake.
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w * Math.abs(Math.cos(p.rot * 0.7)), p.h);
      ctx.restore();
    }

    if (alive > 0) {
      frame = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(frame);
      canvas.remove();
    }
  };

  frame = requestAnimationFrame(tick);

  // Hard ceiling: never leave a canvas pinned over the UI if something stalls
  // the loop (a backgrounded tab, for instance).
  setTimeout(() => {
    cancelAnimationFrame(frame);
    canvas.remove();
  }, 6000);
}
