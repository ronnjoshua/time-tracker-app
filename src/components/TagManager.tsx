"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";
import Modal from "./ui/Modal";

const TAG_COLORS = ["#78716c", "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];

type TagManagerProps = {
  open: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (tag: { name: string; color?: string }) => Promise<Tag | null>;
  onDeleteTag: (id: string) => Promise<boolean>;
};

export default function TagManager({ open, onClose, tags, onCreateTag, onDeleteTag }: TagManagerProps) {
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
          <input type="text" placeholder="Tag name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }} className="input-premium flex-1 px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
          <button onClick={handleSubmit} disabled={!name.trim()} className="btn-premium px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] active:scale-95">Add</button>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-[var(--muted)] mr-1">Color:</span>
          {TAG_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full cursor-pointer transition active:scale-90 ${color === c ? "ring-2 ring-offset-2 ring-[var(--accent)] ring-offset-[var(--card)]" : ""}`} style={{ backgroundColor: c }} />
          ))}
        </div>

        {tags.length > 0 && (
          <div className="border-t border-[var(--card-border)] pt-3 space-y-1">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--surface-hover)] active:bg-[var(--card-border)] transition">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: tag.color + "20", color: tag.color }}>{tag.name}</span>
                <button onClick={() => onDeleteTag(tag.id)} className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--danger)] active:bg-[var(--danger-soft)] transition cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center">
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
