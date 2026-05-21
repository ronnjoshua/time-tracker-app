import TimeTracker from "@/components/TimeTracker";
import DarkModeToggle from "@/components/DarkModeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Time Tracker
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Track your work hours for client billing
            </p>
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
