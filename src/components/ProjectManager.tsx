"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";
import Modal from "./ui/Modal";

const PROJECT_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

type ProjectManagerProps = {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  onCreateProject: (project: {
    name: string;
    client_name?: string;
    hourly_rate?: number;
    color?: string;
  }) => Promise<Project | null>;
  onUpdateProject: (
    id: string,
    updates: Partial<Omit<Project, "id" | "created_at">>
  ) => Promise<boolean>;
  onDeleteProject: (id: string) => Promise<boolean>;
};

export default function ProjectManager({
  open,
  onClose,
  projects,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: ProjectManagerProps) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setClientName("");
    setHourlyRate("");
    setColor(PROJECT_COLORS[0]);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await onUpdateProject(editingId, {
        name: name.trim(),
        client_name: clientName.trim() || null,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
        color,
      });
    } else {
      await onCreateProject({
        name: name.trim(),
        client_name: clientName.trim() || undefined,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        color,
      });
    }

    resetForm();
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setName(project.name);
    setClientName(project.client_name || "");
    setHourlyRate(project.hourly_rate ? String(project.hourly_rate) : "");
    setColor(project.color);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Manage Projects"
    >
      <div className="space-y-4">
        {/* Form */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Client name (optional)"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Hourly rate (optional)"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Color:</span>
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full cursor-pointer transition ${
                  color === c
                    ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900"
                    : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
            >
              {editingId ? "Update" : "Add Project"}
            </button>
            {editingId && (
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Project list */}
        {projects.length > 0 && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: project.color }}
                  />
                  <div>
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {project.name}
                    </span>
                    {project.client_name && (
                      <span className="text-xs text-zinc-400 ml-1">
                        ({project.client_name})
                      </span>
                    )}
                    {project.hourly_rate && (
                      <span className="text-xs text-emerald-500 ml-2">
                        ${project.hourly_rate}/hr
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(project)}
                    className="p-1 text-zinc-400 hover:text-blue-500 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>
                  </button>
                  <button
                    onClick={() => onDeleteProject(project.id)}
                    className="p-1 text-zinc-400 hover:text-red-500 transition cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
