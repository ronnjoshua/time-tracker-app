"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { formatDuration } from "@/lib/format";
import { useEntries } from "@/hooks/useEntries";
import { useTimer, startPause, endPause, clearPause, getPausedSeconds } from "@/hooks/useTimer";
import { useProjects } from "@/hooks/useProjects";
import { useTags } from "@/hooks/useTags";
import ProjectSelector from "./ProjectSelector";
import ProjectManager from "./ProjectManager";
import TagSelector from "./TagSelector";
import TagManager from "./TagManager";
import EntryList from "./EntryList";
import EntryEditModal from "./EntryEditModal";
import SummaryBar from "./SummaryBar";
import DateRangeFilter from "./DateRangeFilter";
import DailySummary from "./DailySummary";
import WeeklySummary from "./WeeklySummary";
import ExportCSV from "./ExportCSV";
import Dashboard from "./Dashboard";
import InvoiceGenerator from "./InvoiceGenerator";
import ProjectFolders from "./ProjectFolders";
import ManualEntryModal from "./ManualEntryModal";
import MonthlyReport from "./MonthlyReport";

type ViewMode = "list" | "projects" | "daily" | "weekly" | "monthly" | "dashboard";

export default function TimeTracker() {
  const {
    completedEntries, activeEntry, loading,
    fetchEntries, createEntry, createManualEntry, duplicateEntry,
    stopEntry, updateEntry, deleteEntry,
  } = useEntries();

  const { projects, fetchProjects, createProject, updateProject, deleteProject } = useProjects();
  const { tags, fetchTags, createTag, deleteTag, getEntryTags, setEntryTags } = useTags();

  const [paused, setPaused] = useState(false);
  const elapsed = useTimer(activeEntry, paused);

  const [taskName, setTaskName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    entry: import("@/lib/types").TimeEntry;
    tagIds: string[];
  } | null>(null);

  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const taskInputRef = useRef<HTMLInputElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  // Close actions menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActionsMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Load last used project
  useEffect(() => {
    const lastProject = localStorage.getItem("lastProjectId");
    if (lastProject) setSelectedProjectId(lastProject);
  }, []);

  useEffect(() => {
    fetchEntries();
    fetchProjects();
    fetchTags();
  }, [fetchEntries, fetchProjects, fetchTags]);

  useEffect(() => {
    if (activeEntry) {
      setTaskName(activeEntry.task_name);
      setSelectedProjectId(activeEntry.project_id || null);
    }
  }, [activeEntry]);

  // Tab title timer
  useEffect(() => {
    if (activeEntry && elapsed > 0) {
      document.title = `${formatDuration(elapsed)} - Time Tracker`;
    } else {
      document.title = "Time Tracker";
    }
  }, [elapsed, activeEntry]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        if (activeEntry) handleStop();
        else if (taskName.trim()) handleStart();
        else taskInputRef.current?.focus();
      }
      if (e.key === "e" || e.key === "E") {
        e.preventDefault();
        if (completedEntries.length > 0) handleEdit(completedEntries[0]);
      }
      if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (activeEntry) {
          if (paused) handleResume();
          else handlePause();
        }
      }
      if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        setShowManualEntry(true);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntry, taskName, completedEntries]);

  const handleStart = async () => {
    const name = taskName.trim();
    if (!name) return;
    if (selectedProjectId) localStorage.setItem("lastProjectId", selectedProjectId);
    const entry = await createEntry(name, selectedProjectId);
    if (entry) {
      if (selectedTagIds.length > 0) await setEntryTags(entry.id, selectedTagIds);
      await fetchEntries({ from: dateFrom, to: dateTo });
    }
  };

  const handlePause = () => {
    if (!activeEntry) return;
    startPause(activeEntry.id);
    setPaused(true);
  };

  const handleResume = () => {
    if (!activeEntry) return;
    endPause(activeEntry.id);
    setPaused(false);
  };

  const handleStop = async () => {
    if (!activeEntry) return;
    // If paused, resume first to finalize pause tracking
    if (paused) endPause(activeEntry.id);
    const pausedSecs = getPausedSeconds(activeEntry.id);
    const success = await stopEntry(activeEntry, pausedSecs);
    if (success) {
      clearPause(activeEntry.id);
      setPaused(false);
      setTaskName("");
      setSelectedTagIds([]);
      await fetchEntries({ from: dateFrom, to: dateTo });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntry(id);
    if (success) await fetchEntries({ from: dateFrom, to: dateTo });
  };

  const handleDuplicate = async (entry: import("@/lib/types").TimeEntry) => {
    const dup = await duplicateEntry(entry);
    if (dup) await fetchEntries({ from: dateFrom, to: dateTo });
  };

  const handleEdit = useCallback(
    async (entry: import("@/lib/types").TimeEntry) => {
      const entryTags = await getEntryTags(entry.id);
      setEditingEntry({ entry, tagIds: entryTags.map((t) => t.id) });
    },
    [getEntryTags]
  );

  const handleSaveEdit = async (id: string, updates: {
    task_name?: string; started_at?: string; ended_at?: string; project_id?: string | null;
  }) => {
    const success = await updateEntry(id, updates);
    if (success) await fetchEntries({ from: dateFrom, to: dateTo });
    return success;
  };

  const handleManualEntry = async (data: {
    task_name: string; started_at: string; ended_at: string; project_id?: string | null;
  }) => {
    const entry = await createManualEntry(data);
    if (entry) await fetchEntries({ from: dateFrom, to: dateTo });
    return entry;
  };

  const handleDateFilter = (from: string | undefined, to: string | undefined) => {
    setDateFrom(from);
    setDateTo(to);
    fetchEntries({ from, to });
  };

  const isRunning = !!activeEntry;
  const isFirstTime = completedEntries.length === 0 && projects.length === 0 && !isRunning;

  const viewModes: { key: ViewMode; label: string; icon: string }[] = [
    { key: "list", label: "List", icon: "list" },
    { key: "projects", label: "Projects", icon: "folder" },
    { key: "daily", label: "Daily", icon: "calendar" },
    { key: "weekly", label: "Weekly", icon: "bar" },
    { key: "monthly", label: "Monthly", icon: "grid" },
    { key: "dashboard", label: "Charts", icon: "chart" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <span className="text-xs text-[var(--muted)]">Loading your data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Onboarding for first-time users */}
      {isFirstTime && (
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-scale border-[var(--accent-medium)]" style={{ borderColor: "var(--accent-medium)" }}>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/><path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Welcome to Time Tracker</h2>
            <p className="text-sm text-[var(--muted)] mt-1.5 max-w-md">
              Track your work hours and bill clients with ease. Here&apos;s how to get started:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full max-w-lg">
              <button
                onClick={() => setShowProjectManager(true)}
                className="btn-premium glass-card rounded-xl p-4 text-left cursor-pointer hover:border-[var(--accent)]"
                style={{ transition: "border-color 0.2s" }}
              >
                <div className="text-lg mb-1">1</div>
                <div className="text-xs font-semibold text-[var(--foreground)]">Create a Project</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">Add your client and hourly rate</div>
              </button>
              <div className="glass-card rounded-xl p-4 text-left opacity-60">
                <div className="text-lg mb-1">2</div>
                <div className="text-xs font-semibold text-[var(--foreground)]">Start Tracking</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">Type a task and hit Start</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-left opacity-60">
                <div className="text-lg mb-1">3</div>
                <div className="text-xs font-semibold text-[var(--foreground)]">Bill &amp; Invoice</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">Export CSV or generate PDF</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== HERO: Timer Section ===== */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in-scale">
        {/* Timer display */}
        <div className="text-center mb-5">
          <div
            className={`timer-display text-4xl sm:text-5xl font-mono font-bold text-[var(--foreground)] inline-block ${
              isRunning ? "animate-pulse-glow rounded-xl px-4 py-2" : ""
            }`}
          >
            {formatDuration(elapsed)}
          </div>
          {isRunning && (
            <div className="flex items-center justify-center gap-1.5 mt-2.5">
              {paused ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--warning)]" />
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--warning)] tracking-widest uppercase">
                    Paused
                  </span>
                </>
              ) : (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" />
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--accent)] tracking-widest uppercase">
                    Recording
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Task input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              ref={taskInputRef}
              type="text"
              placeholder="What are you working on?"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !isRunning) handleStart(); }}
              disabled={isRunning}
              className="input-premium flex-1 px-4 py-2.5 rounded-xl text-[var(--foreground)] placeholder-[var(--muted-light)] disabled:opacity-40 text-sm"
            />
            {isRunning ? (
              <div className="flex gap-1.5">
                {paused ? (
                  <button onClick={handleResume} className="btn-premium px-4 sm:px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold text-sm cursor-pointer shadow-sm whitespace-nowrap active:scale-95">
                    Resume
                  </button>
                ) : (
                  <button onClick={handlePause} className="btn-premium px-4 sm:px-5 py-2.5 rounded-xl bg-[var(--warning)] hover:bg-amber-600 text-white font-semibold text-sm cursor-pointer shadow-sm whitespace-nowrap active:scale-95">
                    Pause
                  </button>
                )}
                <button onClick={handleStop} className="btn-premium px-4 sm:px-5 py-2.5 rounded-xl bg-[var(--danger)] hover:bg-red-600 text-white font-semibold text-sm cursor-pointer shadow-sm whitespace-nowrap active:scale-95">
                  Stop
                </button>
              </div>
            ) : (
              <button onClick={handleStart} disabled={!taskName.trim()} className="btn-premium px-5 sm:px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-[var(--card-border)] disabled:text-[var(--muted)] text-white font-semibold text-sm disabled:cursor-not-allowed cursor-pointer shadow-sm whitespace-nowrap">
                Start
              </button>
            )}
          </div>

          {/* Project selector */}
          <ProjectSelector
            projects={projects}
            selectedId={selectedProjectId}
            onChange={setSelectedProjectId}
            disabled={isRunning}
            onQuickCreate={async (name, clientName) => {
              return await createProject({ name, client_name: clientName || undefined });
            }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <span className="section-label">Tags</span>
              <div className="mt-1">
                <TagSelector tags={tags} selectedIds={selectedTagIds} onChange={setSelectedTagIds} disabled={isRunning} />
              </div>
            </div>
          )}
        </div>

        {/* Keyboard hints - hidden on mobile */}
        <div className="hidden sm:flex items-center justify-center gap-4 mt-5 pt-4 border-t border-[var(--card-border)]">
          {[
            { key: "S", label: "Start / Stop" },
            { key: "P", label: "Pause" },
            { key: "E", label: "Edit last" },
            { key: "M", label: "Manual entry" },
          ].map(({ key, label }) => (
            <span key={key} className="text-[10px] text-[var(--muted-light)]">
              <kbd className="inline-flex items-center justify-center w-4 h-4 rounded bg-[var(--card-border)] font-mono text-[8px] text-[var(--muted)] mr-1">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ===== SECONDARY: Controls Bar ===== */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* View tabs - horizontal scroll on mobile */}
        <div className="flex glass-card rounded-xl overflow-x-auto p-0.5 max-w-full scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {viewModes.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                viewMode === key
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions dropdown */}
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="btn-premium flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-card text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            <span className="hidden sm:inline">Actions</span>
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-48 glass-card rounded-xl shadow-xl z-30 py-1 animate-fade-in-scale">
              {[
                { label: "Add Manual Entry", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>, action: () => setShowManualEntry(true) },
                { label: "Export CSV", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, action: () => { if (completedEntries.length > 0) { import("@/lib/csv").then(m => m.downloadCSV(completedEntries)); } } },
                { label: "Generate Invoice", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, action: () => setShowInvoice(true) },
                { label: "divider" },
                { label: "Manage Projects", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>, action: () => setShowProjectManager(true) },
                { label: "Manage Tags", icon: <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/><path d="M9.586 5.586A2 2 0 0 0 8.172 5H3a1 1 0 0 0-1 1v5.172a2 2 0 0 0 .586 1.414L8 18"/><circle cx="6.5" cy="9.5" r=".5" fill="currentColor"/></svg>, action: () => setShowTagManager(true) },
              ].map((item, i) =>
                item.label === "divider" ? (
                  <div key={i} className="my-1 border-t border-[var(--card-border)]" />
                ) : (
                  <button
                    key={item.label}
                    onClick={() => { item.action?.(); setShowActionsMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition cursor-pointer"
                  >
                    <span className="text-[var(--muted)]">{item.icon}</span>
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===== TERTIARY: Filters ===== */}
      <DateRangeFilter onFilter={handleDateFilter} />

      {/* ===== Summary ===== */}
      <SummaryBar entries={completedEntries} />

      {/* ===== Content ===== */}
      <div className="min-h-[200px]">
        {viewMode === "list" && <EntryList entries={completedEntries} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} />}
        {viewMode === "projects" && <ProjectFolders entries={completedEntries} projects={projects} onEdit={handleEdit} onDelete={handleDelete} />}
        {viewMode === "daily" && <DailySummary entries={completedEntries} />}
        {viewMode === "weekly" && <WeeklySummary entries={completedEntries} />}
        {viewMode === "monthly" && <MonthlyReport entries={completedEntries} projects={projects} />}
        {viewMode === "dashboard" && <Dashboard entries={completedEntries} />}
      </div>

      {/* ===== Modals ===== */}
      <ProjectManager open={showProjectManager} onClose={() => setShowProjectManager(false)} projects={projects} onCreateProject={createProject} onUpdateProject={updateProject} onDeleteProject={deleteProject} />
      <TagManager open={showTagManager} onClose={() => setShowTagManager(false)} tags={tags} onCreateTag={createTag} onDeleteTag={deleteTag} />
      <EntryEditModal entry={editingEntry?.entry || null} open={!!editingEntry} onClose={() => setEditingEntry(null)} onSave={handleSaveEdit} projects={projects} tags={tags} entryTagIds={editingEntry?.tagIds || []} onSaveTags={setEntryTags} />
      <InvoiceGenerator open={showInvoice} onClose={() => setShowInvoice(false)} entries={completedEntries} projects={projects} />
      <ManualEntryModal open={showManualEntry} onClose={() => setShowManualEntry(false)} onSave={handleManualEntry} projects={projects} />
    </div>
  );
}
