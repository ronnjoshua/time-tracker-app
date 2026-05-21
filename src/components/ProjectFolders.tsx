"use client";

import { useState } from "react";
import { formatDuration, formatHours, formatDate, formatTime } from "@/lib/format";
import type { TimeEntry, Project } from "@/lib/types";

type ProjectFoldersProps = {
  entries: TimeEntry[];
  projects: Project[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
};

function FolderCard({
  project,
  entries,
  onEdit,
  onDelete,
}: {
  project: { name: string; color: string; client_name?: string | null; hourly_rate?: number | null };
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const totalSeconds = entries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0),
    0
  );
  const totalBillable =
    project.hourly_rate ? (totalSeconds / 3600) * project.hourly_rate : 0;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--card-border)] transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: project.color + "15" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={project.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {expanded ? (
                <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l-2-7H3l2 7Z" />
              ) : (
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
              )}
            </svg>
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-[var(--foreground)]">
              {project.name}
            </div>
            {project.client_name && (
              <div className="text-[10px] text-[var(--muted)]">{project.client_name}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-mono font-semibold text-[var(--foreground)] timer-display">
              {formatHours(totalSeconds)} hrs
            </div>
            <div className="text-[10px] text-[var(--muted)]">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              {totalBillable > 0 && (
                <span className="ml-1 text-[var(--success)]">
                  ${totalBillable.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--muted)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[var(--card-border)] animate-slide-down">
          {entries.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--muted)]">
              No entries in this project
            </div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between px-4 py-3 hover:bg-[var(--card-border)] transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--foreground)] truncate">
                      {entry.task_name}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">
                      {formatDate(entry.started_at)} &middot;{" "}
                      {formatTime(entry.started_at)} &ndash;{" "}
                      {entry.ended_at ? formatTime(entry.ended_at) : "ongoing"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-xs font-mono font-semibold text-[var(--foreground)] timer-display">
                        {formatDuration(entry.duration_seconds || 0)}
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">
                        {formatHours(entry.duration_seconds || 0)} hrs
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
                        className="p-1 rounded text-[var(--muted)] hover:text-[var(--accent)] transition cursor-pointer"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                        className="p-1 rounded text-[var(--muted)] hover:text-[var(--danger)] transition cursor-pointer"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectFolders({
  entries,
  projects,
  onEdit,
  onDelete,
}: ProjectFoldersProps) {
  const unassigned = entries.filter((e) => !e.project_id);
  const byProject = projects.map((project) => ({
    project,
    entries: entries.filter((e) => e.project_id === project.id),
  }));

  byProject.sort((a, b) => {
    const aLatest = a.entries[0]?.started_at || "";
    const bLatest = b.entries[0]?.started_at || "";
    return bLatest.localeCompare(aLatest);
  });

  if (projects.length === 0 && unassigned.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">
        <p className="text-sm">No projects yet</p>
        <p className="text-xs mt-1">
          Create a project and assign entries to organize your work
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger-children">
      <h2 className="text-sm font-semibold text-[var(--foreground)] uppercase tracking-wider">
        Projects
      </h2>
      {byProject.map(({ project, entries: projEntries }) => (
        <FolderCard
          key={project.id}
          project={project}
          entries={projEntries}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      {unassigned.length > 0 && (
        <FolderCard
          project={{ name: "Unassigned", color: "#6b7280", client_name: null, hourly_rate: null }}
          entries={unassigned}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
