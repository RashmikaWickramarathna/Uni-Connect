import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "uni-connect-theme-preference";
const VALID_THEMES = new Set(["light", "dark", "system"]);
const ThemeContext = createContext(null);

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "system";
  }

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);
  return VALID_THEMES.has(storedTheme) ? storedTheme : "system";
};

const getSystemTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyResolvedTheme = (preference) => {
  if (typeof document === "undefined") {
    return "light";
  }

  const resolvedTheme = preference === "system" ? getSystemTheme() : preference;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
  document.body.dataset.theme = resolvedTheme;
  return resolvedTheme;
};

export function ThemeProvider({ children }) {
  const [theme, setThemePreference] = useState(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => applyResolvedTheme(getStoredTheme()));

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const nextResolvedTheme = applyResolvedTheme(theme);
      setResolvedTheme(nextResolvedTheme);
    };

    syncTheme();

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        syncTheme();
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [theme]);

  const setTheme = (nextTheme) => {
    const normalizedTheme = VALID_THEMES.has(nextTheme) ? nextTheme : "system";
    setThemePreference(normalizedTheme);
    window.localStorage.setItem(STORAGE_KEY, normalizedTheme);
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      themeOptions: ["light", "dark", "system"],
    }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
