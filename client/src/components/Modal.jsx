import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { backdropVariants, dialogVariants, sheetVariants } from '../lib/motion.js';
import { lockScroll, useBodyScrollLock, useIsMobile } from '../lib/hooks.js';

/**
 * One overlay component with two physical behaviours.
 *
 * Desktop: a centred dialog that springs in from slightly below.
 * Mobile:  a bottom sheet you can throw downward to dismiss, because on a
 *          phone a modal that can only be closed by a small × in the corner is
 *          a thumb-reach problem.
 */
export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 520 }) {
  const isMobile = useIsMobile();
  const panelRef = useRef(null);

  useBodyScrollLock(open);

  // Body `overflow: hidden` alone does not stop Lenis' rAF loop, so the
  // inertial scroller has to be told to stand down while a dialog is up.
  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      // Minimal focus trap: keep Tab inside the dialog so a keyboard user
      // cannot wander into the frozen page behind it.
      const focusables = panelRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);

    // Move focus in on open, and hand it back to the trigger on close.
    const previouslyFocused = document.activeElement;
    const timer = setTimeout(() => {
      const target = panelRef.current?.querySelector(
        'input:not([type="hidden"]), textarea, button',
      );
      target?.focus();
    }, 60);

    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimeout(timer);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? 0 : 'clamp(16px, 4vw, 40px)',
            background: 'color-mix(in srgb, var(--ink) 56%, transparent)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={isMobile ? sheetVariants : dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            drag={isMobile ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={(_, info) => {
              // Either a decisive flick or a long drag closes it.
              if (info.offset.y > 130 || info.velocity.y > 620) onClose();
            }}
            className="card-pop"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: isMobile ? '100%' : maxWidth,
              maxHeight: isMobile ? '88vh' : 'min(86vh, 780px)',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              borderRadius: isMobile ? 'var(--r-xl) var(--r-xl) 0 0' : 'var(--r-xl)',
              borderWidth: isMobile ? '2px 0 0' : '2px',
              boxShadow: 'var(--shadow-hard-lg)',
              overflow: 'hidden',
            }}
          >
            {isMobile && (
              <div style={{ display: 'grid', placeItems: 'center', paddingTop: 10 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 42,
                    height: 4,
                    borderRadius: 999,
                    background: 'var(--line)',
                  }}
                />
              </div>
            )}

            <header
              className="row-between"
              style={{
                padding: isMobile ? '12px 20px 14px' : '22px 24px 16px',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.28rem' }}>{title}</h3>
                {subtitle && (
                  <p className="t-muted" style={{ fontSize: 'var(--t-small)', marginTop: 4 }}>
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-icon"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </header>

            <div
              // Lenis hijacks wheel events globally; this opts the dialog's own
              // scroll region back out so long forms scroll normally inside it.
              data-lenis-prevent="true"
              style={{
                padding: isMobile ? '0 20px calc(28px + env(safe-area-inset-bottom))' : '0 24px 8px',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                flex: 1,
              }}
            >
              {children}
            </div>

            {footer && (
              <footer
                style={{
                  padding: isMobile ? '14px 20px calc(20px + env(safe-area-inset-bottom))' : '16px 24px 22px',
                  borderTop: 'var(--line-width) solid var(--line)',
                  background: 'var(--surface)',
                }}
              >
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
