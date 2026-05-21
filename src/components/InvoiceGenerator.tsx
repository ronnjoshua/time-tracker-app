"use client";

import { useState } from "react";
import type { TimeEntry, Project } from "@/lib/types";
import { generateInvoicePDF } from "@/lib/invoice";
import Modal from "./ui/Modal";

type InvoiceGeneratorProps = { open: boolean; onClose: () => void; entries: TimeEntry[]; projects: Project[] };

export default function InvoiceGenerator({ open, onClose, entries, projects }: InvoiceGeneratorProps) {
  const [projectId, setProjectId] = useState<string>("");
  const [yourName, setYourName] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const selectedProject = projects.find((p) => p.id === projectId);
  const filteredEntries = projectId ? entries.filter((e) => e.project_id === projectId) : entries;
  const totalHours = filteredEntries.reduce((s, e) => s + (e.duration_seconds || 0) / 3600, 0);
  const rate = selectedProject?.hourly_rate || 0;

  const handleGenerate = () => {
    if (!yourName.trim()) return;
    generateInvoicePDF({ entries: filteredEntries, projectName: selectedProject?.name || "General", clientName: selectedProject?.client_name || "Client", yourName: yourName.trim(), hourlyRate: rate, invoiceNumber: invoiceNumber.trim() || undefined, notes: notes.trim() || undefined, taxRate: taxRate ? parseFloat(taxRate) : undefined });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Invoice">
      <div className="space-y-4">
        <div>
          <label className="section-label mb-1 block">Project</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] cursor-pointer min-h-[44px]">
            <option value="">All entries</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}{p.client_name ? ` (${p.client_name})` : ""}</option>)}
          </select>
        </div>
        <div>
          <label className="section-label mb-1 block">Your Name / Company</label>
          <input type="text" value={yourName} onChange={(e) => setYourName(e.target.value)} placeholder="John Doe" className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="section-label mb-1 block">Invoice # (optional)</label>
            <input type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="INV-001" className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
          </div>
          <div>
            <label className="section-label mb-1 block">Tax % (optional)</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0" min="0" step="0.1" className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] min-h-[44px]" />
          </div>
        </div>
        <div>
          <label className="section-label mb-1 block">Notes (optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank you message..." rows={2} className="input-premium w-full px-3 py-2.5 rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted)] resize-none" />
        </div>

        {/* Preview */}
        <div className="glass-card rounded-lg p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div><span className="text-[var(--muted)]">Entries</span><div className="font-medium text-[var(--foreground)]">{filteredEntries.length}</div></div>
            <div><span className="text-[var(--muted)]">Hours</span><div className="font-medium text-[var(--foreground)]">{totalHours.toFixed(2)}</div></div>
            <div><span className="text-[var(--muted)]">Rate</span><div className="font-medium text-[var(--foreground)]">${rate.toFixed(2)}/hr</div></div>
            <div><span className="text-[var(--muted)]">Total</span><div className="font-semibold text-[var(--success)]">${(totalHours * rate).toFixed(2)}</div></div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="btn-premium px-4 py-2.5 rounded-lg glass-card text-[var(--muted)] text-sm font-medium cursor-pointer min-h-[44px] active:scale-95">Cancel</button>
          <button onClick={handleGenerate} disabled={!yourName.trim() || filteredEntries.length === 0} className="btn-premium px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] active:scale-95">Generate PDF</button>
        </div>
      </div>
    </Modal>
  );
}
