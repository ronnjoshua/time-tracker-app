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
      className="input-premium px-3 py-3 rounded-xl text-[var(--foreground)] disabled:opacity-40 text-xs cursor-pointer"
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
