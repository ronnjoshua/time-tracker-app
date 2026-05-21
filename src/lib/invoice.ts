import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import type { TimeEntry } from "./types";

type InvoiceOptions = {
  entries: TimeEntry[];
  projectName: string;
  clientName: string;
  yourName: string;
  hourlyRate: number;
  invoiceNumber?: string;
  notes?: string;
  taxRate?: number;
};

export function generateInvoicePDF(options: InvoiceOptions) {
  const {
    entries,
    projectName,
    clientName,
    yourName,
    hourlyRate,
    invoiceNumber,
    notes,
    taxRate,
  } = options;

  const doc = new jsPDF();
  const invoiceNum =
    invoiceNumber || `INV-${format(new Date(), "yyyyMMdd-HHmm")}`;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 20, 30);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice #: ${invoiceNum}`, 20, 40);
  doc.text(`Date: ${format(new Date(), "MMM dd, yyyy")}`, 20, 46);

  // From / To
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("From:", 20, 60);
  doc.setFont("helvetica", "normal");
  doc.text(yourName, 20, 66);

  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 120, 60);
  doc.setFont("helvetica", "normal");
  doc.text(clientName, 120, 66);

  doc.setFont("helvetica", "bold");
  doc.text(`Project: ${projectName}`, 20, 80);

  // Table data
  const tableRows = entries.map((entry) => {
    const hours = (entry.duration_seconds || 0) / 3600;
    const amount = hours * hourlyRate;
    return [
      format(new Date(entry.started_at), "MMM dd, yyyy"),
      entry.task_name,
      hours.toFixed(2),
      `$${hourlyRate.toFixed(2)}`,
      `$${amount.toFixed(2)}`,
    ];
  });

  const totalHours = entries.reduce(
    (sum, e) => sum + (e.duration_seconds || 0) / 3600,
    0
  );
  const subtotal = totalHours * hourlyRate;
  const tax = taxRate ? subtotal * (taxRate / 100) : 0;
  const total = subtotal + tax;

  autoTable(doc, {
    startY: 88,
    head: [["Date", "Description", "Hours", "Rate", "Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  // Totals
  const totalsX = 140;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.text("Subtotal:", totalsX, totalsY);
  doc.text(`$${subtotal.toFixed(2)}`, 175, totalsY, { align: "right" });

  if (taxRate) {
    totalsY += 8;
    doc.text(`Tax (${taxRate}%):`, totalsX, totalsY);
    doc.text(`$${tax.toFixed(2)}`, 175, totalsY, { align: "right" });
  }

  totalsY += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total:", totalsX, totalsY);
  doc.text(`$${total.toFixed(2)}`, 175, totalsY, { align: "right" });

  // Notes
  if (notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Notes:", 20, totalsY + 20);
    doc.text(notes, 20, totalsY + 26);
  }

  // Download
  doc.save(`${invoiceNum}.pdf`);
}
