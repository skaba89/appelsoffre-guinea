// ─── TenderFlow Guinea — Role-Based Access Control (RBAC) ──────────────────────

export type Role = "super_admin" | "tenant_admin" | "manager" | "analyst" | "viewer";

export type Permission =
  | "tenders:read"
  | "tenders:write"
  | "tenders:delete"
  | "scoring:read"
  | "scoring:write"
  | "crm:read"
  | "crm:write"
  | "ai:access"
  | "admin:access"
  | "billing:manage"
  | "documents:read"
  | "documents:write"
  | "analytics:read"
  | "workflows:manage";

export const PERMISSIONS: Record<Permission, { label: string; category: string }> = {
  "tenders:read": { label: "Lire les appels d'offres", category: "Appels d'offres" },
  "tenders:write": { label: "Modifier les appels d'offres", category: "Appels d'offres" },
  "tenders:delete": { label: "Supprimer les appels d'offres", category: "Appels d'offres" },
  "scoring:read": { label: "Voir les scores", category: "Scoring" },
  "scoring:write": { label: "Modifier les scores", category: "Scoring" },
  "crm:read": { label: "Voir le CRM", category: "CRM" },
  "crm:write": { label: "Modifier le CRM", category: "CRM" },
  "ai:access": { label: "Accéder à l'IA", category: "Intelligence artificielle" },
  "admin:access": { label: "Accès administration", category: "Administration" },
  "billing:manage": { label: "Gérer la facturation", category: "Facturation" },
  "documents:read": { label: "Voir les documents", category: "Documents" },
  "documents:write": { label: "Modifier les documents", category: "Documents" },
  "analytics:read": { label: "Voir les analytiques", category: "Analytique" },
  "workflows:manage": { label: "Gérer les workflows", category: "Workflows" },
};

export const ROLES: Record<Role, { label: string; description: string; color: string }> = {
  super_admin: {
    label: "Super Administrateur",
    description: "Accès complet à toutes les fonctionnalités du système",
    color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  tenant_admin: {
    label: "Administrateur Tenant",
    description: "Gestion complète de l'organisation",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  manager: {
    label: "Responsable",
    description: "Gestion des appels d'offres et du scoring",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  analyst: {
    label: "Analyste",
    description: "Consultation et analyse des données",
    color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  viewer: {
    label: "Observateur",
    description: "Consultation en lecture seule",
    color: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
  },
};

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "tenders:read",
    "tenders:write",
    "tenders:delete",
    "scoring:read",
    "scoring:write",
    "crm:read",
    "crm:write",
    "ai:access",
    "admin:access",
    "billing:manage",
    "documents:read",
    "documents:write",
    "analytics:read",
    "workflows:manage",
  ],
  tenant_admin: [
    "tenders:read",
    "tenders:write",
    "tenders:delete",
    "scoring:read",
    "scoring:write",
    "crm:read",
    "crm:write",
    "ai:access",
    "admin:access",
    "billing:manage",
    "documents:read",
    "documents:write",
    "analytics:read",
    "workflows:manage",
  ],
  manager: [
    "tenders:read",
    "tenders:write",
    "scoring:read",
    "scoring:write",
    "crm:read",
    "crm:write",
    "ai:access",
    "documents:read",
    "documents:write",
    "analytics:read",
    "workflows:manage",
  ],
  analyst: [
    "tenders:read",
    "scoring:read",
    "scoring:write",
    "crm:read",
    "ai:access",
    "documents:read",
    "analytics:read",
  ],
  viewer: [
    "tenders:read",
    "scoring:read",
    "crm:read",
    "documents:read",
    "analytics:read",
  ],
};

/**
 * Returns all permissions for a given role.
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Checks whether a given role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Returns all available permission categories (unique).
 */
export function getPermissionCategories(): string[] {
  const categories = new Set<string>();
  for (const perm of Object.values(PERMISSIONS)) {
    categories.add(perm.category);
  }
  return Array.from(categories);
}

/**
 * Returns permissions grouped by category.
 */
export function getPermissionsByCategory(): Record<string, Permission[]> {
  const grouped: Record<string, Permission[]> = {};
  for (const [perm, meta] of Object.entries(PERMISSIONS)) {
    if (!grouped[meta.category]) {
      grouped[meta.category] = [];
    }
    grouped[meta.category].push(perm as Permission);
  }
  return grouped;
}
