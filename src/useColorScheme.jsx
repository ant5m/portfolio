import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useMediaQuery } from "react-responsive";

const ColorSchemeContext = createContext();

function usePersistedState(key, defaultValue) {
  const [state, setState] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
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
    if (value) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
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
