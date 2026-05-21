"use client";

import { useState } from "react";
import type { TimeEntry, Project } from "@/lib/types";
import { generateInvoicePDF } from "@/lib/invoice";
import Modal from "./ui/Modal";

type InvoiceGeneratorProps = {
  open: boolean;
  onClose: () => void;
  entries: TimeEntry[];
  projects: Project[];
};

export default function InvoiceGenerator({
  open,
  onClose,
  entries,
  projects,
}: InvoiceGeneratorProps) {
  const [projectId, setProjectId] = useState<string>("");
  const [yourName, setYourName] = useState("");
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const selectedProject = projects.find((p) => p.id === projectId);
  const filteredEntries = projectId
    ? entries.filter((e) => e.project_id === projectId)
    : entries;

  const totalHours = filteredEntries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0) / 3600,
    0
  );
  const rate = selectedProject?.hourly_rate || 0;

  const handleGenerate = () => {
    if (!yourName.trim()) return;

    generateInvoicePDF({
      entries: filteredEntries,
      projectName: selectedProject?.name || "General",
      clientName: selectedProject?.client_name || "Client",
      yourName: yourName.trim(),
      hourlyRate: rate,
      invoiceNumber: invoiceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      taxRate: taxRate ? parseFloat(taxRate) : undefined,
    });

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Generate Invoice">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Project
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All entries</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.client_name ? ` (${p.client_name})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Your Name / Company
          </label>
          <input
            type="text"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Invoice # (optional)
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-001"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Tax % (optional)
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              placeholder="0"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, thank you message, etc."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Preview */}
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-sm">
          <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
            <span>Entries: {filteredEntries.length}</span>
            <span>Hours: {totalHours.toFixed(2)}</span>
            <span>Rate: ${rate.toFixed(2)}/hr</span>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Total: ${(totalHours * rate).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium transition cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!yourName.trim() || filteredEntries.length === 0}
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 text-white text-sm font-medium transition cursor-pointer disabled:cursor-not-allowed"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </Modal>
  );
}
