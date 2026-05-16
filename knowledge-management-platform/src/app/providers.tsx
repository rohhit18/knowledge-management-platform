"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeCtxType {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtxType>({ theme: "light", toggle: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("kmp-theme") as Theme) || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("kmp-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  if (!mounted) return <>{children}</>;
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  );
}
