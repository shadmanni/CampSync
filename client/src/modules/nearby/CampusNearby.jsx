import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Check, Copy, MapPin, Users, Compass, CalendarClock } from 'lucide-react';
import { EmptyState, SectionHead, SkeletonGrid } from '../../components/ui.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { listItemVariants, spring } from '../../lib/motion.js';

const SOURCES = [
  { id: 'all', label: 'Everything' },
  { id: 'partner', label: 'Official partners' },
  { id: 'community', label: 'Found by students' },
];

export function CampusNearby() {
  const toast = useToast();

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [category, setCategory] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDeals(await api.getDeals());
    } catch (err) {
      toast.error('Could not load nearby deals', { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(deals.map((d) => d.category).filter(Boolean)))],
    [deals],
  );

  const visible = deals.filter((d) => {
    if (source === 'partner' && !d.isPartner) return false;
    if (source === 'community' && d.isPartner) return false;
    if (category !== 'All' && d.category !== category) return false;
    return true;
  });

  async function copyCode(deal) {
    try {
      await navigator.clipboard.writeText(deal.code);
      setCopiedId(deal.id);
      setTimeout(() => setCopiedId((id) => (id === deal.id ? null : id)), 2200);
      toast.success(`${deal.code} copied`, { detail: `Show it at ${deal.businessName}.` });
    } catch {
      // Clipboard is blocked on insecure origins and in some in-app browsers.
      toast.info(`Your code is ${deal.code}`, { detail: 'Copying is blocked here — note it down.' });
    }
  }

  return (
    <div className="accent-sky stack-lg">
      <SectionHead
        eyebrow="Module 04 · CampusNearby"
        title="Student pricing, within walking distance"
        subtitle="Deals from verified campus partners, plus the ones students found first. Codes are one tap away."
      />

      {/* Filters */}
      <div className="stack" style={{ gap: 12 }}>
        <div
          className="row"
          style={{
            gap: 2,
            padding: 4,
            borderRadius: 'var(--r-pill)',
            border: 'var(--line-width) solid var(--line)',
            background: 'var(--surface-2)',
            alignSelf: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          {SOURCES.map((s) => {
            const isActive = source === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSource(s.id)}
                style={{
                  position: 'relative',
                  padding: '9px 16px',
                  border: 0,
                  borderRadius: 'var(--r-pill)',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: 'var(--t-small)',
                  fontWeight: 700,
                  color: isActive ? 'var(--accent)' : 'var(--ink-soft)',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="nearby-source"
                    transition={spring.layout}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--r-pill)',
                      background: 'var(--accent-soft)',
                    }}
                  />
                )}
                <span style={{ position: 'relative' }}>{s.label}</span>
              </button>
            );
          })}
        </div>

        {categories.length > 2 && (
          <div className="row" style={{ gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className="chip"
                data-active={category === c}
                onClick={() => setCategory(c)}
                style={{ position: 'relative' }}
              >
                {category === c && (
                  <motion.span
                    layoutId="nearby-chip"
                    transition={spring.layout}
                    style={{
                      position: 'absolute',
                      inset: -1,
                      borderRadius: 'var(--r-pill)',
                      background: 'var(--ink)',
                    }}
                  />
                )}
                <span style={{ position: 'relative' }}>{c}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <SkeletonGrid count={4} height={210} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="Nothing matches that filter"
          hint="Try 'Everything', or a different category."
        />
      ) : (
        <motion.div layout className="grid-cards">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                copied={copiedId === deal.id}
                onCopy={() => copyCode(deal)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function DealCard({ deal, copied, onCopy }) {
  return (
    <motion.article
      layout
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -3 }}
      transition={spring.snappy}
      className="card-pop"
      style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
    >
      {/* Discount banner — the number is the whole point, so it gets the space. */}
      <div
        style={{
          position: 'relative',
          padding: '18px 20px 16px',
          background: deal.isPartner ? 'var(--accent-soft)' : 'var(--surface-2)',
          borderBottom: '2px solid var(--line-strong)',
        }}
      >
        <div className="row-between" style={{ alignItems: 'flex-start', gap: 12 }}>
          <span
            className="badge"
            style={
              deal.isPartner
                ? { background: 'var(--surface)', color: 'var(--accent)' }
                : { background: 'var(--surface)', color: 'var(--ink-soft)' }
            }
          >
            {deal.isPartner ? <BadgeCheck size={12} strokeWidth={2.8} /> : <Users size={12} strokeWidth={2.8} />}
            {deal.isPartner ? 'Campus partner' : 'Found by a student'}
          </span>

          <p
            className="t-num"
            style={{
              fontSize: 'clamp(1.9rem, 5vw, 2.5rem)',
              lineHeight: 0.9,
              color: deal.isPartner ? 'var(--accent)' : 'var(--ink)',
              letterSpacing: '-0.04em',
            }}
          >
            {deal.discountPercent}
            <span style={{ fontSize: '0.44em', marginLeft: 2 }}>% off</span>
          </p>
        </div>
      </div>

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', lineHeight: 1.32, marginBottom: 6 }}>{deal.title}</h3>
          <p style={{ fontWeight: 700, fontSize: 'var(--t-small)' }}>{deal.businessName}</p>
        </div>

        <div className="row wrap" style={{ gap: 8 }}>
          <span className="badge badge-outline">
            <MapPin size={11} strokeWidth={2.6} />
            {deal.distance}
          </span>
          {deal.validUntil && (
            <span className="badge badge-outline">
              <CalendarClock size={11} strokeWidth={2.6} />
              {deal.validUntil}
            </span>
          )}
        </div>

        {/* Coupon stub */}
        <button
          type="button"
          onClick={onCopy}
          className="card-inset row-between"
          aria-label={`Copy promo code ${deal.code}`}
          style={{
            padding: '11px 14px',
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            borderStyle: 'dashed',
            borderWidth: 2,
          }}
        >
          <span>
            <span className="t-faint" style={{ display: 'block', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Promo code
            </span>
            <span className="t-num" style={{ fontSize: '1rem', letterSpacing: '0.06em' }}>
              {deal.code}
            </span>
          </span>

          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={copied ? 'done' : 'copy'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={spring.bouncy}
              className="row"
              style={{
                gap: 6,
                fontSize: 'var(--t-micro)',
                fontWeight: 700,
                color: copied ? 'var(--mint)' : 'var(--ink-soft)',
              }}
            >
              {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} strokeWidth={2.4} />}
              {copied ? 'Copied' : 'Copy'}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </motion.article>
  );
}
