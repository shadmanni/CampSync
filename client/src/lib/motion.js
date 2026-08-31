/**
 * Shared motion vocabulary.
 *
 * Every animation in CampusSync pulls its spring from here rather than
 * inventing one inline. That is what makes the app feel like a single
 * physical object instead of a pile of independently-tuned components.
 */

/* ---- Springs --------------------------------------------------------------
   Tuned by feel, not by formula. `snappy` is the default for anything the
   user directly caused; `soft` is for things that move on their own. */
export const spring = {
  snappy: { type: 'spring', stiffness: 420, damping: 32, mass: 0.8 },
  soft: { type: 'spring', stiffness: 180, damping: 26, mass: 1 },
  bouncy: { type: 'spring', stiffness: 500, damping: 18, mass: 0.7 },
  gentle: { type: 'spring', stiffness: 120, damping: 20 },
  /* For layout/`layoutId` transitions — slightly over-damped so shared
     elements never overshoot into neighbouring content. */
  layout: { type: 'spring', stiffness: 380, damping: 36 },
};

export const easing = {
  out: [0.22, 1, 0.36, 1],
  inOut: [0.65, 0, 0.35, 1],
};

/* ---- Reveal ---------------------------------------------------------------
   Enter-on-scroll. Deliberately small travel (18px) — big slide-ups read as
   a template; small ones read as craft. */
export const revealVariants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: easing.out },
  },
};

/* Parent that staggers its children in. */
export const staggerParent = (stagger = 0.06, delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/* ---- Lists ----------------------------------------------------------------
   Used with <AnimatePresence> so removing a card collapses the gap smoothly
   instead of snapping the rest of the list upward. */
export const listItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.18, ease: easing.inOut },
  },
};

/* ---- Overlays ------------------------------------------------------------- */
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

export const dialogVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16 } },
};

/* Mobile bottom sheet — slides from the bottom edge and is drag-dismissible. */
export const sheetVariants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: spring.soft },
  exit: { y: '100%', transition: { duration: 0.22, ease: easing.inOut } },
};

/* ---- Page/tab transitions -------------------------------------------------
   Direction-aware: switching to a tab on the right slides content in from
   the right, so the nav feels like a physical filmstrip. */
export const pageVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: easing.out } },
  exit: (dir) => ({
    opacity: 0,
    x: dir > 0 ? -30 : 30,
    transition: { duration: 0.22, ease: easing.inOut },
  }),
};

/* Standard viewport config for whileInView — fires slightly before the
   element reaches the fold so content is already settled when it arrives. */
export const inView = { once: true, amount: 0.25, margin: '0px 0px -80px 0px' };
