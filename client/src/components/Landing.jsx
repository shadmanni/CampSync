import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  MousePointerClick,
  MailCheck,
  KeyRound,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { MODULES } from '../lib/modules.js';
import { spring, inView, revealVariants, staggerParent } from '../lib/motion.js';
import { MagneticButton, Reveal, TiltCard, Counter } from './ui.jsx';

/* Rotating pain points — the problem statement, said out loud. */
const FRAGMENTS = [
  '4 WhatsApp groups',
  '2 notice boards',
  'a dead Facebook page',
  'someone’s Google Sheet',
  'a poster nobody photographed',
  '“check the senior’s story”',
  'an Instagram meme page',
  'a forwarded PDF',
];

export function Landing({ onEnter, onExplore }) {
  const heroRef = useRef(null);

  /* Hero parallax. `offset` maps the hero's travel through the viewport to
     0 → 1, so every layer below can be driven off one scroll subscription. */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // A spring on the progress value smooths the last few pixels of wheel jitter
  // that Lenis has not yet absorbed.
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.5 });

  const titleY = useTransform(p, [0, 1], [0, -110]);
  const titleOpacity = useTransform(p, [0, 0.65], [1, 0]);
  const subY = useTransform(p, [0, 1], [0, -190]);
  const cardsY = useTransform(p, [0, 1], [0, -280]);
  const cueOpacity = useTransform(p, [0, 0.16], [1, 0]);

  return (
    <div>
      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          minHeight: 'min(94vh, 900px)',
          display: 'flex',
          alignItems: 'center',
          paddingBlock: 'clamp(48px, 9vh, 110px)',
        }}
      >
        <div className="shell" style={{ width: '100%' }}>
          <motion.div
            variants={staggerParent(0.09)}
            initial="hidden"
            animate="visible"
            style={{ maxWidth: '20ch' }}
          >
            <motion.p
              variants={revealVariants}
              className="badge"
              style={{ marginBottom: 22, background: 'var(--sun-soft)', color: 'var(--ink)' }}
            >
              <Sparkles size={12} strokeWidth={2.8} />
              Campus-verified · students only
            </motion.p>

            {/* Parallax lives on the wrapper and the entrance on the heading:
                if both drove `y` on one element they would fight. */}
            <motion.div style={{ y: titleY, opacity: titleOpacity }}>
              <motion.h1 variants={revealVariants} className="t-hero" style={{ maxWidth: '14ch' }}>
                One app.
                <br />
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  Whole
                  <Underline />
                </span>{' '}
                campus.
              </motion.h1>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: subY }}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring.soft, delay: 0.35 }}
            >
            <p
              className="t-muted"
              style={{
                maxWidth: '46ch',
                marginTop: 26,
                fontSize: 'clamp(1rem, 1.5vw, 1.15rem)',
                lineHeight: 1.6,
              }}
            >
              Everything that happens on campus currently lives in eight places at once.
              CampusSync puts the feed, the marketplace, the carpools and the deals behind
              one college-email login — so you can actually trust who is on the other side.
            </p>

            <div className="row wrap" style={{ gap: 12, marginTop: 30 }}>
              <MagneticButton className="btn btn-primary btn-lg" onClick={onEnter}>
                <ShieldCheck size={17} strokeWidth={2.6} />
                Verify your campus email
              </MagneticButton>

              <button type="button" className="btn btn-ghost btn-lg" onClick={onExplore}>
                <MousePointerClick size={16} strokeWidth={2.4} />
                Look around first
              </button>
            </div>

            <p
              className="t-faint"
              style={{ marginTop: 14, fontSize: 'var(--t-micro)', fontFamily: 'var(--font-mono)' }}
            >
              Prototype OTP is 123456 — no real mail is sent.
            </p>
            </motion.div>
          </motion.div>

          {/* Floating module cards, parallaxing faster than the copy. */}
          <motion.div
            style={{ y: cardsY, marginTop: 'clamp(44px, 7vh, 76px)' }}
            className="grid-cards"
          >
            {MODULES.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 40, rotate: i % 2 ? 1.2 : -1.2 }}
                animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 }}
                transition={{ ...spring.soft, delay: 0.5 + i * 0.09 }}
              >
                <HeroModuleCard module={m} onClick={onExplore} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          style={{
            opacity: cueOpacity,
            position: 'absolute',
            left: '50%',
            bottom: 18,
            translateX: '-50%',
          }}
          aria-hidden="true"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            className="t-faint row"
            style={{ fontSize: 'var(--t-micro)', fontFamily: 'var(--font-mono)', gap: 6 }}
          >
            <ChevronDown size={14} />
            scroll
          </motion.div>
        </motion.div>
      </section>

      {/* ================= PROBLEM MARQUEE ================= */}
      <section style={{ paddingBlock: 'clamp(28px, 6vh, 56px)' }}>
        <Reveal>
          <p
            className="t-eyebrow shell"
            style={{ marginBottom: 16, color: 'var(--ink-faint)' }}
          >
            Right now your campus lives in
          </p>
        </Reveal>

        <Marquee items={FRAGMENTS} />
      </section>

      {/* ================= MODULE SCROLLYTELLING ================= */}
      <ModuleShowcase />

      {/* ================= TRUST / VERIFICATION ================= */}
      <VerificationSection onEnter={onEnter} />

      {/* ================= CLOSING CTA ================= */}
      <section className="shell" style={{ paddingBlock: 'clamp(60px, 11vh, 130px)' }}>
        <Reveal>
          <div
            className="card-pop"
            style={{
              padding: 'clamp(30px, 6vw, 64px)',
              textAlign: 'center',
              background: 'var(--surface)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(28rem 18rem at 50% 0%, color-mix(in srgb, var(--violet) 16%, transparent), transparent 70%)',
              }}
            />
            <div style={{ position: 'relative' }}>
              <h2 className="t-display" style={{ maxWidth: '16ch', marginInline: 'auto' }}>
                Built by 8 students who got tired of scrolling four group chats.
              </h2>
              <p
                className="t-muted"
                style={{ maxWidth: '48ch', marginInline: 'auto', marginTop: 16 }}
              >
                CampusSync is a CPI team project — a working prototype with real auth, a real
                API and live realtime updates behind every module.
              </p>
              <div
                className="row wrap"
                style={{ justifyContent: 'center', gap: 12, marginTop: 28 }}
              >
                <MagneticButton className="btn btn-primary btn-lg" onClick={onEnter}>
                  Get verified
                  <ArrowRight size={16} strokeWidth={2.6} />
                </MagneticButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}

/* ==========================================================================
   Pieces
   ========================================================================== */

/** Hand-drawn-feeling underline that draws itself once on entry. */
function Underline() {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 220 18"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: '-2%',
        bottom: '-0.12em',
        width: '104%',
        height: '0.26em',
        overflow: 'visible',
      }}
    >
      <motion.path
        d="M3 12C48 5 118 4 217 9"
        fill="none"
        stroke="var(--coral)"
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.svg>
  );
}

function HeroModuleCard({ module, onClick }) {
  const Icon = module.icon;
  return (
    <TiltCard
      className={`card-pop is-interactive ${module.accent}`}
      style={{ padding: 22, cursor: 'pointer', height: '100%' }}
      onClick={onClick}
      max={7}
    >
      <span
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          marginBottom: 16,
        }}
      >
        <Icon size={20} strokeWidth={2.3} />
      </span>

      <h3 style={{ fontSize: '1.05rem', marginBottom: 5 }}>{module.label}</h3>
      <p className="t-muted" style={{ fontSize: 'var(--t-small)' }}>
        {module.tagline}
      </p>
    </TiltCard>
  );
}

/** Infinite ticker. The track is duplicated so the loop has no visible seam. */
function Marquee({ items }) {
  const row = (
    <div className="marquee-track">
      {items.map((text, i) => (
        <span
          key={i}
          className="row"
          style={{
            gap: 'var(--gap-lg)',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.4rem, 3.4vw, 2.6rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: i % 2 ? 'var(--ink-faint)' : 'var(--ink)',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
          <span aria-hidden="true" style={{ color: 'var(--coral)' }}>
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" aria-label={items.join(', ')}>
      {row}
      <div aria-hidden="true" style={{ display: 'contents' }}>
        {row}
      </div>
    </div>
  );
}

/**
 * Sticky scroll showcase.
 *
 * The section is four viewports tall; the panel inside it is pinned for the
 * whole run, and scroll progress picks which module is on screen. Scrolling
 * therefore *drives* the content rather than just moving past it.
 */
function ModuleShowcase() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      ref={ref}
      style={{ position: 'relative', height: `${MODULES.length * 100}vh` }}
      aria-label="What is inside CampusSync"
    >
      <div
        style={{
          position: 'sticky',
          top: 'var(--nav-h)',
          height: `calc(100vh - var(--nav-h))`,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div className="shell" style={{ width: '100%' }}>
          <div
            style={{
              display: 'grid',
              gap: 'clamp(20px, 5vw, 64px)',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              alignItems: 'center',
            }}
          >
            {/* Left: the stack of module panels, only one visible at a time */}
            <div style={{ position: 'relative', minHeight: 'clamp(320px, 46vh, 420px)' }}>
              {MODULES.map((m, i) => (
                <ShowcasePanel
                  key={m.id}
                  module={m}
                  index={i}
                  total={MODULES.length}
                  progress={scrollYProgress}
                />
              ))}
            </div>

            {/* Right: progress rail */}
            <ShowcaseRail progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcasePanel({ module, index, total, progress }) {
  const slice = 1 / total;
  const start = index * slice;

  // Each panel owns one slice of the scroll and cross-fades at the edges.
  const opacity = useTransform(
    progress,
    [start - slice * 0.42, start + slice * 0.14, start + slice * 0.72, start + slice * 1.05],
    [0, 1, 1, 0],
  );
  const y = useTransform(progress, [start - slice * 0.4, start + slice * 0.9], [46, -46]);
  const scale = useTransform(progress, [start - slice * 0.4, start + slice * 0.2], [0.96, 1]);

  const Icon = module.icon;

  return (
    <motion.div
      className={module.accent}
      style={{
        opacity,
        y,
        scale,
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        // Hidden panels must not swallow clicks meant for the visible one.
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          display: 'inline-grid',
          placeItems: 'center',
          width: 52,
          height: 52,
          borderRadius: 15,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          marginBottom: 20,
        }}
      >
        <Icon size={25} strokeWidth={2.2} />
      </span>

      <p className="t-eyebrow" style={{ marginBottom: 10 }}>
        0{index + 1} — {module.tagline}
      </p>

      <h2 className="t-display" style={{ marginBottom: 14 }}>
        {module.label}
      </h2>

      <p className="t-muted" style={{ maxWidth: '44ch', fontSize: '1.02rem' }}>
        {module.blurb}
      </p>

      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginTop: 24,
        }}
      >
        {module.highlights.map((h) => (
          <li key={h} className="badge badge-outline">
            {h}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/** Vertical rail whose fill tracks scroll progress through the showcase. */
function ShowcaseRail({ progress }) {
  const scaleY = useSpring(progress, { stiffness: 180, damping: 34 });

  return (
    <div className="hide-sm" style={{ display: 'flex', gap: 22, alignItems: 'stretch' }}>
      <div
        style={{
          position: 'relative',
          width: 4,
          borderRadius: 999,
          background: 'var(--line)',
          overflow: 'hidden',
          minHeight: 300,
        }}
      >
        <motion.div
          style={{
            scaleY,
            transformOrigin: 'top',
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            background: 'linear-gradient(180deg, var(--violet), var(--coral), var(--mint), var(--sky))',
          }}
        />
      </div>

      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingBlock: 6,
          minHeight: 300,
        }}
      >
        {MODULES.map((m, i) => (
          <RailLabel key={m.id} module={m} index={i} total={MODULES.length} progress={progress} />
        ))}
      </ul>
    </div>
  );
}

function RailLabel({ module, index, total, progress }) {
  const slice = 1 / total;
  const center = index * slice + slice * 0.4;
  const opacity = useTransform(
    progress,
    [center - slice * 0.62, center, center + slice * 0.62],
    [0.32, 1, 0.32],
  );
  const x = useTransform(progress, [center - slice * 0.62, center, center + slice * 0.62], [0, 8, 0]);

  return (
    <motion.li
      style={{
        opacity,
        x,
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: '1.05rem',
        letterSpacing: '-0.02em',
        color: module.color,
      }}
    >
      {module.label}
    </motion.li>
  );
}

const STEPS = [
  {
    icon: MailCheck,
    title: 'Enter your college email',
    body: 'Only addresses on an allow-listed campus domain get past this screen. No personal Gmail, no outsiders.',
  },
  {
    icon: KeyRound,
    title: 'Confirm the one-time code',
    body: 'A six-digit OTP proves the inbox is yours. The backend issues a signed JWT that every later request carries.',
  },
  {
    icon: ShieldCheck,
    title: 'You are a verified student',
    body: 'Post anonymously if you want — the display name is hidden, but the account behind it is never anonymous to moderation.',
  },
];

function VerificationSection({ onEnter }) {
  return (
    <section
      className="shell"
      style={{ paddingBlock: 'clamp(70px, 12vh, 140px)' }}
      id="verification"
    >
      <Reveal>
        <p className="t-eyebrow" style={{ marginBottom: 12, color: 'var(--mint)' }}>
          The trust layer
        </p>
        <h2 className="t-display" style={{ maxWidth: '18ch' }}>
          Every single person here goes to your college.
        </h2>
        <p className="t-muted" style={{ maxWidth: '52ch', marginTop: 14 }}>
          That one constraint is what makes a campus marketplace and an anonymous confession
          feed safe enough to be worth using.
        </p>
      </Reveal>

      <motion.ol
        variants={staggerParent(0.12, 0.1)}
        initial="hidden"
        whileInView="visible"
        viewport={inView}
        className="grid-cards"
        style={{ listStyle: 'none', marginTop: 40 }}
      >
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.li key={s.title} variants={revealVariants}>
              <div className="card" style={{ padding: 24, height: '100%' }}>
                <div className="row-between" style={{ marginBottom: 18 }}>
                  <span
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'var(--mint-soft)',
                      color: 'var(--mint)',
                    }}
                  >
                    <Icon size={19} strokeWidth={2.3} />
                  </span>
                  <span
                    className="t-num"
                    style={{ fontSize: '1.9rem', color: 'var(--line)', lineHeight: 1 }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.02rem', marginBottom: 8 }}>{s.title}</h3>
                <p className="t-muted" style={{ fontSize: 'var(--t-small)' }}>
                  {s.body}
                </p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>

      <Reveal delay={0.1}>
        <div
          className="card-inset row-between wrap"
          style={{ marginTop: 28, padding: '20px 24px', gap: 20 }}
        >
          <StatBlock value={4} label="modules, one login" />
          <StatBlock value={8} label="students building it" />
          <StatBlock value={6} suffix=" wks" label="design to demo" />
          <button type="button" className="btn btn-ink" onClick={onEnter}>
            Try the flow
            <ArrowRight size={15} strokeWidth={2.6} />
          </button>
        </div>
      </Reveal>
    </section>
  );
}

function StatBlock({ value, suffix = '', label }) {
  return (
    <div>
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={inView}
        className="t-num"
        style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', lineHeight: 1 }}
      >
        <Counter value={value} suffix={suffix} />
      </motion.p>
      <p className="t-faint" style={{ fontSize: 'var(--t-micro)', marginTop: 4 }}>
        {label}
      </p>
    </div>
  );
}
