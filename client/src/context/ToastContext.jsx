import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X, Zap } from 'lucide-react';
import { spring } from '../lib/motion.js';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
  live: Zap,
};

const ACCENTS = {
  success: 'var(--mint)',
  error: 'var(--rose)',
  info: 'var(--sky)',
  live: 'var(--violet)',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (message, { variant = 'info', detail, duration = 3800 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, detail, variant }];
        // Three is the most that reads as information rather than noise.
        return next.slice(-3);
      });
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toast: push,
      success: (msg, opts) => push(msg, { ...opts, variant: 'success' }),
      error: (msg, opts) => push(msg, { ...opts, variant: 'error', duration: 5200 }),
      info: (msg, opts) => push(msg, { ...opts, variant: 'info' }),
      live: (msg, opts) => push(msg, { ...opts, variant: 'live' }),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastViewport toasts={toasts} onDismiss={dismiss} />, document.body)}
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      // aria-live so screen readers announce bids and seat changes too.
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        zIndex: 200,
        right: 'clamp(12px, 3vw, 26px)',
        bottom: 'clamp(12px, 3vw, 26px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 'min(380px, calc(100vw - 24px))',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.variant] || Info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 32, scale: 0.96, transition: { duration: 0.18 } }}
              transition={spring.snappy}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0.02, right: 0.6 }}
              onDragEnd={(_, info) => {
                // Flick right to dismiss, matching the exit direction.
                if (info.offset.x > 70 || info.velocity.x > 480) onDismiss(t.id);
              }}
              className="card-pop"
              style={{
                pointerEvents: 'auto',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 11,
                padding: '13px 14px',
                borderRadius: 'var(--r-md)',
                background: 'var(--surface)',
              }}
            >
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 26,
                  height: 26,
                  flex: 'none',
                  borderRadius: 8,
                  background: `color-mix(in srgb, ${ACCENTS[t.variant]} 16%, transparent)`,
                  color: ACCENTS[t.variant],
                }}
              >
                <Icon size={15} strokeWidth={2.6} />
              </span>

              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 'var(--t-small)', lineHeight: 1.35 }}>
                  {t.message}
                </p>
                {t.detail && (
                  <p className="t-faint" style={{ fontSize: 'var(--t-micro)', marginTop: 2 }}>
                    {t.detail}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  color: 'var(--ink-faint)',
                  padding: 2,
                  flex: 'none',
                }}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};
