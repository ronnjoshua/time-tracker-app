"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDuration } from "@/lib/format";
import { useEntries } from "@/hooks/useEntries";
import { useTimer } from "@/hooks/useTimer";
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

type ViewMode = "list" | "projects" | "daily" | "weekly" | "dashboard";

export default function TimeTracker() {
  const {
    completedEntries,
    activeEntry,
    loading,
    fetchEntries,
    createEntry,
    stopEntry,
    updateEntry,
    deleteEntry,
  } = useEntries();

  const {
    projects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const { tags, fetchTags, createTag, deleteTag, getEntryTags, setEntryTags } =
    useTags();

  const elapsed = useTimer(activeEntry);

  const [taskName, setTaskName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{
    entry: import("@/lib/types").TimeEntry;
    tagIds: string[];
  } | null>(null);

  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

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

  const handleStart = async () => {
    const name = taskName.trim();
    if (!name) return;
    const entry = await createEntry(name, selectedProjectId);
    if (entry) {
      if (selectedTagIds.length > 0) {
        await setEntryTags(entry.id, selectedTagIds);
      }
      await fetchEntries({ from: dateFrom, to: dateTo });
    }
  };

  const handleStop = async () => {
    if (!activeEntry) return;
    const success = await stopEntry(activeEntry);
    if (success) {
      setTaskName("");
      setSelectedProjectId(null);
      setSelectedTagIds([]);
      await fetchEntries({ from: dateFrom, to: dateTo });
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteEntry(id);
    if (success) await fetchEntries({ from: dateFrom, to: dateTo });
  };

  const handleEdit = useCallback(
    async (entry: import("@/lib/types").TimeEntry) => {
      const entryTags = await getEntryTags(entry.id);
      setEditingEntry({ entry, tagIds: entryTags.map((t) => t.id) });
    },
    [getEntryTags]
  );

  const handleSaveEdit = async (
    id: string,
    updates: {
      task_name?: string;
      started_at?: string;
      ended_at?: string;
      project_id?: string | null;
    }
  ) => {
    const success = await updateEntry(id, updates);
    if (success) await fetchEntries({ from: dateFrom, to: dateTo });
    return success;
  };

  const handleDateFilter = (from: string | undefined, to: string | undefined) => {
    setDateFrom(from);
    setDateTo(to);
    fetchEntries({ from, to });
  };

  const isRunning = !!activeEntry;

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: "list", label: "List" },
    { key: "projects", label: "Projects" },
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "dashboard", label: "Dashboard" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <div className="flex items-center gap-2 text-[var(--muted)]">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 stagger-children">
      {/* Timer Section */}
      <div className="glass-card rounded-2xl p-8 animate-fade-in-scale">
        <div className="text-center mb-6">
          <div
            className={`timer-display text-5xl font-mono font-bold text-[var(--foreground)] ${
              isRunning ? "animate-pulse-glow rounded-xl inline-block px-4 py-2" : ""
            }`}
          >
            {formatDuration(elapsed)}
          </div>
          {isRunning && (
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--danger)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--danger)]" />
              </span>
              <span className="text-xs font-medium text-[var(--danger)] tracking-wide uppercase">
                Recording
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Task name + start/stop */}
          <div>
            <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
              Task
            </label>
            <div className="flex gap-2.5">
              <input
                type="text"
                placeholder="What are you working on?"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isRunning) handleStart();
                }}
                disabled={isRunning}
                className="input-premium flex-1 px-4 py-2.5 rounded-xl text-[var(--foreground)] placeholder-[var(--muted)] disabled:opacity-40 text-sm"
              />
              {isRunning ? (
                <button
                  onClick={handleStop}
                  className="btn-premium px-6 py-2.5 rounded-xl bg-[var(--danger)] hover:bg-red-600 text-white font-semibold text-sm cursor-pointer shadow-sm"
                >
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleStart}
                  disabled={!taskName.trim()}
                  className="btn-premium px-6 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-blue-600 disabled:bg-[var(--card-border)] disabled:text-[var(--muted)] text-white font-semibold text-sm disabled:cursor-not-allowed cursor-pointer shadow-sm"
                >
                  Start
                </button>
              )}
            </div>
          </div>

          {/* Project / Client selector - prominent */}
          <ProjectSelector
            projects={projects}
            selectedId={selectedProjectId}
            onChange={setSelectedProjectId}
            disabled={isRunning}
            onQuickCreate={async (name, clientName) => {
              const project = await createProject({
                name,
                client_name: clientName || undefined,
              });
              return project;
            }}
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <label className="block text-[10px] font-medium text-[var(--muted)] uppercase tracking-wider mb-1">
                Tags
              </label>
              <TagSelector
                tags={tags}
                selectedIds={selectedTagIds}
                onChange={setSelectedTagIds}
                disabled={isRunning}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center">
          <div className="flex glass-card rounded-xl overflow-hidden p-0.5">
            {viewModes.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === key
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ExportCSV entries={completedEntries} />
          <button
            onClick={() => setShowInvoice(true)}
            className="btn-premium inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Invoice
          </button>
          <button
            onClick={() => setShowProjectManager(true)}
            className="btn-premium px-3 py-1.5 rounded-lg glass-card text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium cursor-pointer"
          >
            Projects
          </button>
          <button
            onClick={() => setShowTagManager(true)}
            className="btn-premium px-3 py-1.5 rounded-lg glass-card text-[var(--muted)] hover:text-[var(--foreground)] text-xs font-medium cursor-pointer"
          >
            Tags
          </button>
        </div>
      </div>

      {/* Date Filter */}
      <DateRangeFilter onFilter={handleDateFilter} />

      {/* Summary */}
      <SummaryBar entries={completedEntries} />

      {/* Content */}
      {viewMode === "list" && (
        <EntryList entries={completedEntries} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {viewMode === "projects" && (
        <ProjectFolders entries={completedEntries} projects={projects} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      {viewMode === "daily" && <DailySummary entries={completedEntries} />}
      {viewMode === "weekly" && <WeeklySummary entries={completedEntries} />}
      {viewMode === "dashboard" && <Dashboard entries={completedEntries} />}

      {/* Modals */}
      <ProjectManager
        open={showProjectManager}
        onClose={() => setShowProjectManager(false)}
        projects={projects}
        onCreateProject={createProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
      />
      <TagManager
        open={showTagManager}
        onClose={() => setShowTagManager(false)}
        tags={tags}
        onCreateTag={createTag}
        onDeleteTag={deleteTag}
      />
      <EntryEditModal
        entry={editingEntry?.entry || null}
        open={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={handleSaveEdit}
        projects={projects}
        tags={tags}
        entryTagIds={editingEntry?.tagIds || []}
        onSaveTags={setEntryTags}
      />
      <InvoiceGenerator
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
        entries={completedEntries}
        projects={projects}
      />
    </div>
  );
}
