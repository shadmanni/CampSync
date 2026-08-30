import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { CloudOff, ArrowUp } from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

import { Navbar, MobileTabBar } from './components/Navbar.jsx';
import { Landing } from './components/Landing.jsx';
import { AuthModal } from './modules/auth/AuthModal.jsx';
import { CampusConnect } from './modules/connect/CampusConnect.jsx';
import { CampusBid } from './modules/bid/CampusBid.jsx';
import { CampusSkills } from './modules/skills/CampusSkills.jsx';
import { CampusTasks } from './modules/tasks/CampusTasks.jsx';
import { CampusRide } from './modules/ride/CampusRide.jsx';
import { CampusNearby } from './modules/nearby/CampusNearby.jsx';

import { MODULE_IDS, MODULES } from './lib/modules.js';
import { onConnectionChange } from './lib/api.js';
import { useHotkey, useSmoothScroll } from './lib/hooks.js';
import { pageVariants, spring } from './lib/motion.js';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';

const VIEWS = {
  connect: CampusConnect,
  bid: CampusBid,
  skills: CampusSkills,
  tasks: CampusTasks,
  ride: CampusRide,
  nearby: CampusNearby,
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Shell />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function Shell() {
  const { user, openAuth } = useAuth();
  const { scrollTo } = useSmoothScroll();

  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState('connect');
  /* Sign of travel between tabs, so page transitions slide the right way. */
  const [direction, setDirection] = useState(1);
  const [offline, setOffline] = useState(false);

  const prevTab = useRef(tab);

  /* Verifying takes you straight into the app. */
  useEffect(() => {
    if (user) setEntered(true);
  }, [user]);

  useEffect(() => onConnectionChange((c) => setOffline(c.degraded)), []);

  const navigate = useCallback(
    (next) => {
      setDirection(MODULE_IDS.indexOf(next) >= MODULE_IDS.indexOf(prevTab.current) ? 1 : -1);
      prevTab.current = next;
      setTab(next);
      setEntered(true);
      // Land at the top of the new module rather than mid-scroll from the old.
      scrollTo(0, { immediate: true });
    },
    [scrollTo],
  );

  const goHome = useCallback(() => {
    setEntered(false);
    scrollTo(0, { immediate: true });
  }, [scrollTo]);

  /* Number keys jump straight to a module — handy when presenting */
  const onDigit = useCallback(
    (e) => {
      const index = Number(e.key) - 1;
      if (MODULE_IDS[index]) navigate(MODULE_IDS[index]);
    },
    [navigate],
  );

  useHotkey('1', onDigit, { enabled: entered });
  useHotkey('2', onDigit, { enabled: entered });
  useHotkey('3', onDigit, { enabled: entered });
  useHotkey('4', onDigit, { enabled: entered });
  useHotkey('5', onDigit, { enabled: entered });
  useHotkey('6', onDigit, { enabled: entered });

  const Active = VIEWS[tab];

  return (
    <>
      <div className="aura" aria-hidden="true" />

      {/* ---- Scroll progress bar ---- */}
      <ProgressBar />

      {/* ---- Offline warning banner ---- */}
      <AnimatePresence>
        {offline && (
          <motion.aside
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={spring.snappy}
            role="status"
            aria-live="polite"
            style={{
              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.16), rgba(245, 158, 11, 0.16))',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              overflow: 'hidden',
            }}
          >
            <div
              className="shell row-between"
              style={{ padding: '8px 0', fontSize: '0.8rem', color: 'var(--ink)' }}
            >
              <span className="row" style={{ gap: 8 }}>
                <CloudOff size={14} style={{ color: 'var(--coral)' }} />
                <span>
                  <strong>Offline demo mode:</strong> Showing bundled seed data. Start the API on port 5000 for live data.
                </span>
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => window.location.reload()}
                style={{ padding: '3px 9px', fontSize: '0.74rem' }}
              >
                Retry
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <Navbar active={entered ? tab : null} onNavigate={navigate} onBrandClick={goHome} />

      <main id="main-content" style={{ minHeight: '80vh' }}>
        {entered ? (
          <div className="shell" style={{ paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-xl)' }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={tab}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={spring.soft}
              >
                <Active />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <Landing onEnter={navigate} />
        )}
      </main>

      <Footer onNavigate={navigate} onHome={goHome} />
      <MobileTabBar active={entered ? tab : null} onNavigate={navigate} />
      <ScrollToTop />
      <AuthModal />
    </>
  );
}

function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 400, damping: 40, restDelta: 0.001 });

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        transformOrigin: '0%',
        scaleX,
        background: 'linear-gradient(90deg, var(--violet), var(--coral), var(--mint), var(--sky))',
        zIndex: 100,
      }}
    />
  );
}

function Footer({ onNavigate, onHome }) {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--line)',
        background: 'var(--surface-muted)',
        padding: 'var(--space-lg) 0 calc(var(--space-lg) + 50px)',
        marginTop: 'var(--space-xl)',
        fontSize: '0.82rem',
        color: 'var(--text-subtle)',
      }}
    >
      <div className="shell col" style={{ gap: 'var(--space-md)' }}>
        <div className="row-between" style={{ flexWrap: 'wrap', gap: 'var(--gap)' }}>
          <div className="col" style={{ gap: 4 }}>
            <button
              type="button"
              onClick={onHome}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1rem',
                color: 'var(--ink)',
                background: 'none',
                border: 0,
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              CampusSync
            </button>
            <span>One unified application for everything that happens on campus.</span>
          </div>

          <nav aria-label="Footer modules" className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            {MODULES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="pill"
                onClick={() => onNavigate(m.id)}
                style={{ fontSize: '0.74rem' }}
              >
                {m.short}
              </button>
            ))}
          </nav>
        </div>

        <div className="row-between" style={{ borderTop: '1px solid var(--line)', paddingTop: 16, fontSize: '0.75rem' }}>
          <span>CPI Team of 8 • React (Vite) + React Native (Expo) + Node.js + Render PostgreSQL</span>
          <span>© 2026 CampusSync</span>
        </div>
      </div>
    </footer>
  );
}

function ScrollToTop() {
  const { scrollY } = useScroll();
  const { scrollTo } = useSmoothScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (y) => setVisible(y > 400));
  }, [scrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Scroll to top"
          onClick={() => scrollTo(0)}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={spring.snappy}
          className="btn-icon"
          style={{
            position: 'fixed',
            right: 20,
            bottom: 74,
            zIndex: 40,
            background: 'var(--surface-raised)',
            boxShadow: 'var(--shadow-raised)',
            border: '1px solid var(--line)',
          }}
        >
          <ArrowUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
