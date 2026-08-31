import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { inView, revealVariants, spring, staggerParent } from '../lib/motion.js';
import { useCountUp, useMagnetic, useTilt } from '../lib/hooks.js';
import { avatarToken, initials, num } from '../lib/format.js';

/* ==========================================================================
   Scroll reveals
   ========================================================================== */

/** Fades and un-blurs into place the first time it crosses the fold. */
export function Reveal({ children, delay = 0, as = 'div', ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Wrap a list so children reveal one after another. Children must be <Reveal>. */
export function RevealGroup({ children, stagger = 0.07, delay = 0, ...rest }) {
  return (
    <motion.div
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Child of a RevealGroup — inherits the parent's stagger timing. */
export function RevealItem({ children, ...rest }) {
  return (
    <motion.div variants={revealVariants} {...rest}>
      {children}
    </motion.div>
  );
}

/* ==========================================================================
   Interaction primitives
   ========================================================================== */

/** Button that leans toward the cursor. Falls back to a plain button on touch. */
export const MagneticButton = forwardRef(function MagneticButton(
  { children, className = 'btn btn-primary', strength = 0.3, style, ...rest },
  forwardedRef,
) {
  const magnetRef = useMagnetic({ strength });

  return (
    <span
      ref={magnetRef}
      style={{ display: 'inline-flex', willChange: 'transform' }}
    >
      <button ref={forwardedRef} type="button" className={className} style={style} {...rest}>
        {children}
      </button>
    </span>
  );
});

/** Card that tilts toward the cursor and carries a specular highlight. */
export function TiltCard({ children, className = 'card-pop', style, max = 6, ...rest }) {
  const ref = useTilt({ max });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 420ms var(--ease-out), box-shadow 260ms var(--ease-out)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

/* ==========================================================================
   Display
   ========================================================================== */

/**
 * A number that rolls to its new value.
 *
 * `prefix` sits outside the animated span so the ₹ never shifts sideways as
 * the digit count changes.
 */
export function Counter({ value, prefix = '', suffix = '', className = 't-num', style }) {
  const display = useCountUp(value);
  return (
    <span className={className} style={style}>
      {prefix}
      {num(display)}
      {suffix}
    </span>
  );
}

export function Avatar({ name = '', anonymous = false, size = 38 }) {
  const token = anonymous ? '--ink-faint' : avatarToken(name);
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flex: 'none',
        display: 'grid',
        placeItems: 'center',
        borderRadius: anonymous ? '32%' : '50%',
        background: `color-mix(in srgb, var(${token}) 18%, transparent)`,
        color: `var(${token})`,
        border: `2px solid color-mix(in srgb, var(${token}) 38%, transparent)`,
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        fontSize: size * 0.36,
        letterSpacing: '-0.02em',
      }}
    >
      {anonymous ? '??' : initials(name)}
    </span>
  );
}

export function SectionHead({ eyebrow, title, subtitle, action }) {
  return (
    <div
      className="row-between wrap"
      style={{ alignItems: 'flex-start', gap: 'var(--gap)', marginBottom: 8 }}
    >
      <div style={{ maxWidth: '54ch', flex: '1 1 260px' }}>
        {eyebrow && <p className="t-eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</p>}
        <h2 className="t-title">{title}</h2>
        {subtitle && (
          <p className="t-muted" style={{ marginTop: 6, fontSize: 'var(--t-small)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="section-head-action">{action}</div>}
    </div>
  );
}

export function LiveDot({ label = 'Live' }) {
  return (
    <span className="badge" style={{ gap: 8 }}>
      <span className="dot-live" />
      {label}
    </span>
  );
}

/** Segmented meter — filled pips for taken seats, hollow for free ones. */
export function SeatPips({ total, available }) {
  const taken = Math.max(0, total - available);
  return (
    <span className="row" style={{ gap: 4 }} aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <motion.span
          key={i}
          initial={false}
          animate={{ scale: i < taken ? 1 : 0.82 }}
          transition={spring.bouncy}
          style={{
            width: 9,
            height: 9,
            borderRadius: 3,
            background: i < taken ? 'var(--ink-faint)' : 'var(--accent)',
            opacity: i < taken ? 0.35 : 1,
          }}
        />
      ))}
    </span>
  );
}

export function Meter({ value, max = 100 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meter" role="presentation">
      <motion.div
        className="meter-fill"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={spring.soft}
      />
    </div>
  );
}

/* ==========================================================================
   States
   ========================================================================== */

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <motion.div
      className="empty"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring.soft}
    >
      {Icon && <Icon size={30} strokeWidth={1.6} />}
      <div>
        <p style={{ fontWeight: 700, color: 'var(--ink)' }}>{title}</p>
        {hint && <p style={{ fontSize: 'var(--t-small)', marginTop: 4 }}>{hint}</p>}
      </div>
      {action}
    </motion.div>
  );
}

/** Skeleton shaped like the real card, so nothing shifts when data lands. */
export function SkeletonCard({ lines = 3, height = 168 }) {
  return (
    <div className="card" style={{ padding: 20, minHeight: height }}>
      <div className="row" style={{ gap: 12, marginBottom: 16 }}>
        <div className="skel" style={{ width: 38, height: 38, borderRadius: '50%' }} />
        <div style={{ flex: 1 }}>
          <div className="skel" style={{ height: 11, width: '38%', marginBottom: 7 }} />
          <div className="skel" style={{ height: 9, width: '22%' }} />
        </div>
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skel"
          style={{ height: 11, marginBottom: 9, width: i === lines - 1 ? '62%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4, ...rest }) {
  return (
    <div className="grid-cards">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} {...rest} />
      ))}
    </div>
  );
}
