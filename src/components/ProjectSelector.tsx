"use client";

import type { Project } from "@/lib/types";

type ProjectSelectorProps = {
  projects: Project[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  disabled?: boolean;
};

export default function ProjectSelector({
  projects,
  selectedId,
  onChange,
  disabled,
}: ProjectSelectorProps) {
  return (
    <select
      value={selectedId || ""}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
      className="px-3 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 transition text-sm cursor-pointer"
    >
      <option value="">No project</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
          {p.client_name ? ` (${p.client_name})` : ""}
        </option>
      ))}
    </select>
  );
}
