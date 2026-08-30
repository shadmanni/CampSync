import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowBigUp,
  MessageCircle,
  Plus,
  Search,
  Send,
  Sparkles,
  VenetianMask,
  Loader2,
  Inbox,
} from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import { Avatar, EmptyState, MagneticButton, SectionHead, SkeletonCard } from '../../components/ui.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { useSocketEvent } from '../../lib/socket.js';
import { listItemVariants, spring } from '../../lib/motion.js';
import { pluralize, timeAgo } from '../../lib/format.js';

const CATEGORIES = ['All', 'Academic', 'Lost & Found', 'General', 'Confessions'];

export function CampusConnect() {
  const { user, displayName, openAuth } = useAuth();
  const toast = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [openThread, setOpenThread] = useState(null);

  /* Which posts this browser has upvoted. Kept client-side because the
     prototype API has no per-user vote record yet — it stops one person
     inflating a count by hammering the arrow. */
  const [voted, setVoted] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await api.getPosts(category));
    } catch (err) {
      toast.error('Could not load the feed', { detail: err.message });
    } finally {
      setLoading(false);
    }
  }, [category, toast]);

  useEffect(() => {
    load();
  }, [load]);

  /* A post created on another device drops straight into this feed. */
  const onRemotePost = useCallback(
    (post) => {
      setPosts((prev) => {
        if (prev.some((p) => p.id === post.id)) return prev;
        if (category !== 'All' && post.category !== category) return prev;
        return [post, ...prev];
      });
      toast.live('New post in the feed', { detail: post.title });
    },
    [category, toast],
  );

  useSocketEvent('connect:new_post', onRemotePost);

  const visible = posts.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q)
    );
  });

  async function handleUpvote(post) {
    if (voted.has(post.id)) return;

    // Optimistic: the arrow has to answer instantly or it feels broken.
    setVoted((prev) => new Set(prev).add(post.id));
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p)),
    );

    try {
      const res = await api.upvotePost(post.id);
      if (res?.upvotes != null) {
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, upvotes: res.upvotes } : p)));
      }
    } catch (err) {
      // Roll the optimistic change back rather than leaving a lie on screen.
      setVoted((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, upvotes: Math.max(0, (p.upvotes || 1) - 1) } : p)),
      );
      toast.error('Upvote did not save', { detail: err.message });
    }
  }

  async function handleCreate(payload) {
    const created = await api.createPost({ ...payload, authorName: displayName });
    setPosts((prev) => [created, ...prev]);
    setComposeOpen(false);
    toast.success('Posted to CampusConnect', {
      detail: payload.isAnonymous ? 'Your name is hidden on this one.' : undefined,
    });
  }

  async function handleComment(postId, text) {
    const comment = await api.addComment(postId, { content: text, authorName: displayName });
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), comment] } : p)),
    );
    setOpenThread((prev) =>
      prev?.id === postId ? { ...prev, comments: [...(prev.comments || []), comment] } : prev,
    );
  }

  return (
    <div className="accent-violet stack-lg">
      <SectionHead
        eyebrow="Module 01 · CampusConnect"
        title="What your campus is talking about"
        subtitle="Every account here passed college-email verification. Post under your name, or anonymously when it matters."
        action={
          <MagneticButton
            className="btn btn-primary"
            onClick={() => (user ? setComposeOpen(true) : openAuth())}
          >
            <Plus size={16} strokeWidth={2.8} />
            New post
          </MagneticButton>
        }
      />

      {/* ---- Filters ---- */}
      <div className="row wrap" style={{ gap: 10, justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIES.map((c) => {
            const isActive = category === c;
            return (
              <button
                key={c}
                type="button"
                className="chip"
                data-active={isActive}
                onClick={() => setCategory(c)}
                style={{ position: 'relative' }}
              >
                {isActive && (
                  <motion.span
                    layoutId="connect-chip"
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
            );
          })}
        </div>

        <label
          className="row"
          style={{
            gap: 8,
            padding: '0 14px',
            borderRadius: 'var(--r-pill)',
            border: 'var(--line-width) solid var(--line)',
            background: 'var(--surface)',
            minWidth: 210,
          }}
        >
          <Search size={15} className="t-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the feed"
            aria-label="Search posts"
            style={{
              border: 0,
              outline: 'none',
              background: 'none',
              padding: '10px 0',
              width: '100%',
              fontSize: 'var(--t-small)',
            }}
          />
        </label>
      </div>

      {/* ---- Feed ---- */}
      {loading ? (
        <div className="stack">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={query ? 'Nothing matches that search' : `No posts in ${category} yet`}
          hint={query ? 'Try a shorter phrase.' : 'Be the first one to start this thread.'}
          action={
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => (user ? setComposeOpen(true) : openAuth())}
            >
              <Sparkles size={14} strokeWidth={2.6} />
              Write the first post
            </button>
          }
        />
      ) : (
        <motion.div layout className="stack">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                hasVoted={voted.has(post.id)}
                onUpvote={() => handleUpvote(post)}
                onOpenThread={() => setOpenThread(post)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={handleCreate}
      />

      <ThreadModal
        post={openThread}
        onClose={() => setOpenThread(null)}
        onComment={handleComment}
        canComment={Boolean(user)}
        onRequestAuth={openAuth}
      />
    </div>
  );
}

/* ==========================================================================
   Post card
   ========================================================================== */

function PostCard({ post, hasVoted, onUpvote, onOpenThread }) {
  const commentCount = post.comments?.length || 0;

  return (
    <motion.article
      layout
      variants={listItemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="card is-interactive"
      whileHover={{ y: -2 }}
      transition={spring.snappy}
      style={{ padding: 20, display: 'flex', gap: 16 }}
    >
      {/* Vote rail */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <motion.button
          type="button"
          onClick={onUpvote}
          aria-pressed={hasVoted}
          aria-label={`Upvote: ${post.title}`}
          whileTap={{ scale: 0.86 }}
          animate={hasVoted ? { y: [0, -5, 0] } : {}}
          transition={spring.bouncy}
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 34,
            height: 30,
            borderRadius: 9,
            cursor: hasVoted ? 'default' : 'pointer',
            border: `1.5px solid ${hasVoted ? 'var(--accent)' : 'var(--line)'}`,
            background: hasVoted ? 'var(--accent-soft)' : 'transparent',
            color: hasVoted ? 'var(--accent)' : 'var(--ink-faint)',
            transition: 'background-color 200ms, color 200ms, border-color 200ms',
          }}
        >
          <ArrowBigUp size={17} strokeWidth={2.3} fill={hasVoted ? 'currentColor' : 'none'} />
        </motion.button>

        <motion.span
          key={post.upvotes}
          initial={{ y: -7, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={spring.snappy}
          className="t-num"
          style={{ fontSize: '0.82rem', color: hasVoted ? 'var(--accent)' : 'var(--ink-soft)' }}
        >
          {post.upvotes ?? 0}
        </motion.span>
      </div>

      {/* Body */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="row-between" style={{ marginBottom: 10, gap: 10 }}>
          <div className="row" style={{ gap: 10, minWidth: 0 }}>
            <Avatar name={post.authorName} anonymous={post.isAnonymous} size={32} />
            <div style={{ minWidth: 0 }}>
              <p
                className="row"
                style={{ gap: 6, fontSize: 'var(--t-small)', fontWeight: 700, lineHeight: 1.2 }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.isAnonymous ? 'Anonymous student' : post.authorName}
                </span>
                {post.isAnonymous && (
                  <VenetianMask size={13} className="t-faint" aria-label="Posted anonymously" />
                )}
              </p>
              <p className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
                {timeAgo(post.createdAt)}
                {post.tag ? ` · ${post.tag}` : ''}
              </p>
            </div>
          </div>

          <span className="badge">{post.category}</span>
        </div>

        <button
          type="button"
          onClick={onOpenThread}
          style={{
            display: 'block',
            textAlign: 'left',
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', marginBottom: 6, lineHeight: 1.28 }}>{post.title}</h3>
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
            {post.content}
          </p>
        </button>

        <div className="row" style={{ gap: 12, marginTop: 14 }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenThread}>
            <MessageCircle size={14} strokeWidth={2.4} />
            {commentCount ? pluralize(commentCount, 'reply', 'replies') : 'Reply'}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

/* ==========================================================================
   Compose
   ========================================================================== */

function ComposeModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Academic');
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setAnonymous(false);
      setError('');
    }
  }, [open]);

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await onSubmit({ title: title.trim(), content: content.trim(), category, isAnonymous: anonymous });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Start a discussion"
      subtitle="Goes out to every verified student on your campus."
    >
      <form onSubmit={submit} className="stack" style={{ paddingBottom: 20 }}>
        <div className="field">
          <label className="field-label" htmlFor="post-title">
            Title
          </label>
          <input
            id="post-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to ask the campus?"
            maxLength={120}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="post-category">
            Category
          </label>
          <select
            id="post-category"
            className="input"
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

        <div className="field">
          <label className="field-label" htmlFor="post-body">
            Details
          </label>
          <textarea
            id="post-body"
            className="input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add the context people need to actually help."
            required
          />
          <p className="t-faint" style={{ fontSize: 'var(--t-micro)', textAlign: 'right' }}>
            {content.length} characters
          </p>
        </div>

        {/* Anonymity toggle, with the honest explanation attached. */}
        <button
          type="button"
          onClick={() => setAnonymous((v) => !v)}
          className="card-inset row-between"
          style={{ padding: '14px 16px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
        >
          <span className="row" style={{ gap: 11 }}>
            <VenetianMask size={17} className={anonymous ? '' : 't-faint'} />
            <span>
              <span style={{ display: 'block', fontWeight: 700, fontSize: 'var(--t-small)' }}>
                Post anonymously
              </span>
              <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
                Your name is hidden from students — not from moderation.
              </span>
            </span>
          </span>
          <span className="switch" data-on={anonymous} role="switch" aria-checked={anonymous} />
        </button>

        {error && (
          <p role="alert" style={{ color: 'var(--rose)', fontSize: 'var(--t-small)', fontWeight: 600 }}>
            {error}
          </p>
        )}

        <div className="row" style={{ gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={busy || !title.trim() || !content.trim()}>
            {busy ? <Loader2 size={15} className="spin" /> : <Send size={15} strokeWidth={2.6} />}
            {busy ? 'Publishing…' : 'Publish post'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ==========================================================================
   Thread
   ========================================================================== */

function ThreadModal({ post, onClose, onComment, canComment, onRequestAuth }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (post) setText('');
  }, [post]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      await onComment(post.id, text.trim());
      setText('');
    } finally {
      setBusy(false);
    }
  }

  const comments = post?.comments || [];

  return (
    <Modal
      open={Boolean(post)}
      onClose={onClose}
      title={post?.title || ''}
      subtitle={`${post?.isAnonymous ? 'Anonymous student' : post?.authorName} · ${timeAgo(post?.createdAt)}`}
      maxWidth={600}
      footer={
        canComment ? (
          <form onSubmit={submit} className="row" style={{ gap: 10 }}>
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a reply…"
              aria-label="Your reply"
            />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!text.trim() || busy} aria-label="Send reply">
              {busy ? <Loader2 size={16} className="spin" /> : <Send size={16} strokeWidth={2.6} />}
            </button>
          </form>
        ) : (
          <button type="button" className="btn btn-primary btn-block" onClick={onRequestAuth}>
            Verify your campus email to reply
          </button>
        )
      }
    >
      <p className="t-muted" style={{ marginBottom: 20, lineHeight: 1.65 }}>
        {post?.content}
      </p>

      <hr className="rule" />

      <div className="stack" style={{ marginTop: 18, gap: 12 }}>
        <p className="t-eyebrow" style={{ color: 'var(--ink-faint)' }}>
          {comments.length ? pluralize(comments.length, 'reply', 'replies') : 'No replies yet'}
        </p>

        <AnimatePresence initial={false}>
          {comments.map((c) => (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.snappy}
              className="row"
              style={{ gap: 11, alignItems: 'flex-start' }}
            >
              <Avatar name={c.authorName} size={30} />
              <div className="card-inset" style={{ padding: '11px 14px', flex: 1, minWidth: 0 }}>
                <p className="row-between" style={{ gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--t-small)' }}>{c.authorName}</span>
                  <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
                    {timeAgo(c.createdAt)}
                  </span>
                </p>
                <p className="t-muted" style={{ fontSize: 'var(--t-small)' }}>
                  {c.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
