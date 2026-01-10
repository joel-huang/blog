"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/providers/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same size to prevent layout shift
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md p-2 transition-colors duration-500 hover:bg-background-muted",
          className
        )}
        aria-label="Theme toggle"
        disabled
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const getLabel = () => {
    return theme === "light" ? "Light" : "Dark";
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 transition-colors duration-100 hover:bg-background-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground-muted",
        className
      )}
      aria-label={`Toggle theme. Current: ${getLabel()}`}
      title={getLabel()}
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
