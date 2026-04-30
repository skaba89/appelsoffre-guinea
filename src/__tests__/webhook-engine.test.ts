// ─── Tests: Webhook Engine ──────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from "vitest";
import {
  registerWebhook,
  deleteWebhook,
  deliverWebhook,
  getWebhookDeliveries,
  listWebhooks,
  getWebhook,
  testWebhook,
  seedDemoWebhooks,
  webhookStatusLabel,
  webhookStatusColor,
  WEBHOOK_EVENTS,
  ALL_WEBHOOK_EVENTS,
  type WebhookEvent,
} from "@/lib/webhook-engine";

// ─── Registration ───────────────────────────────────────────────────────────────

describe("registerWebhook", () => {
  beforeEach(() => {
    // Clear webhooks before each test
    const existing = listWebhooks();
    existing.forEach((w) => deleteWebhook(w.id));
  });

  it("should register a valid webhook", () => {
    const result = registerWebhook(
      "https://example.com/webhook",
      ["new_tender"],
      "Test webhook"
    );
    expect(result.success).toBe(true);
    expect(result.webhook).toBeDefined();
    expect(result.webhook!.url).toBe("https://example.com/webhook");
    expect(result.webhook!.events).toEqual(["new_tender"]);
    expect(result.webhook!.status).toBe("active");
  });

  it("should reject invalid URL", () => {
    const result = registerWebhook("not-a-url", ["new_tender"], "Test");
    expect(result.success).toBe(false);
    expect(result.error).toContain("invalide");
  });

  it("should reject empty URL", () => {
    const result = registerWebhook("", ["new_tender"], "Test");
    expect(result.success).toBe(false);
  });

  it("should reject empty events array", () => {
    const result = registerWebhook("https://example.com/hook", [], "Test");
    expect(result.success).toBe(false);
    expect(result.error).toContain("événement");
  });

  it("should reject invalid event types", () => {
    const result = registerWebhook(
      "https://example.com/hook",
      ["invalid_event" as WebhookEvent],
      "Test"
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("invalid_event");
  });

  it("should reject duplicate URL", () => {
    registerWebhook("https://example.com/hook", ["new_tender"], "First");
    const result = registerWebhook("https://example.com/hook", ["score_update"], "Second");
    expect(result.success).toBe(false);
    expect(result.error).toContain("existe déjà");
  });

  it("should generate unique IDs", () => {
    const r1 = registerWebhook("https://a.com/hook", ["new_tender"], "A");
    const r2 = registerWebhook("https://b.com/hook", ["new_tender"], "B");
    expect(r1.webhook!.id).not.toBe(r2.webhook!.id);
  });
});

// ─── Delivery ───────────────────────────────────────────────────────────────────

describe("deliverWebhook", () => {
  beforeEach(() => {
    const existing = listWebhooks();
    existing.forEach((w) => deleteWebhook(w.id));
  });

  it("should deliver a webhook event", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    const result = deliverWebhook(reg.webhook!.id, "new_tender", { tenderId: "t-001" });
    expect(result.success).toBe(true);
    expect(result.delivery).toBeDefined();
    expect(result.delivery!.event).toBe("new_tender");
  });

  it("should reject delivery for non-existent webhook", () => {
    const result = deliverWebhook("wh-nonexistent", "new_tender", {});
    expect(result.success).toBe(false);
    expect(result.error).toContain("introuvable");
  });

  it("should reject delivery for unsubscribed event", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    const result = deliverWebhook(reg.webhook!.id, "score_update", { score: 95 });
    expect(result.success).toBe(false);
    expect(result.error).toContain("pas abonné");
  });

  it("should record delivery in history", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    deliverWebhook(reg.webhook!.id, "new_tender", { tenderId: "t-001" });
    const deliveries = getWebhookDeliveries(reg.webhook!.id);
    expect(deliveries.length).toBeGreaterThan(0);
  });

  it("should set success/error based on simulated result", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    // Deliver multiple times to get varied results
    for (let i = 0; i < 10; i++) {
      deliverWebhook(reg.webhook!.id, "new_tender", { i });
    }
    const deliveries = getWebhookDeliveries(reg.webhook!.id, 10);
    const hasSuccess = deliveries.some((d) => d.success);
    expect(hasSuccess).toBe(true); // With 80% success rate, very likely
  });
});

// ─── Deletion ───────────────────────────────────────────────────────────────────

describe("deleteWebhook", () => {
  beforeEach(() => {
    const existing = listWebhooks();
    existing.forEach((w) => deleteWebhook(w.id));
  });

  it("should delete an existing webhook", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    const result = deleteWebhook(reg.webhook!.id);
    expect(result.success).toBe(true);
    expect(getWebhook(reg.webhook!.id)).toBeUndefined();
  });

  it("should fail for non-existent webhook", () => {
    const result = deleteWebhook("wh-nonexistent");
    expect(result.success).toBe(false);
    expect(result.error).toContain("introuvable");
  });

  it("should also clear delivery history", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    deliverWebhook(reg.webhook!.id, "new_tender", { test: true });
    deleteWebhook(reg.webhook!.id);
    const deliveries = getWebhookDeliveries(reg.webhook!.id);
    expect(deliveries.length).toBe(0);
  });
});

// ─── List & Get ─────────────────────────────────────────────────────────────────

describe("listWebhooks and getWebhook", () => {
  beforeEach(() => {
    const existing = listWebhooks();
    existing.forEach((w) => deleteWebhook(w.id));
  });

  it("should list all registered webhooks", () => {
    registerWebhook("https://a.com/hook", ["new_tender"], "A");
    registerWebhook("https://b.com/hook", ["score_update"], "B");
    const all = listWebhooks();
    expect(all.length).toBe(2);
  });

  it("should get a webhook by ID", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    const found = getWebhook(reg.webhook!.id);
    expect(found).toBeDefined();
    expect(found!.url).toBe("https://example.com/hook");
  });

  it("should return undefined for non-existent ID", () => {
    const found = getWebhook("wh-nonexistent");
    expect(found).toBeUndefined();
  });
});

// ─── Test Webhook ───────────────────────────────────────────────────────────────

describe("testWebhook", () => {
  beforeEach(() => {
    const existing = listWebhooks();
    existing.forEach((w) => deleteWebhook(w.id));
  });

  it("should send a test delivery", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    const result = testWebhook(reg.webhook!.id);
    expect(result.success).toBe(true);
    expect(result.delivery).toBeDefined();
    expect(result.delivery!.success).toBe(true);
    expect(result.delivery!.statusCode).toBe(200);
  });

  it("should fail for non-existent webhook", () => {
    const result = testWebhook("wh-nonexistent");
    expect(result.success).toBe(false);
  });

  it("should include test mode in payload", () => {
    const reg = registerWebhook("https://example.com/hook", ["new_tender"], "Test");
    const result = testWebhook(reg.webhook!.id);
    expect(result.delivery!.payload.testMode).toBe(true);
  });
});

// ─── Seed Demo ──────────────────────────────────────────────────────────────────

describe("seedDemoWebhooks", () => {
  beforeEach(() => {
    const existing = listWebhooks();
    existing.forEach((w) => deleteWebhook(w.id));
  });

  it("should populate demo webhooks when store is empty", () => {
    seedDemoWebhooks();
    const all = listWebhooks();
    expect(all.length).toBeGreaterThan(0);
  });

  it("should not duplicate webhooks on repeated calls", () => {
    seedDemoWebhooks();
    const count1 = listWebhooks().length;
    seedDemoWebhooks();
    const count2 = listWebhooks().length;
    expect(count2).toBe(count1);
  });
});

// ─── Utilities ──────────────────────────────────────────────────────────────────

describe("webhookStatusLabel and webhookStatusColor", () => {
  it("should return correct French labels", () => {
    expect(webhookStatusLabel("active")).toBe("Actif");
    expect(webhookStatusLabel("paused")).toBe("En pause");
    expect(webhookStatusLabel("error")).toBe("Erreur");
  });

  it("should return CSS class strings", () => {
    expect(webhookStatusColor("active")).toContain("emerald");
    expect(webhookStatusColor("paused")).toContain("amber");
    expect(webhookStatusColor("error")).toContain("red");
  });
});

// ─── WEBHOOK_EVENTS constant ────────────────────────────────────────────────────

describe("WEBHOOK_EVENTS", () => {
  it("should have 4 event types", () => {
    expect(ALL_WEBHOOK_EVENTS.length).toBe(4);
  });

  it("should have label and description for each event", () => {
    for (const event of ALL_WEBHOOK_EVENTS) {
      expect(WEBHOOK_EVENTS[event]).toBeDefined();
      expect(WEBHOOK_EVENTS[event].label).toBeTruthy();
      expect(WEBHOOK_EVENTS[event].description).toBeTruthy();
    }
  });
});
