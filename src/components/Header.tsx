"use client";

import { useAuth } from "@/hooks/useAuth";
import DarkModeToggle from "./DarkModeToggle";
import { useState, useRef, useEffect } from "react";

export default function Header() {
  const { user, signOut } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--glass)] backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-[var(--foreground)] leading-none">
              Time Tracker
            </h1>
            <p className="text-[10px] text-[var(--muted)] leading-none mt-0.5 hidden sm:block">
              Track &middot; Bill &middot; Invoice
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DarkModeToggle />

          {user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn-premium flex items-center gap-2 px-2 py-1.5 rounded-xl glass-card cursor-pointer active:scale-95 min-h-[44px]"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-6 h-6 rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-white text-[10px] font-bold">
                    {(user.email?.[0] || "?").toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-[var(--foreground)] hidden sm:block max-w-[120px] truncate">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--muted)]"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-48 glass-card rounded-xl shadow-xl z-50 py-1 animate-fade-in-scale">
                  <div className="px-3 py-2 border-b border-[var(--card-border)]">
                    <div className="text-xs font-medium text-[var(--foreground)] truncate">
                      {user.user_metadata?.full_name || "User"}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] truncate">
                      {user.email}
                    </div>
                  </div>
                  <button
                    onClick={() => { signOut(); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
