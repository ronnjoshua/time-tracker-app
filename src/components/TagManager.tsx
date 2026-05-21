"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";
import Modal from "./ui/Modal";

const TAG_COLORS = [
  "#6b7280",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

type TagManagerProps = {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (tag: { name: string; color?: string }) => Promise<Tag | null>;
  onDeleteTag: (id: string) => Promise<boolean>;
};

export default function TagManager({
  open,
  onClose,
  tags,
  onCreateTag,
  onDeleteTag,
}: TagManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(TAG_COLORS[0]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onCreateTag({ name: name.trim(), color });
    setName("");
    setColor(TAG_COLORS[0]);
  };

  return (
    <Modal open={open} onClose={onClose} title="Manage Tags">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tag name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">Color:</span>
          {TAG_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full cursor-pointer transition ${
                color === c
                  ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-zinc-900"
                  : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {tags.length > 0 && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-2">
            {tags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: tag.color + "20",
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteTag(tag.id)}
                  className="p-1 text-zinc-400 hover:text-red-500 transition cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
