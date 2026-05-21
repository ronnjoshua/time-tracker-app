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
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Folder header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Folder icon */}
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: project.color + "20" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
                <>
                  <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                </>
              )}
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">
              {project.name}
            </div>
            {project.client_name && (
              <div className="text-xs text-zinc-400">{project.client_name}</div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">
              {formatHours(totalSeconds)} hrs
            </div>
            <div className="text-xs text-zinc-400">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              {totalBillable > 0 && (
                <span className="ml-1 text-emerald-500">
                  ${totalBillable.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-zinc-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Entries list */}
      {expanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800">
          {entries.length === 0 ? (
            <div className="p-4 text-center text-sm text-zinc-400">
              No entries in this project
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                      {entry.task_name}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {formatDate(entry.started_at)} &middot;{" "}
                      {formatTime(entry.started_at)} &ndash;{" "}
                      {entry.ended_at ? formatTime(entry.ended_at) : "ongoing"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                        {formatDuration(entry.duration_seconds || 0)}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {formatHours(entry.duration_seconds || 0)} hrs
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-1 rounded text-zinc-400 hover:text-blue-500 transition cursor-pointer"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                      </button>
                      <button
                        onClick={() => onDelete(entry.id)}
                        className="p-1 rounded text-zinc-400 hover:text-red-500 transition cursor-pointer"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
  // Group entries by project
  const unassigned = entries.filter((e) => !e.project_id);
  const byProject = projects.map((project) => ({
    project,
    entries: entries.filter((e) => e.project_id === project.id),
  }));

  // Sort projects by most recent entry
  byProject.sort((a, b) => {
    const aLatest = a.entries[0]?.started_at || "";
    const bLatest = b.entries[0]?.started_at || "";
    return bLatest.localeCompare(aLatest);
  });

  if (projects.length === 0 && unassigned.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p className="text-lg">No projects yet</p>
        <p className="text-sm mt-1">
          Create a project and assign entries to organize your work
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        Projects
      </h2>
      <div className="space-y-2">
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
            project={{
              name: "Unassigned",
              color: "#6b7280",
              client_name: null,
              hourly_rate: null,
            }}
            entries={unassigned}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  );
}
