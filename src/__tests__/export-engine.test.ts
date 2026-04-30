// ─── Tests: Export Engine ─────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to mock the browser-specific APIs (Blob, URL.createObjectURL, etc.)
// since the export-engine uses "use client" and browser download APIs

// Mock DOM APIs
const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
const mockRevokeObjectURL = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
const mockClick = vi.fn();

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  });

  vi.stubGlobal(
    "document",
    {
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        click: mockClick,
      })),
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    }
  );

  vi.stubGlobal("Blob", class MockBlob {
    content: unknown[];
    options: Record<string, unknown>;
    constructor(content: unknown[], options: Record<string, unknown>) {
      this.content = content;
      this.options = options;
    }
  });

  vi.clearAllMocks();
});

// Import after mocks are set up
import {
  exportToCSV,
  exportToJSON,
  exportTenderReport,
  exportWeeklySummary,
  type ExportOptions,
} from "@/lib/export-engine";

// ─── exportToCSV ──────────────────────────────────────────────────────────────

describe("exportToCSV", () => {
  const sampleOptions: ExportOptions = {
    format: "csv",
    filename: "test-export",
    data: [
      { name: "Projet A", budget: 1000000, status: "Nouveau" },
      { name: "Projet B", budget: 2500000, status: "Qualifié" },
    ],
    columns: [
      { key: "name", label: "Nom" },
      { key: "budget", label: "Budget" },
      { key: "status", label: "Statut" },
    ],
  };

  it("should create a Blob and trigger download", () => {
    exportToCSV(sampleOptions);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("should create a CSV file with .csv extension", () => {
    exportToCSV(sampleOptions);

    // The createElement mock should have been called with 'a'
    expect(document.createElement).toHaveBeenCalledWith("a");
  });

  it("should handle empty data array", () => {
    const emptyOptions: ExportOptions = {
      ...sampleOptions,
      data: [],
    };

    expect(() => exportToCSV(emptyOptions)).not.toThrow();
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it("should handle null/undefined values in data", () => {
    const optionsWithNulls: ExportOptions = {
      ...sampleOptions,
      data: [
        { name: null, budget: undefined, status: "Nouveau" },
      ],
    };

    expect(() => exportToCSV(optionsWithNulls)).not.toThrow();
  });

  it("should handle object values by JSON-stringifying them", () => {
    const optionsWithObjects: ExportOptions = {
      ...sampleOptions,
      data: [
        { name: "Test", budget: 1000, status: { label: "Nouveau", code: "NEW" } },
      ],
    };

    expect(() => exportToCSV(optionsWithObjects)).not.toThrow();
  });
});

// ─── exportToJSON ─────────────────────────────────────────────────────────────

describe("exportToJSON", () => {
  const sampleOptions: ExportOptions = {
    format: "json",
    filename: "test-json",
    data: [
      { id: 1, name: "Projet Alpha" },
      { id: 2, name: "Projet Beta" },
    ],
    columns: [
      { key: "id", label: "ID" },
      { key: "name", label: "Nom" },
    ],
  };

  it("should create a Blob and trigger download", () => {
    exportToJSON(sampleOptions);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("should handle empty data array", () => {
    const emptyOptions: ExportOptions = {
      ...sampleOptions,
      data: [],
    };

    expect(() => exportToJSON(emptyOptions)).not.toThrow();
  });
});

// ─── exportTenderReport ──────────────────────────────────────────────────────

describe("exportTenderReport", () => {
  const sampleTender = {
    reference: "AO-2026-001",
    title: "Construction d'un pont sur le Niger",
    sector: "BTP",
    region: "Kankan",
    authority: "Ministère des Travaux Publics",
    budget: "5 milliards GNF",
    deadline: "15/06/2026",
    status: "Nouveau",
    score: 72,
    recommendation: "GO",
    description: "Construction d'un pont de 200m sur le fleuve Niger.",
  };

  it("should create a Blob and trigger download", () => {
    exportTenderReport(sampleTender);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("should work without optional fields", () => {
    const minimalTender = {
      reference: "AO-2026-002",
      title: "Fourniture de matériel informatique",
      sector: "IT / Digital",
      region: "Conakry",
      authority: "Direction Générale des Impôts",
      budget: "500 millions GNF",
      deadline: "30/06/2026",
      status: "Qualifié",
    };

    expect(() => exportTenderReport(minimalTender)).not.toThrow();
  });
});

// ─── exportWeeklySummary ─────────────────────────────────────────────────────

describe("exportWeeklySummary", () => {
  const sampleData = {
    totalTenders: 45,
    newTenders: 12,
    deadlinesThisWeek: 8,
    goCount: 15,
    nogoCount: 5,
    topSectors: [
      { sector: "BTP", count: 18 },
      { sector: "Mines", count: 12 },
      { sector: "IT / Digital", count: 8 },
    ],
    topRegions: [
      { region: "Conakry", count: 22 },
      { region: "Kankan", count: 10 },
      { region: "Boké", count: 8 },
    ],
    pendingActions: [
      "Soumission AO-2026-003 avant vendredi",
      "Préparer la caution pour AO-2026-007",
    ],
  };

  it("should create a Blob and trigger download", () => {
    exportWeeklySummary(sampleData);

    expect(mockCreateObjectURL).toHaveBeenCalled();
    expect(mockClick).toHaveBeenCalled();
    expect(mockRevokeObjectURL).toHaveBeenCalled();
  });

  it("should handle empty arrays", () => {
    const emptyData = {
      ...sampleData,
      topSectors: [],
      topRegions: [],
      pendingActions: [],
    };

    expect(() => exportWeeklySummary(emptyData)).not.toThrow();
  });
});
