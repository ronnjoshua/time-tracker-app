import TimeTracker from "@/components/TimeTracker";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen gradient-mesh">
      <header className="sticky top-0 z-40 border-b border-[var(--card-border)] bg-[var(--glass)] backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
                Time Tracker
              </h1>
              <p className="text-xs text-[var(--muted)] leading-none mt-0.5">
                Track &middot; Bill &middot; Invoice
              </p>
            </div>
          </div>
          <DarkModeToggle />
        </div>
      </header>
      <main className="px-6 py-8">
        <TimeTracker />
      </main>
    </div>
  );
}
