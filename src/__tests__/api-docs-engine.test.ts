// ─── Tests: API Documentation Engine ────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  getAPIGroups,
  searchEndpoints,
  getEndpointById,
  getAllEndpoints,
  getEndpointCount,
  getGroupCount,
  METHOD_COLORS,
  type APIEndpoint,
  type HTTPMethod,
} from "@/lib/api-docs-engine";

// ─── Endpoint Completeness ──────────────────────────────────────────────────────

describe("API Endpoint Completeness", () => {
  it("should have at least 10 endpoints documented", () => {
    expect(getEndpointCount()).toBeGreaterThanOrEqual(10);
  });

  it("should have at least 5 groups", () => {
    expect(getGroupCount()).toBeGreaterThanOrEqual(5);
  });

  it("should document GET /api root endpoint", () => {
    const ep = getEndpointById("api-root");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api");
  });

  it("should document GET /api/tenders endpoint", () => {
    const ep = getEndpointById("tenders-list");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api/tenders");
  });

  it("should document GET /api/tenders/{id} endpoint", () => {
    const ep = getEndpointById("tenders-detail");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api/tenders/{id}");
  });

  it("should document GET /api/search endpoint", () => {
    const ep = getEndpointById("search");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api/search");
  });

  it("should document POST /api/ai/chat endpoint", () => {
    const ep = getEndpointById("ai-chat");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("POST");
    expect(ep!.path).toBe("/api/ai/chat");
  });

  it("should document POST /api/generate endpoint", () => {
    const ep = getEndpointById("generate");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("POST");
    expect(ep!.path).toBe("/api/generate");
  });

  it("should document GET /api/analytics/overview endpoint", () => {
    const ep = getEndpointById("analytics-overview");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api/analytics/overview");
  });

  it("should document GET /api/analytics/sectors endpoint", () => {
    const ep = getEndpointById("analytics-sectors");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api/analytics/sectors");
  });

  it("should document GET /api/notifications endpoint", () => {
    const ep = getEndpointById("notifications-list");
    expect(ep).toBeDefined();
    expect(ep!.method).toBe("GET");
    expect(ep!.path).toBe("/api/notifications");
  });

  it("should document webhook endpoints", () => {
    const list = getEndpointById("webhooks-list");
    const register = getEndpointById("webhooks-register");
    const del = getEndpointById("webhooks-delete");
    expect(list).toBeDefined();
    expect(register).toBeDefined();
    expect(del).toBeDefined();
  });
});

// ─── Endpoint Structure ─────────────────────────────────────────────────────────

describe("Endpoint Structure", () => {
  const endpoints = getAllEndpoints();

  it("each endpoint should have required fields", () => {
    for (const ep of endpoints) {
      expect(ep.id).toBeTruthy();
      expect(ep.method).toBeTruthy();
      expect(ep.path).toBeTruthy();
      expect(ep.group).toBeTruthy();
      expect(ep.summary).toBeTruthy();
      expect(ep.description).toBeTruthy();
      expect(Array.isArray(ep.parameters)).toBe(true);
      expect(ep.responseExample).toBeTruthy();
      expect(Array.isArray(ep.statusCodes)).toBe(true);
    }
  });

  it("each endpoint should have at least one status code", () => {
    for (const ep of endpoints) {
      expect(ep.statusCodes.length).toBeGreaterThan(0);
    }
  });

  it("each endpoint should have valid HTTP method", () => {
    const validMethods: HTTPMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    for (const ep of endpoints) {
      expect(validMethods).toContain(ep.method);
    }
  });

  it("each parameter should have required fields", () => {
    for (const ep of endpoints) {
      for (const param of ep.parameters) {
        expect(param.name).toBeTruthy();
        expect(param.type).toBeTruthy();
        expect(typeof param.required).toBe("boolean");
        expect(param.description).toBeTruthy();
      }
    }
  });

  it("each status code should have code and description", () => {
    for (const ep of endpoints) {
      for (const sc of ep.statusCodes) {
        expect(typeof sc.code).toBe("number");
        expect(sc.code).toBeGreaterThanOrEqual(100);
        expect(sc.code).toBeLessThan(600);
        expect(sc.description).toBeTruthy();
      }
    }
  });

  it("examples should have label and response", () => {
    for (const ep of endpoints) {
      for (const example of ep.examples) {
        expect(example.label).toBeTruthy();
        expect(example.response).toBeTruthy();
      }
    }
  });

  it("response examples should be valid JSON", () => {
    for (const ep of endpoints) {
      expect(() => JSON.parse(ep.responseExample)).not.toThrow();
    }
  });
});

// ─── Groups ─────────────────────────────────────────────────────────────────────

describe("API Groups", () => {
  const groups = getAPIGroups();

  it("should have groups with non-empty endpoints", () => {
    for (const group of groups) {
      expect(group.endpoints.length).toBeGreaterThan(0);
    }
  });

  it("each group should have required fields", () => {
    for (const group of groups) {
      expect(group.id).toBeTruthy();
      expect(group.name).toBeTruthy();
      expect(group.description).toBeTruthy();
      expect(group.icon).toBeTruthy();
      expect(group.color).toBeTruthy();
    }
  });

  it("all endpoints should belong to a valid group", () => {
    const groupIds = new Set(groups.map((g) => g.id));
    const endpoints = getAllEndpoints();
    for (const ep of endpoints) {
      expect(groupIds.has(ep.group)).toBe(true);
    }
  });
});

// ─── Search ─────────────────────────────────────────────────────────────────────

describe("searchEndpoints", () => {
  it("should return all endpoints with empty query", () => {
    const results = searchEndpoints("");
    expect(results.length).toBe(getEndpointCount());
  });

  it("should find endpoints by path", () => {
    const results = searchEndpoints("/api/tenders");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((ep) => ep.path.includes("/api/tenders"))).toBe(true);
  });

  it("should find endpoints by method", () => {
    const results = searchEndpoints("POST");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((ep) => ep.method === "POST")).toBe(true);
  });

  it("should be case-insensitive", () => {
    const upper = searchEndpoints("WEBHOOK");
    const lower = searchEndpoints("webhook");
    expect(upper.length).toBe(lower.length);
  });

  it("should find endpoints by summary text", () => {
    const results = searchEndpoints("webhook");
    expect(results.length).toBeGreaterThan(0);
  });

  it("should return empty for non-matching query", () => {
    const results = searchEndpoints("xyznonexistent123");
    expect(results.length).toBe(0);
  });
});

// ─── METHOD_COLORS ──────────────────────────────────────────────────────────────

describe("METHOD_COLORS", () => {
  it("should have colors for all HTTP methods", () => {
    const methods: HTTPMethod[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    for (const method of methods) {
      expect(METHOD_COLORS[method]).toBeDefined();
      expect(METHOD_COLORS[method].bg).toBeTruthy();
      expect(METHOD_COLORS[method].text).toBeTruthy();
      expect(METHOD_COLORS[method].label).toBe(method);
    }
  });
});
