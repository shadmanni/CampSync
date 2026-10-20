import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Loader2, LockKeyhole, LogIn, UserRound } from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { spring } from '../../lib/motion.js';

const ALLOWED = ['@learner.manipal.edu', '@manipal.edu'];

export function AuthModal() {
  const { authOpen, closeAuth, login: saveSession } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authOpen) {
      setError('');
      setPassword('');
      setConfirmPassword('');
      setBusy(false);
    }
  }, [authOpen]);

  const signingUp = mode === 'signup';
  const cleanEmail = email.trim().toLowerCase();
  const domainOk = ALLOWED.some((domain) => cleanEmail.endsWith(domain));
  const nameOk = !signingUp || isAnonymous || name.trim().length >= 2;
  const passwordOk = password.length >= 8 && password.length <= 128;
  const passwordsMatch = !signingUp || password === confirmPassword;

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  }

  async function submit(event) {
    event.preventDefault();
    if (!domainOk || !nameOk || !passwordOk || !passwordsMatch || busy) return;

    setBusy(true);
    setError('');
    try {
      const result = signingUp
        ? await api.register({
            email: cleanEmail,
            name: name.trim(),
            password,
            isAnonymous,
          })
        : await api.login({ email: cleanEmail, password });

      saveSession(result.user, result.token);
      toast.success(signingUp ? 'Account created' : 'Welcome back', {
        detail: result.claimedLegacyAccount
          ? 'Your existing account is now protected by this password.'
          : `Signed in as ${result.user.name}.`,
      });
    } catch (err) {
      setError(err.message || `Could not ${signingUp ? 'create your account' : 'sign in'}.`);
      if (err.status === 409) {
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={authOpen}
      onClose={closeAuth}
      title={signingUp ? 'Create your CampSync account' : 'Sign in to CampSync'}
      subtitle={signingUp
        ? 'Use your official Manipal email and choose a password.'
        : 'Enter the email and password used for your account.'}
      maxWidth={470}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring.snappy}
        className="stack"
        style={{ paddingBottom: 20 }}
      >
        {signingUp && (
          <>
            <div className="field">
              <label className="field-label" htmlFor="campus-name">Display name</label>
              <input
                id="campus-name"
                className="input"
                type="text"
                autoComplete="name"
                placeholder={isAnonymous ? 'Anonymous Student' : 'Your name'}
                value={name}
                onChange={(event) => { setName(event.target.value); setError(''); }}
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
                onChange={(event) => { setIsAnonymous(event.target.checked); setError(''); }}
              />
              <span>
                <strong>Keep my profile anonymous</strong>
                <span className="t-faint" style={{ display: 'block', fontSize: 'var(--t-micro)' }}>
                  Other students will see “Anonymous Student” instead of your name.
                </span>
              </span>
            </label>
          </>
        )}

        <div className="field">
          <label className="field-label" htmlFor="campus-email">Manipal email address</label>
          <input
            id="campus-email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="you@learner.manipal.edu"
            value={email}
            onChange={(event) => { setEmail(event.target.value); setError(''); }}
            required
          />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="campus-password">Password</label>
          <input
            id="campus-password"
            className="input"
            type="password"
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setError(''); }}
            minLength={8}
            maxLength={128}
            required
          />
        </div>

        {signingUp && (
          <div className="field">
            <label className="field-label" htmlFor="campus-confirm-password">Confirm password</label>
            <input
              id="campus-confirm-password"
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Enter the same password again"
              value={confirmPassword}
              onChange={(event) => { setConfirmPassword(event.target.value); setError(''); }}
              minLength={8}
              maxLength={128}
              required
            />
            {confirmPassword && !passwordsMatch && (
              <span style={{ color: 'var(--rose)', fontSize: 'var(--t-micro)', marginTop: 5 }}>
                Passwords do not match.
              </span>
            )}
          </div>
        )}

        {signingUp && (
          <div className="row wrap" style={{ gap: 6 }}>
            <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>Accepted domains:</span>
            {ALLOWED.map((domain) => (
              <span key={domain} className="badge badge-outline" style={{ fontFamily: 'var(--font-mono)' }}>
                {domain}
              </span>
            ))}
          </div>
        )}

        <ErrorLine message={error} />

        <button
          type="submit"
          className="btn btn-primary btn-block btn-lg"
          disabled={!domainOk || !nameOk || !passwordOk || !passwordsMatch || busy}
          style={{ marginTop: 4 }}
        >
          {busy
            ? <Loader2 size={16} className="spin" />
            : signingUp
              ? (isAnonymous ? <UserRound size={16} /> : <ArrowRight size={16} />)
              : <LogIn size={16} />}
          {busy ? (signingUp ? 'Creating account…' : 'Signing in…') : (signingUp ? 'Create account' : 'Sign in')}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-block"
          onClick={() => changeMode(signingUp ? 'login' : 'signup')}
          disabled={busy}
        >
          <LockKeyhole size={15} />
          {signingUp ? 'Already have an account? Sign in' : 'New to CampSync? Create account'}
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
