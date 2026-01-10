"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeProviderProps = {
  children: React.ReactNode;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
};

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState);

// Get system preference
function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Get initial theme from localStorage or system preference
function getInitialTheme(storageKey: string): Theme {
  if (typeof window === "undefined") return "dark";
  
  const stored = localStorage.getItem(storageKey) as Theme | null;
  if (stored && (stored === "light" || stored === "dark")) {
    return stored;
  }
  
  // First visit: use system preference and store it
  const systemTheme = getSystemTheme();
  localStorage.setItem(storageKey, systemTheme);
  return systemTheme;
}

export function ThemeProvider({
  children,
  storageKey = "theme-preference",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = React.useState<Theme>(() => 
    getInitialTheme(storageKey)
  );
  const [mounted, setMounted] = React.useState(false);

  // Initialize on mount
  React.useEffect(() => {
    setMounted(true);
    const initialTheme = getInitialTheme(storageKey);
    setTheme(initialTheme);
  }, [storageKey]);

  // Apply theme class to document
  React.useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    
    // Only update if different to avoid unnecessary DOM manipulation
    if (!root.classList.contains(theme)) {
      root.classList.remove("light", "dark");
      root.classList.add(theme);
      root.style.colorScheme = theme;
    }
  }, [theme, mounted]);

  const value = React.useMemo(
    () => ({
      theme,
      setTheme: (newTheme: Theme) => {
        localStorage.setItem(storageKey, newTheme);
        setTheme(newTheme);
      },
    }),
    [theme, storageKey]
  );

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
