import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, MailCheck, ShieldCheck, Loader2 } from 'lucide-react';
import { Modal } from '../../components/Modal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { api } from '../../lib/api.js';
import { spring } from '../../lib/motion.js';

const ALLOWED = ['@learner.manipal.edu'];
const OTP_LENGTH = 6;

/**
 * Campus verification: email → OTP → JWT.
 *
 * Two steps that slide horizontally, so the flow reads as forward progress
 * rather than the same box swapping its contents.
 */
export function AuthModal() {
  const { authOpen, closeAuth, login } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(Array(OTP_LENGTH).fill(''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const boxRefs = useRef([]);

  // Reset on every open so a cancelled attempt never leaves half-typed state.
  useEffect(() => {
    if (authOpen) {
      setStep('email');
      setCode(Array(OTP_LENGTH).fill(''));
      setError('');
      setBusy(false);
    }
  }, [authOpen]);

  const domainOk = ALLOWED.some((d) => email.trim().toLowerCase().endsWith(d)) || email.trim().toLowerCase().includes('manipal.edu');

  async function sendOtp(e) {
    e?.preventDefault();
    if (!domainOk || busy) return;

    setBusy(true);
    setError('');
    try {
      const res = await api.requestOtp(email.trim().toLowerCase());
      setStep('otp');
      toast.info('Verification code sent', { detail: res?.demoNotice || 'Check your college inbox.' });
      setTimeout(() => boxRefs.current[0]?.focus(), 320);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(codeOverride) {
    const otp = (codeOverride || code.join('')).trim();
    if (otp.length !== OTP_LENGTH || busy) return;

    setBusy(true);
    setError('');
    try {
      const res = await api.verifyOtp(email.trim().toLowerCase(), otp);
      login(res.user, res.token);
      toast.success(`Welcome, ${res.user?.name || 'student'}`, {
        detail: 'Your campus identity is verified.',
      });
    } catch (err) {
      setError(err.message);
      setCode(Array(OTP_LENGTH).fill(''));
      boxRefs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  }

  function onDigit(index, value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      setCode((prev) => prev.map((c, i) => (i === index ? '' : c)));
      return;
    }

    setCode((prev) => {
      const next = [...prev];
      // A paste lands in one box but should fill the rest of the row.
      digits.split('').forEach((d, offset) => {
        if (index + offset < OTP_LENGTH) next[index + offset] = d;
      });

      const landed = Math.min(index + digits.length, OTP_LENGTH - 1);
      setTimeout(() => boxRefs.current[landed]?.focus(), 0);

      const joined = next.join('');
      if (joined.length === OTP_LENGTH && !joined.includes('')) {
        setTimeout(() => verify(joined), 120);
      }
      return next;
    });
  }

  function onDigitKey(index, e) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      boxRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) boxRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) boxRefs.current[index + 1]?.focus();
  }

  return (
    <Modal
      open={authOpen}
      onClose={closeAuth}
      title={step === 'email' ? 'Verify your campus email' : 'Enter your code'}
      subtitle={
        step === 'email'
          ? 'CampusSync is students only. We check the domain, then the inbox.'
          : `We sent a ${OTP_LENGTH}-digit code to ${email}`
      }
      maxWidth={470}
    >
      <div style={{ overflow: 'hidden', paddingBottom: 20 }}>
        <AnimatePresence mode="wait" initial={false}>
          {step === 'email' ? (
            <motion.form
              key="email"
              onSubmit={sendOtp}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={spring.snappy}
              className="stack"
            >
              <div className="field">
                <label className="field-label" htmlFor="campus-email">
                  College email address
                </label>
                <input
                  id="campus-email"
                  className="input"
                  type="email"
                  autoComplete="email"
                  placeholder="you@learner.manipal.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                />
              </div>

              <div className="row wrap" style={{ gap: 6 }}>
                <span className="t-faint" style={{ fontSize: 'var(--t-micro)' }}>
                  Accepted domains:
                </span>
                {ALLOWED.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className="badge badge-outline"
                    onClick={() => setEmail((prev) => `${prev.split('@')[0] || 'student'}${d}`)}
                    style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <ErrorLine message={error} />

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={!domainOk || busy}
                style={{ marginTop: 4 }}
              >
                {busy ? <Loader2 size={16} className="spin" /> : <MailCheck size={16} strokeWidth={2.6} />}
                {busy ? 'Sending code…' : 'Send verification code'}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={spring.snappy}
              className="stack"
            >
              <div
                role="group"
                aria-label="Verification code"
                style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}
              >
                {code.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => {
                      boxRefs.current[i] = el;
                    }}
                    className="input t-num"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={OTP_LENGTH}
                    aria-label={`Digit ${i + 1}`}
                    value={digit}
                    onChange={(e) => onDigit(i, e.target.value)}
                    onKeyDown={(e) => onDigitKey(i, e)}
                    onFocus={(e) => e.target.select()}
                    animate={digit ? { scale: [1, 1.09, 1] } : { scale: 1 }}
                    transition={{ duration: 0.22 }}
                    style={{
                      textAlign: 'center',
                      fontSize: '1.35rem',
                      padding: '14px 0',
                      minWidth: 0,
                      flex: 1,
                    }}
                  />
                ))}
              </div>

              <ErrorLine message={error} />

              <div className="row" style={{ gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep('email')}
                  disabled={busy}
                >
                  <ArrowLeft size={15} strokeWidth={2.6} />
                  Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary grow"
                  onClick={() => verify()}
                  disabled={busy || code.join('').length !== OTP_LENGTH}
                >
                  {busy ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} strokeWidth={2.6} />}
                  {busy ? 'Verifying…' : 'Verify and enter'}
                </button>
              </div>

              <button
                type="button"
                className="t-faint"
                onClick={() => onDigit(0, '123456')}
                style={{
                  background: 'none',
                  border: 0,
                  cursor: 'pointer',
                  fontSize: 'var(--t-micro)',
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                Prototype shortcut: fill 123456
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
          style={{
            color: 'var(--rose)',
            fontSize: 'var(--t-small)',
            fontWeight: 600,
            overflow: 'hidden',
          }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
