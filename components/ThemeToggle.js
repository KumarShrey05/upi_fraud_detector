"use client";

import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!mounted) return null;

  const currentIcon =
    theme === "system" ? (
      <Laptop size={18} />
    ) : resolvedTheme === "dark" ? (
      <Moon size={18} />
    ) : (
      <Sun size={18} />
    );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:scale-105 transition"
      >
        {currentIcon}
      </button>

      <div
        className={`absolute right-0 mt-2 w-44 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg transition-all duration-200 origin-top-right ${
          open
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <Option
          label="Light"
          icon={<Sun size={16} />}
          onClick={() => setTheme("light")}
        />
        <Option
          label="Dark"
          icon={<Moon size={16} />}
          onClick={() => setTheme("dark")}
        />
        <Option
          label="System"
          icon={<Laptop size={16} />}
          onClick={() => setTheme("system")}
        />
      </div>
    </div>
  );
}

function Option({ label, icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
    >
      {icon}
      {label}
    </button>
  );
}