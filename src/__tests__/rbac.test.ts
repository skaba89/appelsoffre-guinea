// ─── Tests: RBAC (Role-Based Access Control) ──────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  getRolePermissions,
  hasPermission,
  getPermissionCategories,
  getPermissionsByCategory,
  ROLES,
  PERMISSIONS,
  type Role,
  type Permission,
} from "@/lib/rbac";

// ─── getRolePermissions ───────────────────────────────────────────────────────

describe("getRolePermissions", () => {
  it("should return all 14 permissions for super_admin", () => {
    const perms = getRolePermissions("super_admin");
    expect(perms.length).toBe(14);
  });

  it("should return all 14 permissions for tenant_admin", () => {
    const perms = getRolePermissions("tenant_admin");
    expect(perms.length).toBe(14);
  });

  it("should return correct permissions for manager", () => {
    const perms = getRolePermissions("manager");
    expect(perms).toContain("tenders:read");
    expect(perms).toContain("tenders:write");
    expect(perms).toContain("scoring:read");
    expect(perms).toContain("scoring:write");
    expect(perms).toContain("crm:read");
    expect(perms).toContain("crm:write");
    expect(perms).toContain("ai:access");
    expect(perms).toContain("workflows:manage");
    // Manager should NOT have these
    expect(perms).not.toContain("tenders:delete");
    expect(perms).not.toContain("admin:access");
    expect(perms).not.toContain("billing:manage");
  });

  it("should return correct permissions for analyst", () => {
    const perms = getRolePermissions("analyst");
    expect(perms).toContain("tenders:read");
    expect(perms).toContain("scoring:read");
    expect(perms).toContain("scoring:write");
    expect(perms).toContain("crm:read");
    expect(perms).toContain("ai:access");
    expect(perms).toContain("documents:read");
    expect(perms).toContain("analytics:read");
    // Analyst should NOT have write access to tenders or CRM
    expect(perms).not.toContain("tenders:write");
    expect(perms).not.toContain("crm:write");
    expect(perms).not.toContain("admin:access");
  });

  it("should return read-only permissions for viewer", () => {
    const perms = getRolePermissions("viewer");
    expect(perms).toContain("tenders:read");
    expect(perms).toContain("scoring:read");
    expect(perms).toContain("crm:read");
    expect(perms).toContain("documents:read");
    expect(perms).toContain("analytics:read");
    // Viewer should NOT have any write access
    expect(perms).not.toContain("tenders:write");
    expect(perms).not.toContain("scoring:write");
    expect(perms).not.toContain("crm:write");
    expect(perms).not.toContain("ai:access");
  });

  it("should return empty array for unknown role", () => {
    const perms = getRolePermissions("unknown" as Role);
    expect(perms).toEqual([]);
  });
});

// ─── hasPermission ────────────────────────────────────────────────────────────

describe("hasPermission", () => {
  it("should return true when super_admin has any permission", () => {
    expect(hasPermission("super_admin", "tenders:read")).toBe(true);
    expect(hasPermission("super_admin", "admin:access")).toBe(true);
    expect(hasPermission("super_admin", "billing:manage")).toBe(true);
  });

  it("should return false when viewer lacks write permissions", () => {
    expect(hasPermission("viewer", "tenders:write")).toBe(false);
    expect(hasPermission("viewer", "scoring:write")).toBe(false);
    expect(hasPermission("viewer", "crm:write")).toBe(false);
    expect(hasPermission("viewer", "admin:access")).toBe(false);
  });

  it("should return true when viewer has read permissions", () => {
    expect(hasPermission("viewer", "tenders:read")).toBe(true);
    expect(hasPermission("viewer", "scoring:read")).toBe(true);
    expect(hasPermission("viewer", "analytics:read")).toBe(true);
  });

  it("should return false for unknown role", () => {
    expect(hasPermission("unknown" as Role, "tenders:read")).toBe(false);
  });

  it("manager should have ai:access but not admin:access", () => {
    expect(hasPermission("manager", "ai:access")).toBe(true);
    expect(hasPermission("manager", "admin:access")).toBe(false);
  });

  it("analyst should have scoring:write but not tenders:write", () => {
    expect(hasPermission("analyst", "scoring:write")).toBe(true);
    expect(hasPermission("analyst", "tenders:write")).toBe(false);
  });
});

// ─── getPermissionCategories ──────────────────────────────────────────────────

describe("getPermissionCategories", () => {
  it("should return unique category names", () => {
    const categories = getPermissionCategories();
    const unique = new Set(categories);
    expect(categories.length).toBe(unique.size);
  });

  it("should include expected categories", () => {
    const categories = getPermissionCategories();
    expect(categories).toContain("Appels d'offres");
    expect(categories).toContain("Scoring");
    expect(categories).toContain("CRM");
    expect(categories).toContain("Administration");
  });
});

// ─── getPermissionsByCategory ─────────────────────────────────────────────────

describe("getPermissionsByCategory", () => {
  it("should group permissions by category", () => {
    const grouped = getPermissionsByCategory();
    expect(grouped["Appels d'offres"]).toBeDefined();
    expect(grouped["Appels d'offres"].length).toBe(3); // read, write, delete
    expect(grouped["Scoring"]).toBeDefined();
    expect(grouped["Scoring"].length).toBe(2); // read, write
  });

  it("should cover all 14 permissions across categories", () => {
    const grouped = getPermissionsByCategory();
    const allPerms = Object.values(grouped).flat();
    expect(allPerms.length).toBe(14);
  });
});

// ─── Role metadata ────────────────────────────────────────────────────────────

describe("ROLES", () => {
  it("should have 5 defined roles", () => {
    const roleKeys = Object.keys(ROLES);
    expect(roleKeys.length).toBe(5);
  });

  it("should have French labels for each role", () => {
    for (const role of Object.values(ROLES)) {
      expect(role.label).toBeTruthy();
      expect(typeof role.label).toBe("string");
    }
  });

  it("should have descriptions for each role", () => {
    for (const role of Object.values(ROLES)) {
      expect(role.description).toBeTruthy();
      expect(typeof role.description).toBe("string");
    }
  });

  it("should have color classes for each role", () => {
    for (const role of Object.values(ROLES)) {
      expect(role.color).toBeTruthy();
      expect(role.color).toContain("bg-");
    }
  });
});

// ─── PERMISSIONS ──────────────────────────────────────────────────────────────

describe("PERMISSIONS", () => {
  it("should have 14 defined permissions", () => {
    expect(Object.keys(PERMISSIONS).length).toBe(14);
  });

  it("each permission should have a label and category", () => {
    for (const [key, perm] of Object.entries(PERMISSIONS)) {
      expect(perm.label).toBeTruthy();
      expect(perm.category).toBeTruthy();
      expect(key).toContain(":"); // format: resource:action
    }
  });
});
