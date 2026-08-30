import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CarFront,
  Plus,
  ArrowRight,
  Clock,
  Users,
  Loader2,
  CalendarDays,
  MapPin,
  Check,
  Route,
} from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import {
  Avatar,
  Counter,
  EmptyState,
  MagneticButton,
  SectionHead,
  SeatPips,
  SkeletonGrid,
} from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { useSocketEvent } from '../../lib/socket.js';
import { listItemVariants, spring } from '../../lib/motion.js';
import { money, pluralize } from '../../lib/format.js';

export function CampusRide() {
  const { user, displayName, openAuth } = useAuth();
  const toast = useToast();

  const [view, setView] = useState('rides');
  const [rides, setRides] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postOpen, setPostOpen] = useState(false);
  const [joining, setJoining] = useState(null);

  const [joined, setJoined] = useState(() => new Set());
  const [rsvped, setRsvped] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, e] = await Promise.all([api.getRides(), api.getEvents()]);
      setRides(r);
      setEvents(e);
    } catch (err) {
      toast.error('Could not load rides and events', { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  /* The headline realtime feature: a seat taken on any device drops the
     counter here within the same tick. */
  const onSeatUpdate = useCallback(
    (payload) => {
      let announced = null;

      setRides((prev) =>
        prev.map((r) => {
          if (r.id !== payload.rideId) return r;
          // Only announce when the number genuinely moved, so our own join
          // does not double-toast.
          if (r.availableSeats !== payload.availableSeats) announced = { ...r, ...payload };
          return { ...r, availableSeats: payload.availableSeats };
        }),
      );

      if (announced && !joined.has(payload.rideId)) {
        toast.live('A seat was just taken', {
          detail:
            payload.availableSeats > 0
              ? `${pluralize(payload.availableSeats, 'seat')} left to ${announced.destination}.`
              : `The ride to ${announced.destination} is full.`,
        });
      }
    },
    [joined, toast],
  );

  useSocketEvent('ride:seat_updated', onSeatUpdate);

  async function handleJoin(ride) {
    if (!user) {
      openAuth();
      return;
    }

    setJoining(ride.id);

    // Optimistic seat decrement — reversed below if the server says it is full.
    setRides((prev) =>
      prev.map((r) =>
        r.id === ride.id ? { ...r, availableSeats: Math.max(0, r.availableSeats - 1) } : r,
      ),
    );

    try {
      const updated = await api.joinRide(ride.id, { passengerName: displayName });
      setRides((prev) => prev.map((r) => (r.id === ride.id ? { ...r, ...updated } : r)));
      setJoined((prev) => new Set(prev).add(ride.id));
      toast.success('Seat booked', {
        detail: `${ride.origin} → ${ride.destination}, ${money(ride.pricePerSeat)}.`,
      });
    } catch (err) {
      setRides((prev) =>
        prev.map((r) =>
          r.id === ride.id ? { ...r, availableSeats: Math.min(r.totalSeats, r.availableSeats + 1) } : r,
        ),
      );
      toast.error('Could not book that seat', { detail: err.message });
    } finally {
      setJoining(null);
    }
  }

  async function handlePostRide(payload) {
    const created = await api.createRide(payload);
    setRides((prev) => [created, ...prev]);
    setPostOpen(false);
    toast.success('Your ride is listed', { detail: 'Verified students can claim seats now.' });
  }

  async function handleRsvp(event) {
    if (!user) {
      openAuth();
      return;
    }
    // The API increments only — there is no un-RSVP route — so this is a
    // one-way action rather than a toggle.
    if (rsvped.has(event.id)) return;

    setRsvped((prev) => new Set(prev).add(event.id));
    setEvents((prev) =>
      prev.map((e) =>
        e.id === event.id ? { ...e, attendeesCount: (e.attendeesCount || 0) + 1 } : e,
      ),
    );

    try {
      const res = await api.rsvpEvent(event.id);
      if (res?.attendeesCount != null) {
        setEvents((prev) =>
          prev.map((e) => (e.id === event.id ? { ...e, attendeesCount: res.attendeesCount } : e)),
        );
      }
      toast.success(`You are going to ${event.title}`, { detail: event.dateTime });
    } catch (err) {
      setRsvped((prev) => {
        const next = new Set(prev);
        next.delete(event.id);
        return next;
      });
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id
            ? { ...e, attendeesCount: Math.max(0, (e.attendeesCount || 1) - 1) }
            : e,
        ),
      );
      toast.error('Could not save your RSVP', { detail: err.message });
    }
  }

  const seatsLeft = rides.reduce((sum, r) => sum + (r.availableSeats || 0), 0);

  return (
    <div className="accent-mint stack-lg">
      <SectionHead
        eyebrow="Module 03 · CampusRide & Events"
        title="Share the fare, and the calendar"
        subtitle={`${seatsLeft} open ${seatsLeft === 1 ? 'seat' : 'seats'} right now. Seat counts sync live across every device watching.`}
        action={
          <MagneticButton
            className="btn btn-primary"
            onClick={() => (user ? setPostOpen(true) : openAuth())}
          >
            <Plus size={16} strokeWidth={2.8} />
            Offer a ride
          </MagneticButton>
        }
      />

      {/* View switch */}
      <div
        className="row"
        style={{
          gap: 2,
          padding: 4,
          borderRadius: 'var(--r-pill)',
          border: 'var(--line-width) solid var(--line)',
          background: 'var(--surface-2)',
          alignSelf: 'flex-start',
        }}
      >
        {[
          { id: 'rides', label: 'Carpools', icon: CarFront, count: rides.length },
          { id: 'events', label: 'Events', icon: CalendarDays, count: events.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = view === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 17px',
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
                  layoutId="ride-view-indicator"
                  transition={spring.layout}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 'var(--r-pill)',
                    background: 'var(--accent-soft)',
                  }}
                />
              )}
              <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Icon size={15} strokeWidth={2.4} />
                {tab.label}
                <span className="t-num" style={{ opacity: 0.6, fontSize: '0.72rem' }}>
                  {tab.count}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24 }}
        >
          {loading ? (
            <SkeletonGrid count={3} height={220} />
          ) : view === 'rides' ? (
            rides.length === 0 ? (
              <EmptyState
                icon={Route}
                title="No carpools posted yet"
                hint="Heading to the station this weekend? Offer the empty seats."
              />
            ) : (
              <div className="grid-cards">
                {rides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    joined={joined.has(ride.id)}
                    busy={joining === ride.id}
                    onJoin={() => handleJoin(ride)}
                  />
                ))}
              </div>
            )
          ) : events.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nothing on the calendar" hint="Post the next fest, match or open mic." />
          ) : (
            <div className="grid-cards">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  going={rsvped.has(event.id)}
                  onRsvp={() => handleRsvp(event)}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <PostRideModal open={postOpen} onClose={() => setPostOpen(false)} onSubmit={handlePostRide} />
    </div>
  );
}

/* ==========================================================================
   Ride card
   ========================================================================== */

function RideCard({ ride, joined, busy, onJoin }) {
  const full = ride.availableSeats <= 0;
  const scarce = ride.availableSeats === 1;

  return (
    <motion.article
      layout
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="card-pop card-topline"
      whileHover={{ y: -3 }}
      transition={spring.snappy}
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* Route */}
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <div
          aria-hidden="true"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 5 }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              border: '2.5px solid var(--accent)',
            }}
          />
          <span style={{ width: 2, height: 26, background: 'var(--line)' }} />
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--accent)' }} />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 'var(--t-small)', lineHeight: 1.5 }}>{ride.origin}</p>
          <p style={{ fontWeight: 700, fontSize: 'var(--t-small)', lineHeight: 1.5, marginTop: 18 }}>
            {ride.destination}
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p className="t-num" style={{ fontSize: '1.2rem' }}>
            {money(ride.pricePerSeat)}
          </p>
          <p className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
            per seat
          </p>
        </div>
      </div>

      <div className="row wrap" style={{ gap: 8 }}>
        <span className="badge badge-outline">
          <Clock size={11} strokeWidth={2.6} />
          {ride.departureTime}
        </span>
        <span className="row" style={{ gap: 7 }}>
          <Avatar name={ride.driverName} size={22} />
          <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
            {ride.driverName}
          </span>
        </span>
      </div>

      {/* Live seat counter */}
      <div
        className="card-inset row-between"
        style={{
          padding: '12px 14px',
          borderColor: full ? 'var(--line)' : scarce ? 'var(--sun)' : 'var(--line)',
        }}
      >
        <div className="row" style={{ gap: 10 }}>
          <Users size={15} className="t-faint" />
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <Counter
              value={ride.availableSeats}
              className="t-num"
              style={{ fontSize: '1.15rem', color: full ? 'var(--ink-faint)' : 'var(--accent)' }}
            />
            <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
              of {ride.totalSeats} left
            </span>
          </span>
        </div>

        <SeatPips total={ride.totalSeats} available={ride.availableSeats} />
      </div>

      {scarce && !full && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="row"
          style={{ gap: 6, fontSize: 'var(--t-micro)', fontWeight: 700, color: 'var(--sun)' }}
        >
          <span className="dot-live" style={{ background: 'var(--sun)' }} />
          Last seat — this one usually goes fast
        </motion.p>
      )}

      <button
        type="button"
        className={joined ? 'btn btn-ghost btn-block' : 'btn btn-primary btn-block'}
        onClick={onJoin}
        disabled={full || joined || busy}
      >
        {busy ? (
          <Loader2 size={15} className="spin" />
        ) : joined ? (
          <Check size={15} strokeWidth={3} />
        ) : (
          <ArrowRight size={15} strokeWidth={2.8} />
        )}
        {busy ? 'Booking…' : joined ? 'Seat booked' : full ? 'Fully booked' : 'Claim a seat'}
      </button>
    </motion.article>
  );
}

/* ==========================================================================
   Event card
   ========================================================================== */

function EventCard({ event, going, onRsvp }) {
  return (
    <motion.article
      layout
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="card-pop card-topline"
      whileHover={{ y: -3 }}
      transition={spring.snappy}
      style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div className="row-between" style={{ gap: 10, alignItems: 'flex-start' }}>
        <span className="badge">{event.category}</span>
        <span className="badge badge-outline">
          <CalendarDays size={11} strokeWidth={2.6} />
          {event.dateTime}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.02rem', lineHeight: 1.3, marginBottom: 6 }}>{event.title}</h3>
        <p className="t-muted" style={{ fontSize: 'var(--t-small)' }}>
          {event.description}
        </p>
      </div>

      <p className="row t-faint" style={{ gap: 6, fontSize: 'var(--t-micro)' }}>
        <MapPin size={12} strokeWidth={2.4} />
        {event.venue}
      </p>

      <div className="row-between" style={{ gap: 12 }}>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <Counter value={event.attendeesCount} className="t-num" style={{ fontSize: '1.1rem' }} />
          <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
            going
          </span>
        </span>

        <button
          type="button"
          className={going ? 'btn btn-soft btn-sm' : 'btn btn-ghost btn-sm'}
          onClick={onRsvp}
          disabled={going}
          aria-pressed={going}
        >
          {going ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
          {going ? "I'm going" : 'Count me in'}
        </button>
      </div>
    </motion.article>
  );
}

/* ==========================================================================
   Post a ride
   ========================================================================== */

function PostRideModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    origin: '',
    destination: '',
    departureTime: '',
    totalSeats: 3,
    pricePerSeat: 80,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ origin: '', destination: '', departureTime: '', totalSeats: 3, pricePerSeat: 80 });
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
      await onSubmit({
        ...form,
        totalSeats: Number(form.totalSeats),
        pricePerSeat: Number(form.pricePerSeat),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Offer a ride" subtitle="Split the fare with students heading the same way.">
      <form onSubmit={submit} className="stack accent-mint" style={{ paddingBottom: 20 }}>
        <div className="field">
          <label className="field-label" htmlFor="ride-origin">
            Picking up from
          </label>
          <input id="ride-origin" className="input" value={form.origin} onChange={set('origin')} placeholder="Main Campus Gate" required />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ride-dest">
            Heading to
          </label>
          <input id="ride-dest" className="input" value={form.destination} onChange={set('destination')} placeholder="City Centre Metro" required />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="ride-time">
            When
          </label>
          <input id="ride-time" className="input" value={form.departureTime} onChange={set('departureTime')} placeholder="Today, 5:30 PM" required />
        </div>

        <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
          <div className="field grow">
            <label className="field-label" htmlFor="ride-seats">
              Seats offered
            </label>
            <input id="ride-seats" className="input t-num" type="number" min={1} max={8} value={form.totalSeats} onChange={set('totalSeats')} required />
          </div>
          <div className="field grow">
            <label className="field-label" htmlFor="ride-price">
              Price per seat (₹)
            </label>
            <input id="ride-price" className="input t-num" type="number" min={0} value={form.pricePerSeat} onChange={set('pricePerSeat')} required />
          </div>
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
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <Loader2 size={15} className="spin" /> : <CarFront size={15} strokeWidth={2.6} />}
            {busy ? 'Posting…' : 'Post the ride'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
