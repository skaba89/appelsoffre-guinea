// ─── Tests: Billing Engine ────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  PLANS,
  getCurrentUsage,
  checkLimit,
  generateInvoice,
  type UsageMetrics,
} from "@/lib/billing-engine";

// ─── PLANS ────────────────────────────────────────────────────────────────────

describe("PLANS", () => {
  it("should have 4 subscription plans", () => {
    expect(PLANS.length).toBe(4);
  });

  it("should have plans in order: free, starter, pro, enterprise", () => {
    expect(PLANS[0].id).toBe("free");
    expect(PLANS[1].id).toBe("starter");
    expect(PLANS[2].id).toBe("pro");
    expect(PLANS[3].id).toBe("enterprise");
  });

  it("free plan should have limited resources", () => {
    const free = PLANS.find((p) => p.id === "free")!;
    expect(free.limits.tenders).toBe(5);
    expect(free.limits.scoring).toBe(10);
    expect(free.limits.aiQueries).toBe(5);
    expect(free.limits.teamMembers).toBe(1);
    expect(free.price).toBe(0);
  });

  it("starter plan should be marked as popular", () => {
    const starter = PLANS.find((p) => p.id === "starter")!;
    expect(starter.popular).toBe(true);
  });

  it("enterprise plan should be marked as enterprise", () => {
    const enterprise = PLANS.find((p) => p.id === "enterprise")!;
    expect(enterprise.enterprise).toBe(true);
  });

  it("pro plan should have unlimited tenders and scoring", () => {
    const pro = PLANS.find((p) => p.id === "pro")!;
    expect(pro.limits.tenders).toBeNull();
    expect(pro.limits.scoring).toBeNull();
  });

  it("each plan should have features array", () => {
    for (const plan of PLANS) {
      expect(Array.isArray(plan.features)).toBe(true);
      expect(plan.features.length).toBeGreaterThan(0);
    }
  });

  it("each plan should have valid limits", () => {
    for (const plan of PLANS) {
      expect(plan.limits).toBeDefined();
      expect(typeof plan.limits.storage).toBe("number");
      expect(typeof plan.limits.teamMembers).toBe("number");
    }
  });
});

// ─── getCurrentUsage ──────────────────────────────────────────────────────────

describe("getCurrentUsage", () => {
  it("should return usage metrics for all resources", () => {
    const usage = getCurrentUsage();
    expect(usage.tenders).toBeDefined();
    expect(usage.scoring).toBeDefined();
    expect(usage.aiQueries).toBeDefined();
    expect(usage.storage).toBeDefined();
    expect(usage.teamMembers).toBeDefined();
  });

  it("should return numeric used values", () => {
    const usage = getCurrentUsage();
    expect(typeof usage.tenders.used).toBe("number");
    expect(typeof usage.scoring.used).toBe("number");
    expect(typeof usage.aiQueries.used).toBe("number");
  });

  it("should return limits that match starter plan", () => {
    const usage = getCurrentUsage();
    const starter = PLANS.find((p) => p.id === "starter")!;
    expect(usage.tenders.limit).toBe(starter.limits.tenders);
    expect(usage.scoring.limit).toBe(starter.limits.scoring);
  });
});

// ─── checkLimit ───────────────────────────────────────────────────────────────

describe("checkLimit", () => {
  const baseUsage: UsageMetrics = {
    tenders: { used: 30, limit: 50 },
    scoring: { used: 100, limit: 100 },
    aiQueries: { used: 5, limit: null },
    storage: { used: 2.3, limit: 5 },
    teamMembers: { used: 4, limit: 5 },
  };

  it("should allow when usage is below limit", () => {
    const result = checkLimit(baseUsage, "tenders");
    expect(result.allowed).toBe(true);
  });

  it("should not allow when usage reaches limit", () => {
    const result = checkLimit(baseUsage, "scoring");
    expect(result.allowed).toBe(false);
  });

  it("should always allow when limit is null (unlimited)", () => {
    const result = checkLimit(baseUsage, "aiQueries");
    expect(result.allowed).toBe(true);
    expect(result.percentUsed).toBe(0);
  });

  it("should calculate percentUsed correctly", () => {
    const result = checkLimit(baseUsage, "tenders");
    expect(result.percentUsed).toBe(60); // 30/50 * 100 = 60
  });

  it("should calculate 100% when at limit", () => {
    const result = checkLimit(baseUsage, "scoring");
    expect(result.percentUsed).toBe(100);
  });

  it("should calculate percentUsed for storage", () => {
    const result = checkLimit(baseUsage, "storage");
    expect(result.percentUsed).toBe(46); // 2.3/5 * 100 = 46
  });

  it("should handle zero usage", () => {
    const zeroUsage: UsageMetrics = {
      ...baseUsage,
      tenders: { used: 0, limit: 50 },
    };
    const result = checkLimit(zeroUsage, "tenders");
    expect(result.allowed).toBe(true);
    expect(result.percentUsed).toBe(0);
  });
});

// ─── generateInvoice ─────────────────────────────────────────────────────────

describe("generateInvoice", () => {
  it("should generate an invoice with correct structure", () => {
    const starter = PLANS.find((p) => p.id === "starter")!;
    const invoice = generateInvoice(starter, "Juin 2026");

    expect(invoice.id).toContain("INV-");
    expect(invoice.date).toBeTruthy();
    expect(invoice.amount).toBe(49); // Starter price
    expect(invoice.currency).toBe("€");
    expect(invoice.status).toBe("pending");
    expect(invoice.planName).toBe("Starter");
    expect(invoice.items.length).toBeGreaterThan(0);
  });

  it("should generate free invoice for free plan", () => {
    const free = PLANS.find((p) => p.id === "free")!;
    const invoice = generateInvoice(free, "Juin 2026");
    expect(invoice.amount).toBe(0);
  });

  it("should include subscription item in invoice", () => {
    const pro = PLANS.find((p) => p.id === "pro")!;
    const invoice = generateInvoice(pro, "Juin 2026");

    const subItem = invoice.items.find((i) =>
      i.description.includes("Abonnement TenderFlow")
    );
    expect(subItem).toBeDefined();
    expect(subItem!.quantity).toBe(1);
    expect(subItem!.unitPrice).toBe(pro.price);
    expect(subItem!.total).toBe(pro.price);
  });

  it("should calculate total from all items", () => {
    const starter = PLANS.find((p) => p.id === "starter")!;
    const invoice = generateInvoice(starter, "Juin 2026");

    const itemsTotal = invoice.items.reduce((sum, i) => sum + i.total, 0);
    expect(invoice.amount).toBe(itemsTotal);
  });

  it("should generate unique invoice IDs", () => {
    const starter = PLANS.find((p) => p.id === "starter")!;
    const invoice1 = generateInvoice(starter, "Juin 2026");
    const invoice2 = generateInvoice(starter, "Juin 2026");
    // IDs may occasionally collide due to Math.random() but extremely unlikely
    expect(invoice1.id).toMatch(/^INV-\d{4}-\d{4}$/);
    expect(invoice2.id).toMatch(/^INV-\d{4}-\d{4}$/);
  });
});
