import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckSquare,
  Search,
  Plus,
  Clock,
  MapPin,
  Coins,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Loader2,
  Package,
} from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import { Avatar, EmptyState, MagneticButton, SectionHead, SkeletonCard } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { useSocketEvent } from '../../lib/socket.js';
import { listItemVariants, spring } from '../../lib/motion.js';

const CATEGORIES = [
  'All',
  'Printout & Stationary',
  'Luggage & Moving',
  'Courier & Parcel',
  'Food Delivery',
  'Academic Help',
  'Errands',
];

const STATUS_FILTERS = [
  { id: 'ALL', label: 'All Gigs' },
  { id: 'OPEN', label: '🟢 Open Gigs' },
  { id: 'ASSIGNED', label: '🟡 In Progress' },
  { id: 'COMPLETED', label: '✅ Completed' },
];

export function CampusTasks() {
  const { user, openAuth } = useAuth();
  const toast = useToast();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTasks(await api.getTasks({ status: statusFilter, category }));
    } catch (err) {
      toast.error('Could not load campus tasks', { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [category, statusFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time socket events
  const onRemoteTaskCreated = useCallback(
    (newTask) => {
      setTasks((prev) => {
        if (prev.some((t) => t.id === newTask.id)) return prev;
        if (category !== 'All' && newTask.category !== category) return prev;
        if (statusFilter !== 'ALL' && statusFilter !== 'OPEN') return prev;
        return [newTask, ...prev];
      });
      toast.live('New campus gig posted', { detail: `${newTask.title} (₹${newTask.reward})` });
    },
    [category, statusFilter, toast],
  );

  const onRemoteTaskAssigned = useCallback(
    (payload) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === payload.taskId
            ? { ...t, status: 'ASSIGNED', assignedToName: payload.assignedToName }
            : t
        )
      );
      toast.live('Task claimed by a student runner', { detail: `Claimed by ${payload.assignedToName}` });
    },
    [toast],
  );

  const onRemoteTaskCompleted = useCallback(
    (payload) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === payload.taskId ? { ...t, status: 'COMPLETED' } : t))
      );
      toast.success('Task marked as completed!');
    },
    [toast],
  );

  useSocketEvent('task:created', onRemoteTaskCreated);
  useSocketEvent('task:assigned', onRemoteTaskAssigned);
  useSocketEvent('task:completed', onRemoteTaskCompleted);

  /**
   * ATOMIC TASK CLAIMING:
   * Button switches to "Claiming..." -> Calls server -> updates state only on server 200 OK.
   */
  const handleAcceptTask = async (taskId) => {
    if (!user) {
      openAuth();
      return;
    }

    setClaimingId(taskId);
    try {
      const res = await api.acceptTask(taskId, { assignedToName: user.name });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: 'ASSIGNED', assignedToName: user.name }
            : t
        )
      );
      toast.success('Task claimed successfully!', { detail: 'Please coordinate pickup & drop.' });
    } catch (err) {
      toast.error('Unable to claim task', { detail: err.message });
      // Re-fetch to synchronize state
      load();
    } finally {
      setClaimingId(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setCompletingId(taskId);
    try {
      await api.completeTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: 'COMPLETED' } : t))
      );
      toast.success('Task marked completed! Reward dispatched.');
    } catch (err) {
      toast.error('Could not complete task', { detail: err.message });
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="module-wrap">
      <SectionHead
        eyebrow="CampusTasks — Micro-Tasks & Campus Gigs"
        title="Get quick errands done or earn pocket money between classes."
        description="Post small paid gigs like library printouts, luggage shifts, or gate package pickups with upfront cash rewards and atomic runner assignment."
        action={
          <MagneticButton
            onClick={() => (user ? setCreateOpen(true) : openAuth())}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Post an Errand</span>
          </MagneticButton>
        }
      />

      {/* Filter Toolbar */}
      <div className="panel" style={{ padding: '14px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Status Filter Segmented */}
          <div className="segmented">
            {STATUS_FILTERS.map((sf) => (
              <button
                key={sf.id}
                type="button"
                className={`segmented-item ${statusFilter === sf.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(sf.id)}
              >
                {sf.label}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            Showing {tasks.length} active gig(s)
          </span>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingTop: '12px' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className={`pill ${category === c ? 'pill-active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="grid-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No errands found"
          description={
            category !== 'All' || statusFilter !== 'ALL'
              ? 'No tasks matching the selected filters.'
              : 'Need something picked up or moved? Post your errand and a peer will help!'
          }
          action={
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => (user ? setCreateOpen(true) : openAuth())}
            >
              <Plus size={15} />
              <span>Post First Task</span>
            </button>
          }
        />
      ) : (
        <motion.div layout className="grid-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => {
              const isOpen = task.status === 'OPEN';
              const isAssigned = task.status === 'ASSIGNED';
              const isCompleted = task.status === 'COMPLETED';
              const isCreator = user && (user.id === task.creatorId || user.name === task.creatorName);
              const isAssignee = user && (user.id === task.assignedToId || user.name === task.assignedToName);

              return (
                <motion.article
                  key={task.id}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="card card-pop"
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}
                >
                  {/* Top Bar: Creator + Reward Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Avatar name={task.creatorName} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.creatorName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          Hostel: {task.creatorHostel || 'Campus'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: '#34d399',
                        boxShadow: '0 0 12px rgba(16, 185, 129, 0.15)',
                      }}
                    >
                      <Coins size={15} />
                      <span>₹{task.reward}</span>
                    </div>
                  </div>

                  {/* Task Content */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-secondary">{task.category}</span>
                      <span
                        className="badge"
                        style={{
                          background: isOpen
                            ? 'rgba(16, 185, 129, 0.15)'
                            : isAssigned
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(99, 102, 241, 0.15)',
                          color: isOpen ? '#34d399' : isAssigned ? '#fbbf24' : '#818cf8',
                        }}
                      >
                        {task.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.02rem', fontWeight: 700, marginBottom: '6px', lineHeight: 1.3 }}>
                      {task.title}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {task.description}
                    </p>
                  </div>

                  {/* Pickup & Drop Details */}
                  <div
                    style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      border: '1px solid var(--border-glass)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <MapPin size={13} color="var(--accent-coral)" />
                      <span><strong>Pickup:</strong> {task.pickupLocation || 'Campus'}</span>
                      <ArrowRight size={12} style={{ opacity: 0.5 }} />
                      <span><strong>Drop:</strong> {task.dropLocation || 'Hostel'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-subtle)' }}>
                      <Clock size={13} color="var(--accent-amber)" />
                      <span><strong>Deadline:</strong> {task.deadline || 'Within 2 hours'}</span>
                    </div>
                  </div>

                  {/* Bottom Action / Status Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-glass)', marginTop: 'auto' }}>
                    {isAssigned && (
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                        Runner: {task.assignedToName || 'Assigned'}
                      </span>
                    )}
                    {isCompleted && (
                      <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                      {isOpen && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAcceptTask(task.id)}
                          disabled={claimingId === task.id}
                        >
                          {claimingId === task.id ? (
                            <>
                              <Loader2 size={13} className="spin" />
                              <span>Claiming...</span>
                            </>
                          ) : (
                            <>
                              <CheckSquare size={13} />
                              <span>Claim Task (₹{task.reward})</span>
                            </>
                          )}
                        </button>
                      )}

                      {isAssigned && (isCreator || isAssignee) && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={completingId === task.id}
                        >
                          {completingId === task.id ? 'Completing...' : 'Mark as Done'}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Post Task Modal */}
      <CreateTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateTaskModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState('80');
  const [category, setCategory] = useState('Printout & Stationary');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [deadline, setDeadline] = useState('Today before 6:00 PM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !dropLocation) {
      setDropLocation(`${user.hostel || 'Hostel Block'} Lobby`);
    }
  }, [user, dropLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reward) {
      toast.error('Please enter title, description, and reward amount');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createTask({
        title: title.trim(),
        description: description.trim(),
        reward: parseFloat(reward),
        category,
        pickupLocation: pickupLocation.trim() || 'Central Library',
        dropLocation: dropLocation.trim() || 'Hostel Block',
        deadline: deadline.trim() || 'Within 2 hours',
      });
      toast.success('Task published! Runners can now claim it.');
      onCreated(created);
      setTitle('');
      setDescription('');
    } catch (err) {
      toast.error('Could not post errand', { detail: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a Campus Errand / Task">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label className="label">Task Title</label>
          <input
            type="text"
            className="input"
            placeholder="e.g., Collect spiral binding printout, Shift study table to Room 204"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="grid-2" style={{ gap: '10px' }}>
          <div>
            <label className="label">Category</label>
            <select
              className="select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Cash Reward (₹ INR)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, opacity: 0.6 }}>
                ₹
              </span>
              <input
                type="number"
                className="input"
                min="10"
                step="5"
                placeholder="80"
                value={reward}
                onChange={(e) => setReward(e.target.value)}
                style={{ paddingLeft: '28px' }}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Task Instructions & Details</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Provide specific instructions, document details, or OTP pickup instructions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid-2" style={{ gap: '10px' }}>
          <div>
            <label className="label">Pickup Point</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Central Library Print Shop"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Drop Location</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. Hostel Block A Room 204"
              value={dropLocation}
              onChange={(e) => setDropLocation(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Deadline / Preferred Time</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. Today before 6:00 PM, Urgent within 1 hour"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Errand'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
