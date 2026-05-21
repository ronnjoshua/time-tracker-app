"use client";

import { useTheme } from "@/hooks/useTheme";

export default function DarkModeToggle() {
  const { toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="btn-premium p-2.5 rounded-xl glass-card text-[var(--muted)] hover:text-[var(--foreground)] active:bg-[var(--surface-hover)] cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
      title="Toggle dark mode"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden dark:block">
        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="block dark:hidden">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
      </svg>
    </button>
  );
}
