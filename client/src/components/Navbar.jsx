import React, { useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { ShieldCheck, LogOut, LogIn, Radio } from 'lucide-react';
import { MODULES } from '../lib/modules.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocketStatus } from '../lib/socket.js';
import { spring } from '../lib/motion.js';
import { Avatar, MagneticButton } from './ui.jsx';

/**
 * Sticky top bar.
 */
export function Navbar({ active, onNavigate, onBrandClick }) {
  const { user, logout, openAuth } = useAuth();
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [socketUp, setSocketUp] = useState(false);

  useSocketStatus(setSocketUp);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setCondensed((prev) => (prev ? y > 40 : y > 90));
  });

  return (
    <motion.header
      initial={false}
      animate={{
        paddingTop: condensed ? 8 : 14,
        paddingBottom: condensed ? 8 : 14,
      }}
      transition={spring.soft}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: 'var(--glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: `var(--line-width) solid ${condensed ? 'var(--line)' : 'transparent'}`,
        transition: 'border-color 300ms var(--ease-out)',
      }}
    >
      <div
        className="shell row-between"
        style={{ gap: 'var(--gap)' }}
      >
        {/* ---- Brand ---- */}
        <button
          type="button"
          onClick={onBrandClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 0,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <motion.span
            animate={{ scale: condensed ? 0.88 : 1 }}
            transition={spring.soft}
            style={{
              width: 38,
              height: 38,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 11,
              background: 'var(--ink)',
              color: 'var(--ink-invert)',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.95rem',
              letterSpacing: '-0.04em',
              flex: 'none',
            }}
          >
            CS
          </motion.span>

          <span style={{ textAlign: 'left', lineHeight: 1.05 }}>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.06rem',
                letterSpacing: '-0.035em',
              }}
            >
              CampusSync
            </span>
            {!condensed && (
              <motion.span
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                className="t-faint hide-sm"
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}
              >
                one app · whole campus
              </motion.span>
            )}
          </span>
        </button>

        {/* ---- Module tabs (desktop) ---- */}
        <nav className="nav-pills hide-sm" aria-label="Campus modules">
          {MODULES.map((m) => {
            const isCurrent = active === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                className={`nav-pill ${isCurrent ? 'nav-pill-active' : ''}`}
                onClick={() => onNavigate(m.id)}
                style={{ '--accent': `var(${m.accentToken})` }}
              >
                {/* Sliding indicator */}
                {isCurrent && (
                  <motion.span
                    layoutId="nav-active-bubble"
                    className="nav-active-bubble"
                    transition={spring.bouncy}
                  />
                )}
                <span className="row" style={{ gap: 8, position: 'relative', zIndex: 1 }}>
                  <Icon size={16} strokeWidth={isCurrent ? 2.4 : 2} />
                  <span>{m.label}</span>
                  {m.badge && <span className="nav-pill-badge">{m.badge}</span>}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ---- Right cluster ---- */}
        <div className="row" style={{ gap: 8 }}>
          {socketUp && (
            <span
              className="badge hide-sm accent-mint"
              title="Realtime channel connected"
              style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}
            >
              <Radio size={12} strokeWidth={2.6} />
              Live
            </span>
          )}

          {user ? (
            <div className="row" style={{ gap: 8 }}>
              <span
                className="badge hide-sm"
                style={{ background: 'var(--mint-soft)', color: 'var(--mint)' }}
              >
                <ShieldCheck size={12} strokeWidth={2.6} />
                Verified
              </span>
              <Avatar name={user.name} size={34} />
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={logout}
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <MagneticButton className="btn btn-ink btn-sm" onClick={openAuth}>
              <LogIn size={14} strokeWidth={2.6} />
              Verify campus email
            </MagneticButton>
          )}
        </div>
      </div>
    </motion.header>
  );
}

/** Thumb-reachable bottom tab bar; replaces the desktop pills under 860px. */
export function MobileTabBar({ active, onNavigate }) {
  return (
    <nav
      className="show-sm"
      aria-label="Modules"
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 'calc(12px + env(safe-area-inset-bottom))',
        zIndex: 95,
        display: 'flex',
        gap: 4,
        padding: 6,
        borderRadius: 'var(--r-pill)',
        background: 'var(--glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '2px solid var(--line-strong)',
        boxShadow: 'var(--shadow-hard)',
      }}
    >
      {MODULES.map((m) => {
        const Icon = m.icon;
        const isActive = active === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onNavigate(m.id)}
            aria-current={isActive ? 'page' : undefined}
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              minHeight: 48,
              justifyContent: 'center',
              padding: '6px 2px',
              border: 0,
              borderRadius: 'var(--r-pill)',
              background: 'none',
              cursor: 'pointer',
              color: isActive ? m.color : 'var(--ink-faint)',
              fontSize: '0.63rem',
              fontWeight: 700,
            }}
          >
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                transition={spring.layout}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'var(--r-pill)',
                  background: `color-mix(in srgb, ${m.color} 15%, transparent)`,
                }}
              />
            )}
            <span style={{ position: 'relative', display: 'grid', placeItems: 'center', gap: 3 }}>
              <Icon size={17} strokeWidth={2.4} />
              {m.short}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
