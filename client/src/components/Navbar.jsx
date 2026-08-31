import React, { useEffect, useState } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Sun, Moon, ShieldCheck, LogOut, LogIn, Radio } from 'lucide-react';
import { MODULES } from '../lib/modules.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useSocketStatus } from '../lib/socket.js';
import { spring } from '../lib/motion.js';
import { Avatar, MagneticButton } from './ui.jsx';

/**
 * Sticky top bar.
 *
 * Two scroll-linked behaviours:
 *  - it condenses once you leave the hero (less chrome, more content), and
 *  - the active-tab indicator is a single shared element that slides between
 *    pills via `layoutId`, rather than four independently fading backgrounds.
 */
export function Navbar({ active, onNavigate, onBrandClick }) {
  const { user, logout, openAuth } = useAuth();
  const { isDark, toggle } = useTheme();
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [socketUp, setSocketUp] = useState(false);

  useSocketStatus(setSocketUp);

  useMotionValueEvent(scrollY, 'change', (y) => {
    // Hysteresis: different thresholds up and down so the bar cannot flicker
    // when the user hovers right at the boundary.
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

          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1.06rem',
              letterSpacing: '-0.035em',
              color: 'var(--ink)',
            }}
          >
            CampusSync
          </span>
        </button>

        {/* ---- Module tabs (desktop) ---- */}
        <nav
          className="hide-sm"
          aria-label="Modules"
          style={{
            display: 'flex',
            gap: 2,
            padding: 4,
            borderRadius: 'var(--r-pill)',
            border: 'var(--line-width) solid var(--line)',
            background: 'var(--surface-2)',
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '8px 15px',
                  borderRadius: 'var(--r-pill)',
                  border: 0,
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--t-small)',
                  fontWeight: 700,
                  color: isActive ? m.color : 'var(--ink-soft)',
                  transition: 'color 220ms var(--ease-out)',
                  whiteSpace: 'nowrap',
                }}
              >
                {isActive && (
                  <motion.span
                    // One indicator, shared across every tab: it physically
                    // travels rather than cross-fading.
                    layoutId="nav-indicator"
                    transition={spring.layout}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--r-pill)',
                      background: `color-mix(in srgb, ${m.color} 14%, transparent)`,
                      border: `1.5px solid color-mix(in srgb, ${m.color} 34%, transparent)`,
                    }}
                  />
                )}
                <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon size={15} strokeWidth={2.4} />
                  {m.label}
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

          <ThemeToggle isDark={isDark} onToggle={toggle} />

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

/** Sun/moon toggle where the icon rotates and scales through the swap. */
function ThemeToggle({ isDark, onToggle }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      type="button"
      onClick={onToggle}
      className="btn btn-ghost btn-icon"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{ overflow: 'hidden', position: 'relative' }}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={mounted ? { rotate: -110, scale: 0.4, opacity: 0 } : false}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={spring.bouncy}
        style={{ display: 'grid', placeItems: 'center' }}
      >
        {isDark ? <Moon size={16} strokeWidth={2.4} /> : <Sun size={16} strokeWidth={2.4} />}
      </motion.span>
    </button>
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
        left: 10,
        right: 10,
        bottom: 'calc(10px + env(safe-area-inset-bottom))',
        zIndex: 90,
        display: 'flex',
        gap: 2,
        padding: '5px 4px',
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
              justifyContent: 'center',
              gap: 3,
              minHeight: 46,
              padding: '4px 2px',
              border: 0,
              borderRadius: 'var(--r-pill)',
              background: 'transparent',
              cursor: 'pointer',
              color: isActive ? m.color : 'var(--ink-faint)',
              fontSize: '0.62rem',
              fontWeight: 800,
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
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
                  background: `color-mix(in srgb, ${m.color} 18%, transparent)`,
                  pointerEvents: 'none',
                }}
              />
            )}
            <span style={{ position: 'relative', display: 'grid', placeItems: 'center', gap: 2, pointerEvents: 'none' }}>
              <Icon size={16} strokeWidth={2.4} />
              {m.short}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
