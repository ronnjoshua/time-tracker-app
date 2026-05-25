import TimeTracker from "@/components/TimeTracker";
import Header from "@/components/Header";

export default function Home() {
  return (
    <div className="min-h-screen gradient-mesh">
      <Header />
      <main className="px-4 sm:px-6 py-6 sm:py-8">
        <TimeTracker />
      </main>
    </div>
  );
}
