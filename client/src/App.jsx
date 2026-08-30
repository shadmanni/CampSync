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

  /* Number keys jump straight to a module — handy when presenting, since you
     never have to hunt for a tab mid-sentence. */
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

  const Active = VIEWS[tab];

  return (
    <>
      <div className="aura" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

      <ScrollProgress />

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar active={entered ? tab : null} onNavigate={navigate} onBrandClick={goHome} />

        <OfflineBanner show={offline} />

        <main style={{ flex: 1 }}>
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            {!entered ? (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.35 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <Landing onEnter={openAuth} onExplore={() => navigate('connect')} />
              </motion.div>
            ) : (
              <motion.div
                key={tab}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="shell"
                style={{
                  paddingBlock: 'clamp(28px, 5vh, 52px)',
                  // Clear the fixed mobile tab bar.
                  paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
                }}
              >
                <Active />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer onNavigate={navigate} />
      </div>

      <MobileTabBar active={entered ? tab : null} onNavigate={navigate} />
      <BackToTop onClick={() => scrollTo(0)} />
      <AuthModal />
    </>
  );
}

/* ==========================================================================
   Chrome
   ========================================================================== */

/** Rainbow rail across the top, driven directly by document scroll progress. */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

/**
 * Says plainly that the API is unreachable and the screen is showing bundled
 * sample data. Being explicit is the point — a demo that silently fakes its
 * data is worse than one that admits the backend is down.
 */
function OfflineBanner({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={spring.soft}
          style={{ overflow: 'hidden', background: 'var(--sun-soft)' }}
        >
          <div
            className="shell row"
            style={{ gap: 10, paddingBlock: 10, fontSize: 'var(--t-small)', fontWeight: 600 }}
          >
            <CloudOff size={15} strokeWidth={2.4} />
            <span>
              Can’t reach the CampusSync API — showing bundled sample data. Posting, bidding and
              joining rides are disabled until the server is back.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BackToTop({ onClick }) {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  useEffect(() => scrollY.on('change', (y) => setShow(y > 700)), [scrollY]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={onClick}
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={spring.bouncy}
          whileHover={{ y: -3 }}
          className="btn btn-ink btn-icon hide-sm"
          style={{
            position: 'fixed',
            right: 26,
            bottom: 26,
            zIndex: 85,
            width: 44,
            height: 44,
            boxShadow: 'var(--shadow-lift)',
          }}
        >
          <ArrowUp size={17} strokeWidth={2.8} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function Footer({ onNavigate }) {
  return (
    <footer style={{ borderTop: 'var(--line-width) solid var(--line)', marginTop: 40 }}>
      <div
        className="shell row-between wrap"
        style={{ paddingBlock: 26, gap: 20, alignItems: 'flex-start' }}
      >
        <div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '1rem',
              letterSpacing: '-0.03em',
            }}
          >
            CampusSync
          </p>
          <p className="t-faint" style={{ fontSize: 'var(--t-micro)', marginTop: 3 }}>
            CPI team project · 8 members · React, Express, Socket.io
          </p>
        </div>

        <nav className="row wrap" style={{ gap: 6 }} aria-label="Modules">
          {MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onNavigate(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
