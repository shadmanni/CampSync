import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Code,
  Palette,
  Music,
  Languages,
  User,
  Filter,
} from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import { Avatar, EmptyState, MagneticButton, SectionHead, SkeletonGrid } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { useSocketEvent } from '../../lib/socket.js';
import { listItemVariants, spring } from '../../lib/motion.js';

const CATEGORIES = [
  'All',
  'Tech & Coding',
  'Academics & Tutoring',
  'Design & Media',
  'Music & Arts',
  'Languages',
  'Other',
];

const TYPES = [
  { id: 'ALL', label: 'All Listings' },
  { id: 'OFFER', label: 'Offering Skill' },
  { id: 'REQUEST', label: 'Requesting Help' },
];

export function CampusSkills() {
  const { user, openAuth } = useAuth();
  const toast = useToast();

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSkills(await api.getSkills({ category, type: typeFilter, search: query }));
    } catch (err) {
      toast.error('Could not load skills directory', { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [category, typeFilter, query, toast]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time socket event for new skills
  const onRemoteSkill = useCallback(
    (skill) => {
      setSkills((prev) => {
        if (prev.some((s) => s.id === skill.id)) return prev;
        if (category !== 'All' && skill.category !== category) return prev;
        if (typeFilter !== 'ALL' && skill.type !== typeFilter) return prev;
        return [skill, ...prev];
      });
      toast.live('New skill listing posted', { detail: skill.title });
    },
    [category, typeFilter, toast],
  );

  useSocketEvent('skill:created', onRemoteSkill);

  const handleCopyContact = (skill) => {
    if (!skill.contact) return;
    navigator.clipboard?.writeText(skill.contact);
    setCopiedId(skill.id);
    toast.success('Contact info copied to clipboard!', { detail: skill.contact });
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteSkill(id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
      toast.success('Skill listing removed');
    } catch (err) {
      toast.error('Could not delete listing', { detail: err.message });
    }
  };

  return (
    <div className="accent-amber stack-lg">
      <SectionHead
        title="Share your expertise or get 1-on-1 peer tutoring"
        subtitle="Connect with fellow verified students for coding interview prep, design feedback, instrument lessons, and course assignments."
        action={
          <MagneticButton
            onClick={() => (user ? setCreateOpen(true) : openAuth())}
            className="btn btn-primary"
          >
            <Plus size={16} strokeWidth={2.8} />
            <span>Post a Skill</span>
          </MagneticButton>
        }
      />

      {/* Controls Bar */}
      <div className="panel stack" style={{ gap: '14px' }}>
        {/* Search Box */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={17}
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }}
          />
          <input
            type="text"
            className="input"
            placeholder="Search skills, topics, tools (e.g. Python, Figma, DSA)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: '40px', width: '100%' }}
          />
        </div>

        {/* Type Segmented Filter */}
        <div className="scroll-x">
          <div className="segmented">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`segmented-item ${typeFilter === t.id ? 'active' : ''}`}
                onClick={() => setTypeFilter(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="scroll-x">
          {CATEGORIES.map((c) => {
            const isActive = category === c;
            return (
              <button
                key={c}
                type="button"
                className={`pill ${isActive ? 'pill-active' : ''}`}
                onClick={() => setCategory(c)}
                style={{ flexShrink: 0 }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Grid */}
      {loading ? (
        <SkeletonGrid count={4} height={240} />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No skill listings found"
          hint={
            query || category !== 'All' || typeFilter !== 'ALL'
              ? 'Try adjusting your filters or search terms.'
              : 'Be the first student to offer tutoring or request skill help!'
          }
          action={
            <MagneticButton
              className="btn btn-primary"
              onClick={() => (user ? setCreateOpen(true) : openAuth())}
            >
              <Plus size={16} strokeWidth={2.8} />
              <span>Post First Skill</span>
            </MagneticButton>
          }
        />
      ) : (
        <motion.div layout className="grid-cards">
          <AnimatePresence mode="popLayout">
            {skills.map((s) => {
              const isOwner = user && (user.id === s.userId || user.email === s.contact);
              const isOffer = s.type === 'OFFER';

              return (
                <motion.article
                  key={s.id}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="card card-pop stack"
                  style={{
                    padding: '24px',
                    gap: '18px',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Top: Author + Type Badge + Delete if owner */}
                  <div className="stack" style={{ gap: '14px' }}>
                    <div className="row-between" style={{ alignItems: 'flex-start' }}>
                      <div className="row" style={{ gap: '12px' }}>
                        <Avatar name={s.userName} size={40} />
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--ink)' }}>
                            {s.userName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--ink-faint)', fontWeight: 600 }}>
                            {s.userDepartment || 'Student'} • {s.userHostel || 'Campus'}
                          </div>
                        </div>
                      </div>

                      <div className="row" style={{ gap: '6px' }}>
                        <span
                          className="badge"
                          style={{
                            background: isOffer ? 'var(--sun-soft)' : 'var(--violet-soft)',
                            color: isOffer ? 'var(--sun)' : 'var(--violet)',
                            borderColor: isOffer ? 'var(--sun)' : 'var(--violet)',
                          }}
                        >
                          {isOffer ? '⚡ OFFER' : '🙋 REQUEST'}
                        </span>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            className="btn btn-ghost btn-icon"
                            title="Delete listing"
                            style={{ color: 'var(--coral)', padding: '6px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="stack" style={{ gap: '8px' }}>
                      <h3 style={{ fontSize: '1.12rem', fontWeight: 800, lineHeight: 1.3, color: 'var(--ink)' }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--ink-soft)', lineHeight: 1.55 }}>
                        {s.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer info: Category, Pricing, Contact CTA */}
                  <div
                    className="row-between wrap"
                    style={{
                      paddingTop: '14px',
                      borderTop: '1.5px solid var(--line)',
                      gap: '12px',
                      alignItems: 'center',
                    }}
                  >
                    <div className="row wrap" style={{ gap: '8px' }}>
                      <span className="badge badge-secondary">{s.category}</span>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: 'var(--accent)',
                        }}
                      >
                        {s.pricing || 'Free Exchange'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyContact(s)}
                      className="btn btn-secondary btn-sm"
                    >
                      {copiedId === s.id ? <Check size={14} color="var(--mint)" strokeWidth={2.6} /> : <Copy size={14} />}
                      <span>{copiedId === s.id ? 'Copied!' : 'Contact Student'}</span>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Skill Modal */}
      <CreateSkillModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(newSkill) => {
          setSkills((prev) => [newSkill, ...prev]);
          setCreateOpen(false);
        }}
      />
    </div>
  );
}

function CreateSkillModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Tech & Coding');
  const [type, setType] = useState('OFFER');
  const [pricing, setPricing] = useState('₹200/hr');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !contact) {
      setContact(`${user.email} | ${user.hostel || 'Hostel'}`);
    }
  }, [user, contact]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contact.trim()) {
      toast.error('Please fill in title, description, and contact info');
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.createSkill({
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        pricing: pricing.trim() || 'Free Peer Exchange',
        contact: contact.trim(),
      });
      toast.success('Skill listing published!');
      onCreated(created);
      setTitle('');
      setDescription('');
    } catch (err) {
      toast.error('Could not post skill', { detail: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Post a Skill Offer or Request">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Listing Type Toggle */}
        <div>
          <label className="label">Listing Type</label>
          <div className="segmented" style={{ width: '100%' }}>
            <button
              type="button"
              className={`segmented-item ${type === 'OFFER' ? 'active' : ''}`}
              onClick={() => {
                setType('OFFER');
                if (pricing.includes('Offering')) setPricing('₹200/hr');
              }}
              style={{ flex: 1 }}
            >
              ⚡ Offering My Skill / Tutoring
            </button>
            <button
              type="button"
              className={`segmented-item ${type === 'REQUEST' ? 'active' : ''}`}
              onClick={() => {
                setType('REQUEST');
                setPricing('Offering ₹250 or free peer exchange');
              }}
              style={{ flex: 1 }}
            >
              🙋 Requesting Skill Help
            </button>
          </div>
        </div>

        <div>
          <label className="label">Skill Title</label>
          <input
            type="text"
            className="input"
            placeholder={type === 'OFFER' ? 'e.g., DSA & LeetCode Coaching, Figma UI Design' : 'e.g., Need help with Calculus II, Debugging React'}
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
            <label className="label">Pricing / Exchange Model</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. ₹200/hr, Free Exchange"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Description & What You'll Cover</label>
          <textarea
            className="textarea"
            rows={3}
            placeholder="Describe what you will teach, session duration, prerequisites, or specific assignment help needed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Your Contact Details (Visible to peers)</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. yourname@college.edu | Discord / WhatsApp / Hostel Room"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Publishing...' : 'Publish Listing'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
