"use client";

import { useEffect, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Prevent background scroll when modal is open
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }}
    >
      {/* Bottom sheet on mobile, centered card on desktop */}
      <div className="w-full sm:max-w-md glass-card sm:rounded-2xl rounded-t-2xl shadow-2xl animate-slide-up sm:animate-fade-in-scale max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-5 py-3.5 shrink-0">
          {/* Mobile drag handle */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[var(--card-border)] sm:hidden" />
          <h2 className="text-sm font-semibold text-[var(--foreground)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2.5 -mr-1 rounded-xl text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] active:bg-[var(--card-border)] transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
