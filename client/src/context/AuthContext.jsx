import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const USER_KEY = 'campussync_user';
const TOKEN_KEY = 'campussync_token';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Campus verification state.
 *
 * Note this starts signed *out* rather than seeding a fake logged-in student.
 * The college-email + OTP flow is the trust layer the whole product rests on,
 * so it should be walked through on stage, not skipped past.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [authOpen, setAuthOpen] = useState(false);

  const login = useCallback((userData, token) => {
    setUser(userData);
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      if (token) localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* Storage unavailable — the session still works until reload. */
    }
    setAuthOpen(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* no-op */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isVerified: Boolean(user?.isVerified),
      login,
      logout,
      authOpen,
      openAuth: () => setAuthOpen(true),
      closeAuth: () => setAuthOpen(false),
      /** Display name used when posting, bidding or joining a ride. */
      displayName: user?.name || 'Verified Student',
    }),
    [user, authOpen, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
