import React, { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  isDark: false,
  toggle: () => {}
});

/**
 * Static Light Theme Provider (Campus Pop).
 */
export function ThemeProvider({ children }) {
  useEffect(() => {
    document.documentElement.dataset.theme = 'light';
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggle: () => {}, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  return ctx;
};
