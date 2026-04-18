// ─── Tests: tenderflow-utils ──────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  daysUntil,
  strategyColor,
  strategyLabel,
  statusColor,
  statusLabel,
  SECTORS,
  REGIONS,
} from "@/lib/tenderflow-utils";

// ─── formatCurrency ───────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("should format GNF currency correctly", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("should return dash for null", () => {
    expect(formatCurrency(null)).toBe("—");
  });

  it("should return dash for undefined", () => {
    expect(formatCurrency(undefined)).toBe("—");
  });

  it("should handle zero", () => {
    const result = formatCurrency(0);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should handle large numbers", () => {
    const result = formatCurrency(50_000_000_000);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("should use GNF as default currency", () => {
    const result = formatCurrency(1000);
    // GNF doesn't use decimal places (maximumFractionDigits: 0)
    expect(result).not.toContain(".00");
  });

  it("should support EUR currency", () => {
    const result = formatCurrency(1000, "EUR");
    expect(result).toBeDefined();
  });
});

// ─── formatNumber ─────────────────────────────────────────────────────────────

describe("formatNumber", () => {
  it("should format numbers with French locale", () => {
    // French locale uses space as thousand separator
    const result = formatNumber(1500000);
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("should return dash for null", () => {
    expect(formatNumber(null)).toBe("—");
  });

  it("should return dash for undefined", () => {
    expect(formatNumber(undefined)).toBe("—");
  });

  it("should handle zero", () => {
    expect(formatNumber(0)).toBeDefined();
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("should format ISO date to French format", () => {
    const result = formatDate("2026-06-15");
    expect(result).toContain("15");
    expect(result).toContain("06");
    expect(result).toContain("2026");
  });

  it("should return dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("should return dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("should return dash for empty string", () => {
    expect(formatDate("")).toBe("—");
  });
});

// ─── formatDateTime ───────────────────────────────────────────────────────────

describe("formatDateTime", () => {
  it("should format ISO datetime to French format", () => {
    const result = formatDateTime("2026-06-15T14:30:00Z");
    expect(result).toContain("15");
    expect(result).toContain("06");
    expect(result).toContain("2026");
  });

  it("should return dash for null", () => {
    expect(formatDateTime(null)).toBe("—");
  });

  it("should return dash for undefined", () => {
    expect(formatDateTime(undefined)).toBe("—");
  });
});

// ─── daysUntil ────────────────────────────────────────────────────────────────

describe("daysUntil", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-18T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return positive days for future date", () => {
    const result = daysUntil("2026-05-18");
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(31);
  });

  it("should return negative days for past date", () => {
    const result = daysUntil("2025-01-01");
    expect(result).toBeLessThan(0);
  });

  it("should return approximately 0 for today", () => {
    const result = daysUntil("2026-04-18");
    expect(Math.abs(result!)).toBeLessThanOrEqual(1);
  });

  it("should return null for null input", () => {
    expect(daysUntil(null)).toBeNull();
  });

  it("should return null for undefined input", () => {
    expect(daysUntil(undefined)).toBeNull();
  });

  it("should return null for empty string", () => {
    expect(daysUntil("")).toBeNull();
  });
});

// ─── strategyColor ────────────────────────────────────────────────────────────

describe("strategyColor", () => {
  it("should return emerald colors for 'go'", () => {
    expect(strategyColor("go")).toContain("emerald");
  });

  it("should return amber colors for 'go_conditional'", () => {
    expect(strategyColor("go_conditional")).toContain("amber");
  });

  it("should return red colors for 'no_go'", () => {
    expect(strategyColor("no_go")).toContain("red");
  });

  it("should return gray colors for unknown strategy", () => {
    expect(strategyColor("unknown")).toContain("gray");
  });

  it("should return gray colors for null", () => {
    expect(strategyColor(null)).toContain("gray");
  });

  it("should return gray colors for undefined", () => {
    expect(strategyColor(undefined)).toContain("gray");
  });
});

// ─── strategyLabel ────────────────────────────────────────────────────────────

describe("strategyLabel", () => {
  it("should return 'GO' for 'go'", () => {
    expect(strategyLabel("go")).toBe("GO");
  });

  it("should return 'GO sous conditions' for 'go_conditional'", () => {
    expect(strategyLabel("go_conditional")).toBe("GO sous conditions");
  });

  it("should return 'NO GO' for 'no_go'", () => {
    expect(strategyLabel("no_go")).toBe("NO GO");
  });

  it("should return 'Non évalué' for unknown", () => {
    expect(strategyLabel("unknown")).toBe("Non évalué");
  });

  it("should return 'Non évalué' for null", () => {
    expect(strategyLabel(null)).toBe("Non évalué");
  });

  it("should return 'Non évalué' for undefined", () => {
    expect(strategyLabel(undefined)).toBe("Non évalué");
  });
});

// ─── statusColor ──────────────────────────────────────────────────────────────

describe("statusColor", () => {
  it("should return blue colors for 'new'", () => {
    expect(statusColor("new")).toContain("blue");
  });

  it("should return emerald colors for 'go'", () => {
    expect(statusColor("go")).toContain("emerald");
  });

  it("should return red colors for 'no_go'", () => {
    expect(statusColor("no_go")).toContain("red");
  });

  it("should return green colors for 'won'", () => {
    expect(statusColor("won")).toContain("green");
  });

  it("should return gray colors for unknown status", () => {
    expect(statusColor("unknown_status")).toContain("gray");
  });
});

// ─── statusLabel ──────────────────────────────────────────────────────────────

describe("statusLabel", () => {
  it("should return 'Nouveau' for 'new'", () => {
    expect(statusLabel("new")).toBe("Nouveau");
  });

  it("should return 'Qualification' for 'qualifying'", () => {
    expect(statusLabel("qualifying")).toBe("Qualification");
  });

  it("should return 'Qualifié' for 'qualified'", () => {
    expect(statusLabel("qualified")).toBe("Qualifié");
  });

  it("should return 'GO' for 'go'", () => {
    expect(statusLabel("go")).toBe("GO");
  });

  it("should return 'NO GO' for 'no_go'", () => {
    expect(statusLabel("no_go")).toBe("NO GO");
  });

  it("should return 'En réponse' for 'responding'", () => {
    expect(statusLabel("responding")).toBe("En réponse");
  });

  it("should return 'Gagné' for 'won'", () => {
    expect(statusLabel("won")).toBe("Gagné");
  });

  it("should return 'Perdu' for 'lost'", () => {
    expect(statusLabel("lost")).toBe("Perdu");
  });

  it("should return 'Expiré' for 'expired'", () => {
    expect(statusLabel("expired")).toBe("Expiré");
  });

  it("should return raw value for unknown status", () => {
    expect(statusLabel("custom_status")).toBe("custom_status");
  });
});

// ─── Constants ────────────────────────────────────────────────────────────────

describe("Constants", () => {
  it("SECTORS should contain key Guinea sectors", () => {
    expect(SECTORS).toContain("BTP");
    expect(SECTORS).toContain("Mines");
    expect(SECTORS).toContain("IT / Digital");
    expect(SECTORS).toContain("Énergie");
    expect(SECTORS).toContain("Santé");
  });

  it("REGIONS should contain all Guinea administrative regions", () => {
    expect(REGIONS).toContain("Conakry");
    expect(REGIONS).toContain("Kindia");
    expect(REGIONS).toContain("Boké");
    expect(REGIONS).toContain("Labé");
    expect(REGIONS).toContain("Faranah");
    expect(REGIONS).toContain("Kankan");
    expect(REGIONS).toContain("Nzérékoré");
    expect(REGIONS).toContain("Mamou");
    expect(REGIONS).toContain("National");
  });

  it("SECTORS should have at least 15 entries", () => {
    expect(SECTORS.length).toBeGreaterThanOrEqual(15);
  });

  it("REGIONS should have exactly 9 entries (8 regions + National)", () => {
    expect(REGIONS.length).toBe(9);
  });
});
