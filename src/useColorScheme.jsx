'use client'

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

const ColorSchemeContext = createContext();

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(defaultValue);

  useEffect(() => {
    // Only access localStorage after component mounts (client-side)
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }, [key]);

  useEffect(() => {
    // Only set localStorage after component mounts (client-side)
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
  }, [key, state]);

  return [state, setState];
}

export function ColorSchemeProvider({ children }) {
  const systemPrefersDark = useMediaQuery({
    query: "(prefers-color-scheme: dark)",
  });
  const [isDark, setIsDark] = usePersistedState("colorScheme", undefined);

  const value = useMemo(() => {
    return isDark === undefined ? !!systemPrefersDark : isDark;
  }, [isDark, systemPrefersDark]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (value) {
        document.body.classList.add("dark");
      } else {
        document.body.classList.remove("dark");
      }
    }
  }, [value]);

  return (
    <ColorSchemeContext.Provider value={{ isDark: value, setIsDark }}>
      {children}
    </ColorSchemeContext.Provider>
  );
}

export function useColorScheme() {
  return useContext(ColorSchemeContext);
}
