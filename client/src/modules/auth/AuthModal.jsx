import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, UserRound } from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { spring } from '../../lib/motion.js';

const ALLOWED = ['@learner.manipal.edu', '@manipal.edu'];

/** Create a campus account without relying on email delivery. */
export function AuthModal() {
  const { authOpen, closeAuth, login } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authOpen) {
      setError('');
      setBusy(false);
    }
  }, [authOpen]);

  const cleanEmail = email.trim().toLowerCase();
  const domainOk = ALLOWED.some((domain) => cleanEmail.endsWith(domain));
  const nameOk = isAnonymous || name.trim().length >= 2;

  async function createAccount(event) {
    event.preventDefault();
    if (!domainOk || !nameOk || busy) return;

    setBusy(true);
    setError('');
    try {
      const result = await api.register({
        email: cleanEmail,
        name: name.trim(),
        isAnonymous,
      });
      login(result.user, result.token);
      toast.success(isAnonymous ? 'Anonymous account ready' : `Welcome, ${result.user.name}`, {
        detail: 'You can now use CampusSync.',
      });
    } catch (err) {
      setError(err.message || 'Could not create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={authOpen}
      onClose={closeAuth}
      title="Join CampusSync"
      subtitle="Enter your name and official Manipal email. No verification code is required."
      maxWidth={470}
    >
      <motion.form
        onSubmit={createAccount}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.snappy}
        className="stack"
        style={{ paddingBottom: 20 }}
      >
        <div className="field">
          <label className="field-label" htmlFor="campus-name">Display name</label>
          <input
            id="campus-name"
            className="input"
            type="text"
            autoComplete="name"
            placeholder={isAnonymous ? 'Anonymous Student' : 'Your name'}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
            minLength={2}
            maxLength={80}
            disabled={isAnonymous}
            required={!isAnonymous}
          />
        </div>

        <label className="row" style={{ gap: 10, cursor: 'pointer', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(event) => {
              setIsAnonymous(event.target.checked);
              setError('');
            }}
          />
          <span>
            <strong>Keep my profile anonymous</strong>
            <span className="t-faint" style={{ display: 'block', fontSize: 'var(--t-micro)' }}>
              Other students will see “Anonymous Student” instead of your name.
            </span>
          </span>
        </label>

        <div className="field">
          <label className="field-label" htmlFor="campus-email">Manipal email address</label>
          <input
            id="campus-email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="you@learner.manipal.edu"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            required
          />
        </div>

        <div className="row wrap" style={{ gap: 6 }}>
          <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>Accepted domains:</span>
          {ALLOWED.map((domain) => (
            <span key={domain} className="badge badge-outline" style={{ fontFamily: 'var(--font-mono)' }}>
              {domain}
            </span>
          ))}
        </div>

        <ErrorLine message={error} />

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={!domainOk || !nameOk || busy}
          style={{ marginTop: 4 }}
        >
          {busy ? <Loader2 size={16} className="spin" /> : isAnonymous ? <UserRound size={16} /> : <ArrowRight size={16} />}
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </motion.form>
    </Modal>
  );
}

function ErrorLine({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          role="alert"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{ color: 'var(--rose)', fontSize: 'var(--t-small)', fontWeight: 600, overflow: 'hidden' }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
