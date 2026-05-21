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
  project, entries, onEdit, onDelete,
}: {
  project: { name: string; color: string; client_name?: string | null; hourly_rate?: number | null; budget_hours?: number | null; notes?: string | null };
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalSeconds = entries.reduce((s, e) => s + (e.duration_seconds || 0), 0);
  const totalHours = totalSeconds / 3600;
  const totalBillable = project.hourly_rate ? totalHours * project.hourly_rate : 0;
  const budgetPercent = project.budget_hours ? Math.min((totalHours / project.budget_hours) * 100, 100) : null;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-[var(--surface-hover)] transition cursor-pointer">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg shrink-0" style={{ backgroundColor: project.color + "15" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={project.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {expanded
                ? <path d="M5 19a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v1M5 19h14a2 2 0 0 0 2-2l-2-7H3l2 7Z"/>
                : <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>}
            </svg>
          </div>
          <div className="text-left min-w-0">
            <div className="text-sm font-medium text-[var(--foreground)] truncate">{project.name}</div>
            {project.client_name && <div className="text-[10px] text-[var(--muted)] truncate">{project.client_name}</div>}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="text-right">
            <div className="text-sm font-mono font-semibold text-[var(--foreground)] timer-display">{formatHours(totalSeconds)}h</div>
            <div className="text-[10px] text-[var(--muted)]">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
              {totalBillable > 0 && <span className="ml-1 text-[var(--success)]">${totalBillable.toFixed(0)}</span>}
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-[var(--muted-light)] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </button>

      {/* Budget progress bar */}
      {budgetPercent !== null && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-[9px] text-[var(--muted)] mb-0.5">
            <span>{formatHours(totalSeconds)} / {project.budget_hours}h budget</span>
            <span>{budgetPercent.toFixed(0)}%</span>
          </div>
          <div className="w-full h-1 rounded-full bg-[var(--card-border)] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${budgetPercent}%`, backgroundColor: budgetPercent > 90 ? "var(--danger)" : project.color }} />
          </div>
        </div>
      )}

      {/* Notes */}
      {expanded && project.notes && (
        <div className="px-4 py-2 border-t border-[var(--card-border)] text-[10px] text-[var(--muted)] italic">{project.notes}</div>
      )}

      {expanded && (
        <div className={`border-t border-[var(--card-border)] animate-slide-down ${project.notes ? "" : ""}`}>
          {entries.length === 0 ? (
            <div className="p-4 text-center text-xs text-[var(--muted)]">No entries</div>
          ) : (
            <div className="divide-y divide-[var(--card-border)]">
              {entries.map((entry) => (
                <div key={entry.id} className="group flex items-center justify-between px-3 sm:px-4 py-2.5 hover:bg-[var(--surface-hover)] transition">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-[var(--foreground)] truncate">{entry.task_name}</div>
                    <div className="text-[10px] text-[var(--muted)] mt-0.5">{formatDate(entry.started_at)} &middot; {formatTime(entry.started_at)} &ndash; {entry.ended_at ? formatTime(entry.ended_at) : "ongoing"}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className="text-xs font-mono font-semibold text-[var(--foreground)] timer-display">{formatDuration(entry.duration_seconds || 0)}</span>
                    <div className="flex gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(entry); }} className="p-1 rounded text-[var(--muted)] hover:text-[var(--accent)] transition cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg></button>
                      <button onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} className="p-1 rounded text-[var(--muted)] hover:text-[var(--danger)] transition cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>
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

export default function ProjectFolders({ entries, projects, onEdit, onDelete }: ProjectFoldersProps) {
  const unassigned = entries.filter((e) => !e.project_id);
  const byProject = projects.map((project) => ({
    project, entries: entries.filter((e) => e.project_id === project.id),
  }));
  byProject.sort((a, b) => (b.entries[0]?.started_at || "").localeCompare(a.entries[0]?.started_at || ""));

  if (projects.length === 0 && unassigned.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-soft)] flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-[var(--foreground)]">No projects yet</p>
        <p className="text-xs text-[var(--muted)] mt-1">Create a project to organize your time entries</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 stagger-children">
      <span className="section-label">Projects</span>
      {byProject.map(({ project, entries: projEntries }) => (
        <FolderCard key={project.id} project={project} entries={projEntries} onEdit={onEdit} onDelete={onDelete} />
      ))}
      {unassigned.length > 0 && (
        <FolderCard project={{ name: "Unassigned", color: "#a8a29e", client_name: null, hourly_rate: null, budget_hours: null, notes: null }} entries={unassigned} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}
