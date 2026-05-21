"use client";

import type { Tag } from "@/lib/types";

type TagSelectorProps = {
  tags: Tag[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export default function TagSelector({
  tags,
  selectedIds,
  onChange,
  disabled,
}: TagSelectorProps) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id);
        return (
          <button
            key={tag.id}
            onClick={() => toggle(tag.id)}
            disabled={disabled}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              selected
                ? "ring-2 ring-offset-1 dark:ring-offset-zinc-900"
                : "opacity-60 hover:opacity-100"
            }`}
            style={{
              backgroundColor: tag.color + "20",
              color: tag.color,
              ...(selected ? { ringColor: tag.color } : {}),
            }}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
