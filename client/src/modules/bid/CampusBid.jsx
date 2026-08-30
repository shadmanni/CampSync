import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gavel, Plus, TrendingUp, Timer, Loader2, PackageOpen, Flame } from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import {
  Counter,
  EmptyState,
  MagneticButton,
  SectionHead,
  SkeletonGrid,
  TiltCard,
} from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { useSocketEvent } from '../../lib/socket.js';
import { spring, listItemVariants } from '../../lib/motion.js';
import { money } from '../../lib/format.js';
import { burst } from '../../lib/confetti.js';

const QUICK_RAISES = [50, 100, 500];

/* The API sends a human string ("In 3 hours") and, on newer rows, a real
   `endsAt` timestamp. Prefer the timestamp; fall back to parsing the string so
   older seed rows still get a live countdown. */
function deadlineOf(item) {
  if (item.endsAt) {
    const t = new Date(item.endsAt).getTime();
    if (!Number.isNaN(t)) return t;
  }
  const m = /in\s+(\d+)\s*(minute|hour|day)/i.exec(item.expiresAt || '');
  if (!m) return null;
  const unit = { minute: 60_000, hour: 3_600_000, day: 86_400_000 }[m[2].toLowerCase()];
  return Date.now() + Number(m[1]) * unit;
}

/** Ticking countdown. One interval per card, cleared on unmount. */
function useCountdown(deadline) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;

  const left = deadline - now;
  if (left <= 0) return { text: 'Closed', urgent: true, expired: true };

  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);

  return {
    text: h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(s).padStart(2, '0')}`,
    urgent: left < 3_600_000,
    expired: false,
  };
}

export function CampusBid() {
  const { user, displayName, openAuth } = useAuth();
  const toast = useToast();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidTarget, setBidTarget] = useState(null);
  const [listOpen, setListOpen] = useState(false);

  /* Items where this browser currently holds the top bid — drives the
     "you're winning" / "you were outbid" states. */
  const [myBids, setMyBids] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.getItems());
    } catch (err) {
      toast.error('Could not load listings', { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  /* Someone, somewhere, raised a bid. */
  const onRemoteBid = useCallback(
    (payload) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === payload.itemId
            ? {
                ...it,
                currentBid: payload.currentBid,
                highestBidderName: payload.highestBidderName,
                bidCount: payload.bidCount,
              }
            : it,
        ),
      );

      // Only shout if it actually cost this user the lead.
      const wasMine = myBids.has(payload.itemId);
      const stillMine = payload.highestBidderName === displayName;

      if (wasMine && !stillMine) {
        setMyBids((prev) => {
          const next = new Set(prev);
          next.delete(payload.itemId);
          return next;
        });
        toast.error('You have been outbid', {
          detail: `New high bid is ${money(payload.currentBid)}.`,
        });
      } else if (!stillMine) {
        toast.live('New highest bid', { detail: money(payload.currentBid) });
      }
    },
    [myBids, displayName, toast],
  );

  useSocketEvent('bid:new_highest', onRemoteBid);

  async function handleBid(item, amount, originEl) {
    const res = await api.placeBid(item.id, { amount, bidderName: displayName });

    setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, ...res } : it)));
    setMyBids((prev) => new Set(prev).add(item.id));
    setBidTarget(null);

    burst(originEl);
    toast.success('Bid placed — you are winning', { detail: `${item.title} at ${money(amount)}` });
  }

  async function handleList(payload) {
    const created = await api.createItem(payload);
    setItems((prev) => [created, ...prev]);
    setListOpen(false);
    toast.success('Listing is live', { detail: 'Verified students can bid on it now.' });
  }

  const activeCount = items.filter((i) => i.status !== 'SOLD').length;

  return (
    <div className="accent-coral stack-lg">
      <SectionHead
        eyebrow="Module 02 · CampusBid"
        title="The campus marketplace, live"
        subtitle={`${activeCount} open ${activeCount === 1 ? 'auction' : 'auctions'}. Highest bid updates on every device the moment it changes.`}
        action={
          <MagneticButton
            className="btn btn-primary"
            onClick={() => (user ? setListOpen(true) : openAuth())}
          >
            <Plus size={16} strokeWidth={2.8} />
            List an item
          </MagneticButton>
        }
      />

      {loading ? (
        <SkeletonGrid count={4} height={230} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={PackageOpen}
          title="Nothing up for auction right now"
          hint="Textbooks, cycles, calculators — someone always needs yours."
        />
      ) : (
        <motion.div layout className="grid-cards">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isWinning={myBids.has(item.id)}
                onBid={() => (user ? setBidTarget(item) : openAuth())}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <BidModal item={bidTarget} onClose={() => setBidTarget(null)} onSubmit={handleBid} />
      <ListItemModal open={listOpen} onClose={() => setListOpen(false)} onSubmit={handleList} />
    </div>
  );
}

/* ==========================================================================
   Item card
   ========================================================================== */

function ItemCard({ item, isWinning, onBid }) {
  // Keyed on the timing fields only — a bid update must not restart the clock
  // for rows whose deadline is parsed from a relative string.
  const deadline = useMemo(
    () => deadlineOf(item),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.id, item.endsAt, item.expiresAt],
  );
  const countdown = useCountdown(deadline);

  // Flash the price when it changes from underneath us.
  const prevBid = useRef(item.currentBid);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (prevBid.current !== item.currentBid) {
      prevBid.current = item.currentBid;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [item.currentBid]);

  const closed = countdown?.expired || item.status === 'SOLD';

  return (
    <motion.div layout variants={listItemVariants} initial="hidden" animate="visible" exit="exit">
      <TiltCard
        className="card-pop is-interactive card-topline"
        style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}
        max={5}
      >
        <div className="row-between" style={{ gap: 10, alignItems: 'flex-start' }}>
          <span className="badge badge-outline">{item.category}</span>

          {countdown && (
            <span
              className="badge"
              style={{
                background: countdown.urgent ? 'var(--rose-soft)' : 'var(--surface-inset)',
                color: countdown.urgent ? 'var(--rose)' : 'var(--ink-soft)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {countdown.urgent && !countdown.expired ? (
                <Flame size={11} strokeWidth={2.8} />
              ) : (
                <Timer size={11} strokeWidth={2.6} />
              )}
              {countdown.text}
            </span>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.02rem', lineHeight: 1.3, marginBottom: 6 }}>{item.title}</h3>
          <p
            className="t-muted"
            style={{
              fontSize: 'var(--t-small)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {item.description}
          </p>
          <p className="t-faint" style={{ fontSize: 'var(--t-micro)', marginTop: 8 }}>
            Listed by {item.sellerName}
          </p>
        </div>

        {/* Price block */}
        <motion.div
          className="card-inset"
          animate={
            flash
              ? { backgroundColor: 'var(--accent-soft)', scale: [1, 1.02, 1] }
              : { backgroundColor: 'var(--surface-inset)', scale: 1 }
          }
          transition={{ duration: 0.5 }}
          style={{ padding: '13px 15px' }}
        >
          <div className="row-between" style={{ alignItems: 'flex-end' }}>
            <div>
              <p className="t-faint" style={{ fontSize: 'var(--t-micro)', marginBottom: 2 }}>
                Current highest bid
              </p>
              <p style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span className="t-num" style={{ fontSize: '0.95rem', color: 'var(--ink-soft)' }}>
                  ₹
                </span>
                <Counter
                  value={item.currentBid}
                  className="t-num"
                  style={{ fontSize: '1.5rem', lineHeight: 1.05 }}
                />
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
                {item.bidCount || 0} {item.bidCount === 1 ? 'bid' : 'bids'}
              </p>
              <p
                style={{
                  fontSize: 'var(--t-micro)',
                  fontWeight: 700,
                  color: isWinning ? 'var(--mint)' : 'var(--ink-soft)',
                  maxWidth: 130,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {isWinning ? 'You are winning' : item.highestBidderName || 'No bids yet'}
              </p>
            </div>
          </div>
        </motion.div>

        <button
          type="button"
          className={isWinning ? 'btn btn-ghost btn-block' : 'btn btn-primary btn-block'}
          onClick={onBid}
          disabled={closed}
        >
          <Gavel size={15} strokeWidth={2.6} />
          {closed ? 'Auction closed' : isWinning ? 'Raise your bid' : 'Place a bid'}
        </button>
      </TiltCard>
    </motion.div>
  );
}

/* ==========================================================================
   Bid modal
   ========================================================================== */

function BidModal({ item, onClose, onSubmit }) {
  const [amount, setAmount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submitRef = useRef(null);

  const minimum = (item?.currentBid || 0) + 1;

  useEffect(() => {
    if (item) {
      // Open pre-filled at the smallest quick-raise: one tap to a valid bid.
      setAmount(item.currentBid + QUICK_RAISES[0]);
      setError('');
    }
  }, [item]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;

    if (!Number.isFinite(amount) || amount < minimum) {
      setError(`Your bid has to beat ${money(item.currentBid)}.`);
      return;
    }

    setBusy(true);
    setError('');
    try {
      await onSubmit(item, amount, submitRef.current);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={Boolean(item)}
      onClose={onClose}
      title="Place your bid"
      subtitle={item?.title}
      maxWidth={440}
    >
      {item && (
        <form onSubmit={submit} className="stack accent-coral" style={{ paddingBottom: 20 }}>
          <div className="card-inset row-between" style={{ padding: '14px 16px' }}>
            <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
              Current highest
            </span>
            <span className="t-num" style={{ fontSize: '1.1rem' }}>
              {money(item.currentBid)}
            </span>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="bid-amount">
              Your bid (minimum {money(minimum)})
            </label>
            <input
              id="bid-amount"
              className="input t-num"
              type="number"
              inputMode="numeric"
              min={minimum}
              value={amount}
              onChange={(e) => {
                setAmount(Number(e.target.value));
                setError('');
              }}
              style={{ fontSize: '1.25rem', padding: '14px 15px' }}
              required
            />
          </div>

          <div className="row" style={{ gap: 8 }}>
            {QUICK_RAISES.map((step) => (
              <button
                key={step}
                type="button"
                className="btn btn-soft grow"
                onClick={() => {
                  setAmount(item.currentBid + step);
                  setError('');
                }}
              >
                <TrendingUp size={13} strokeWidth={2.8} />+₹{step}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                role="alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ color: 'var(--rose)', fontSize: 'var(--t-small)', fontWeight: 600 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            ref={submitRef}
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={busy || amount < minimum}
          >
            {busy ? <Loader2 size={16} className="spin" /> : <Gavel size={16} strokeWidth={2.6} />}
            {busy ? 'Placing…' : `Bid ${money(amount || 0)}`}
          </button>

          <p className="t-faint" style={{ fontSize: 'var(--t-micro)', textAlign: 'center' }}>
            The seller sees your verified name. Bids are binding on campus honour code.
          </p>
        </form>
      )}
    </Modal>
  );
}

/* ==========================================================================
   New listing
   ========================================================================== */

function ListItemModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    startingPrice: '',
    category: 'Books',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ title: '', description: '', startingPrice: '', category: 'Books' });
      setError('');
    }
  }, [open]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit({ ...form, startingPrice: Number(form.startingPrice) });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="List something for auction" subtitle="Open to verified students on your campus only.">
      <form onSubmit={submit} className="stack" style={{ paddingBottom: 20 }}>
        <div className="field">
          <label className="field-label" htmlFor="item-title">
            What are you selling?
          </label>
          <input
            id="item-title"
            className="input"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Engineering Mathematics, 8th edition"
            required
          />
        </div>

        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <div className="field grow">
            <label className="field-label" htmlFor="item-price">
              Starting price (₹)
            </label>
            <input
              id="item-price"
              className="input t-num"
              type="number"
              min={1}
              value={form.startingPrice}
              onChange={set('startingPrice')}
              placeholder="400"
              required
            />
          </div>

          <div className="field grow">
            <label className="field-label" htmlFor="item-category">
              Category
            </label>
            <select id="item-category" className="input" value={form.category} onChange={set('category')}>
              {['Books', 'Electronics', 'Furniture', 'Transport', 'Other'].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="item-desc">
            Condition & pickup
          </label>
          <textarea
            id="item-desc"
            className="input"
            value={form.description}
            onChange={set('description')}
            placeholder="Be honest about wear. Say where on campus you can hand it over."
          />
        </div>

        {error && (
          <p role="alert" style={{ color: 'var(--rose)', fontSize: 'var(--t-small)', fontWeight: 600 }}>
            {error}
          </p>
        )}

        <div className="row" style={{ gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !form.title.trim() || !form.startingPrice}>
            {busy ? <Loader2 size={15} className="spin" /> : <Gavel size={15} strokeWidth={2.6} />}
            {busy ? 'Listing…' : 'Open the auction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
