import TimeTracker from "@/components/TimeTracker";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen gradient-mesh">
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
          <DarkModeToggle />
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <TimeTracker />
      </main>
    </div>
  );
}
