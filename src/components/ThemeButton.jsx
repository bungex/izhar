"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

export default function ThemeButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
      aria-label="Toggle theme"
    >
      {/* {theme === "dark" ? "☀️" : "🌙"} */}
      {theme === "dark" ? (
        <Sun size={20} className="fill-yellow-400 text-yellow-400 cursor-pointer" />
        ) : (
        <Moon size={20} className="text-slate-700 cursor-pointer" />
        )}
    </button>
  );
}