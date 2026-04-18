"use client";

/**
 * Export engine for generating reports from tender data.
 * Produces CSV exports and triggers downloads in the browser.
 */

export interface ExportOptions {
  format: "csv" | "json";
  filename: string;
  data: Record<string, unknown>[];
  columns: { key: string; label: string }[];
}

/**
 * Export data as CSV file and trigger browser download
 */
export function exportToCSV(options: ExportOptions): void {
  const { filename, data, columns } = options;

  // Build CSV header
  const header = columns.map((col) => `"${col.label}"`).join(",");

  // Build CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key];
        if (value === null || value === undefined) return '""';
        if (typeof value === "object") return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        return `"${String(value).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csv = [header, ...rows].join("\n");

  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data as JSON file and trigger browser download
 */
export function exportToJSON(options: ExportOptions): void {
  const { filename, data } = options;

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
  downloadBlob(blob, `${filename}.json`);
}

/**
 * Export a single tender as a formatted text report
 */
export function exportTenderReport(tender: {
  reference: string;
  title: string;
  sector: string;
  region: string;
  authority: string;
  budget: string;
  deadline: string;
  status: string;
  score?: number;
  recommendation?: string;
  description?: string;
}): void {
  const lines = [
    "═══════════════════════════════════════════════════════",
    `  RAPPORT D'APPEL D'OFFRES — ${tender.reference}`,
    "═══════════════════════════════════════════════════════",
    "",
    `  Titre : ${tender.title}`,
    `  Référence : ${tender.reference}`,
    `  Secteur : ${tender.sector}`,
    `  Région : ${tender.region}`,
    `  Autorité : ${tender.authority}`,
    `  Budget : ${tender.budget}`,
    `  Date limite : ${tender.deadline}`,
    `  Statut : ${tender.status}`,
    "",
    "───────────────────────────────────────────────────────",
    "  ANALYSE IA",
    "───────────────────────────────────────────────────────",
    "",
    `  Score global : ${tender.score ?? "N/A"}%`,
    `  Recommandation : ${tender.recommendation ?? "N/A"}`,
    "",
    "───────────────────────────────────────────────────────",
    "  DESCRIPTION",
    "───────────────────────────────────────────────────────",
    "",
    tender.description ?? "Aucune description disponible.",
    "",
    "═══════════════════════════════════════════════════════",
    `  Généré par TenderFlow Guinea — ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
    "═══════════════════════════════════════════════════════",
  ];

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  downloadBlob(blob, `rapport-${tender.reference}.txt`);
}

/**
 * Generate a weekly summary report
 */
export function exportWeeklySummary(data: {
  totalTenders: number;
  newTenders: number;
  deadlinesThisWeek: number;
  goCount: number;
  nogoCount: number;
  topSectors: { sector: string; count: number }[];
  topRegions: { region: string; count: number }[];
  pendingActions: string[];
}): void {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const lines = [
    "═══════════════════════════════════════════════════════════",
    "  RAPPORT HEBDOMADAIRE TENDERFLOW GUINEA",
    `  Semaine du ${formatDate(weekStart)} au ${formatDate(weekEnd)}`,
    "═══════════════════════════════════════════════════════════",
    "",
    "  RÉSUMÉ",
    "───────────────────────────────────────────────────────────",
    `  Total appels d'offres actifs : ${data.totalTenders}`,
    `  Nouveaux cette semaine : ${data.newTenders}`,
    `  Échéances cette semaine : ${data.deadlinesThisWeek}`,
    `  Recommandations GO : ${data.goCount}`,
    `  Recommandations NO-GO : ${data.nogoCount}`,
    "",
    "  TOP SECTEURS",
    "───────────────────────────────────────────────────────────",
    ...data.topSectors.map((s, i) => `  ${i + 1}. ${s.sector} — ${s.count} AO`),
    "",
    "  TOP RÉGIONS",
    "───────────────────────────────────────────────────────────",
    ...data.topRegions.map((r, i) => `  ${i + 1}. ${r.region} — ${r.count} AO`),
    "",
    "  ACTIONS EN ATTENTE",
    "───────────────────────────────────────────────────────────",
    ...data.pendingActions.map((a, i) => `  • ${a}`),
    "",
    "═══════════════════════════════════════════════════════════",
    `  Généré par TenderFlow Guinea — ${formatDate(now)}`,
    "═══════════════════════════════════════════════════════════",
  ];

  const text = lines.join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
  downloadBlob(blob, `rapport-hebdomadaire-${now.toISOString().slice(0, 10)}.txt`);
}

// ===== Helpers =====
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
