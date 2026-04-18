// ─── TenderFlow Guinea — Immutable Audit Trail ────────────────────────────────

export type AuditAction =
  | "login"
  | "logout"
  | "login_failed"
  | "tender_view"
  | "tender_create"
  | "tender_update"
  | "tender_delete"
  | "tender_score"
  | "document_upload"
  | "document_download"
  | "document_delete"
  | "settings_change"
  | "user_invite"
  | "user_role_change"
  | "user_deactivate"
  | "crm_contact_create"
  | "crm_account_update"
  | "ai_prompt_generate"
  | "workflow_create"
  | "workflow_execute"
  | "billing_update"
  | "password_change"
  | "2fa_enable"
  | "2fa_disable"
  | "export_data"
  | "api_key_generate";

export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  details: string;
  ipAddress: string;
}

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  login: "Connexion",
  logout: "Déconnexion",
  login_failed: "Tentative de connexion échouée",
  tender_view: "Consultation d'un appel d'offres",
  tender_create: "Création d'un appel d'offres",
  tender_update: "Modification d'un appel d'offres",
  tender_delete: "Suppression d'un appel d'offres",
  tender_score: "Scoring d'un appel d'offres",
  document_upload: "Téléversement de document",
  document_download: "Téléchargement de document",
  document_delete: "Suppression de document",
  settings_change: "Modification des paramètres",
  user_invite: "Invitation d'un utilisateur",
  user_role_change: "Changement de rôle utilisateur",
  user_deactivate: "Désactivation d'un utilisateur",
  crm_contact_create: "Création d'un contact CRM",
  crm_account_update: "Mise à jour d'un compte CRM",
  ai_prompt_generate: "Génération de prompt IA",
  workflow_create: "Création d'un workflow",
  workflow_execute: "Exécution d'un workflow",
  billing_update: "Mise à jour de la facturation",
  password_change: "Changement de mot de passe",
  "2fa_enable": "Activation de la 2FA",
  "2fa_disable": "Désactivation de la 2FA",
  export_data: "Exportation de données",
  api_key_generate: "Génération de clé API",
};

export const AUDIT_ACTION_CATEGORIES: Record<string, AuditAction[]> = {
  Authentification: ["login", "logout", "login_failed", "password_change", "2fa_enable", "2fa_disable"],
  "Appels d'offres": ["tender_view", "tender_create", "tender_update", "tender_delete", "tender_score"],
  Documents: ["document_upload", "document_download", "document_delete"],
  CRM: ["crm_contact_create", "crm_account_update"],
  Administration: ["settings_change", "user_invite", "user_role_change", "user_deactivate", "api_key_generate"],
  IA: ["ai_prompt_generate"],
  Workflows: ["workflow_create", "workflow_execute"],
  Facturation: ["billing_update"],
  Données: ["export_data"],
};

// ─── In-memory audit store (simulated) ────────────────────────────────────────

let auditStore: AuditEntry[] = [];
let idCounter = 0;

function generateId(): string {
  idCounter += 1;
  return `aud-${String(idCounter).padStart(4, "0")}`;
}

/**
 * Log a new audit event. Entries are immutable once created.
 */
export function logAuditEvent(params: {
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  details: string;
  ipAddress?: string;
}): AuditEntry {
  const entry: AuditEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    userId: params.userId,
    userName: params.userName,
    action: params.action,
    resource: params.resource,
    details: params.details,
    ipAddress: params.ipAddress ?? "196.128.xx.xx",
  };
  auditStore.push(entry);
  return entry;
}

/**
 * Get filtered/sorted audit trail entries.
 */
export function getAuditTrail(filters?: {
  action?: AuditAction;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): AuditEntry[] {
  let results = [...auditStore];

  if (filters?.action) {
    results = results.filter((e) => e.action === filters.action);
  }
  if (filters?.userId) {
    results = results.filter((e) => e.userId === filters.userId);
  }
  if (filters?.startDate) {
    results = results.filter((e) => e.timestamp >= filters.startDate!);
  }
  if (filters?.endDate) {
    results = results.filter((e) => e.timestamp <= filters.endDate!);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (e) =>
        e.userName.toLowerCase().includes(q) ||
        e.resource.toLowerCase().includes(q) ||
        e.details.toLowerCase().includes(q)
    );
  }

  // Sort by timestamp descending (most recent first)
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filters?.offset) {
    results = results.slice(filters.offset);
  }
  if (filters?.limit) {
    results = results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Returns total count of audit entries (with optional filters).
 */
export function getAuditCount(filters?: {
  action?: AuditAction;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): number {
  return getAuditTrail(filters).length;
}

// ─── Pre-populate with realistic Guinea-specific entries ──────────────────────

const SEED_ENTRIES: AuditEntry[] = [
  {
    id: "aud-0001",
    timestamp: "2026-04-15T08:12:33Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "login",
    resource: "Système",
    details: "Connexion réussie depuis Conakry, Guinée",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0002",
    timestamp: "2026-04-15T08:15:07Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "tender_view",
    resource: "AO/MTP/2026/0142",
    details: "Consultation de l'AO Construction pont Kouroussa",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0003",
    timestamp: "2026-04-15T08:22:41Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "tender_score",
    resource: "AO/SOGUIPAMI/2026/0023",
    details: "Scoring automatique : compatibilité 90%, faisabilité 88%",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0004",
    timestamp: "2026-04-15T09:05:19Z",
    userId: "u-002",
    userName: "Fatoumata Binta Bah",
    action: "document_upload",
    resource: "AO/DNE/2026/0087",
    details: "Téléversement du cahier des charges (PDF, 4.2 MB)",
    ipAddress: "196.128.67.34",
  },
  {
    id: "aud-0005",
    timestamp: "2026-04-15T09:18:55Z",
    userId: "u-003",
    userName: "Ibrahima Keita",
    action: "ai_prompt_generate",
    resource: "AO/MTP/2026/0142",
    details: "Génération d'une analyse de risques pour le pont de Kouroussa",
    ipAddress: "196.128.22.8",
  },
  {
    id: "aud-0006",
    timestamp: "2026-04-14T16:42:10Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "settings_change",
    resource: "Paramètres organisation",
    details: "Modification du fuseau horaire : Europe/Paris → Africa/Conakry",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0007",
    timestamp: "2026-04-14T14:30:00Z",
    userId: "u-004",
    userName: "Mariama Condé",
    action: "crm_contact_create",
    resource: "Contact: Abdoulaye Soumah",
    details: "Ajout du Directeur des Marchés Publics au répertoire CRM",
    ipAddress: "196.128.91.56",
  },
  {
    id: "aud-0008",
    timestamp: "2026-04-14T11:22:33Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "user_invite",
    resource: "Utilisateur: k.toure@aguipe.gouv.gn",
    details: "Invitation de Kadiatou Touré en tant qu'Analyste",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0009",
    timestamp: "2026-04-14T10:15:48Z",
    userId: "u-005",
    userName: "Aissatou Diallo",
    action: "tender_update",
    resource: "AO/AGUIPE/2026/0019",
    details: "Mise à jour du statut : qualifying → responding",
    ipAddress: "196.128.33.90",
  },
  {
    id: "aud-0010",
    timestamp: "2026-04-13T17:45:12Z",
    userId: "u-003",
    userName: "Ibrahima Keita",
    action: "workflow_execute",
    resource: "Workflow: Validation AO",
    details: "Exécution automatique du workflow de validation pour AO/SOGUIPAMI/2026/0023",
    ipAddress: "196.128.22.8",
  },
  {
    id: "aud-0011",
    timestamp: "2026-04-13T15:30:00Z",
    userId: "u-006",
    userName: "Kadiatou Touré",
    action: "login_failed",
    resource: "Système",
    details: "Tentative de connexion échouée — mot de passe incorrect",
    ipAddress: "41.82.157.22",
  },
  {
    id: "aud-0012",
    timestamp: "2026-04-13T15:32:45Z",
    userId: "u-006",
    userName: "Kadiatou Touré",
    action: "login",
    resource: "Système",
    details: "Connexion réussie après tentative échouée",
    ipAddress: "41.82.157.22",
  },
  {
    id: "aud-0013",
    timestamp: "2026-04-13T09:10:22Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "billing_update",
    resource: "Abonnement Pro",
    details: "Passage du plan Standard au plan Pro — facture #FN-2026-0042",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0014",
    timestamp: "2026-04-12T14:55:38Z",
    userId: "u-004",
    userName: "Mariama Condé",
    action: "document_download",
    resource: "AO/SEG/2026/0198",
    details: "Téléchargement du réglement de consultation (PDF, 1.8 MB)",
    ipAddress: "196.128.91.56",
  },
  {
    id: "aud-0015",
    timestamp: "2026-04-12T11:08:17Z",
    userId: "u-005",
    userName: "Aissatou Diallo",
    action: "2fa_enable",
    resource: "Sécurité utilisateur",
    details: "Activation de l'authentification à deux facteurs via application mobile",
    ipAddress: "196.128.33.90",
  },
  {
    id: "aud-0016",
    timestamp: "2026-04-11T16:40:55Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "export_data",
    resource: "Rapport analytique",
    details: "Exportation du rapport hebdomadaire en format Excel",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0017",
    timestamp: "2026-04-11T10:25:03Z",
    userId: "u-003",
    userName: "Ibrahima Keita",
    action: "tender_create",
    resource: "AO/MEPU/2026/0156",
    details: "Création manuelle de l'AO Équipement informatique 200 écoles",
    ipAddress: "196.128.22.8",
  },
  {
    id: "aud-0018",
    timestamp: "2026-04-10T09:33:44Z",
    userId: "u-002",
    userName: "Fatoumata Binta Bah",
    action: "user_role_change",
    resource: "Utilisateur: i.keita@soguipami.gouv.gn",
    details: "Changement de rôle : Analyste → Responsable",
    ipAddress: "196.128.67.34",
  },
  {
    id: "aud-0019",
    timestamp: "2026-04-09T14:02:11Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "api_key_generate",
    resource: "Intégration API",
    details: "Génération d'une clé API pour l'intégration avec le portail ARTP",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0020",
    timestamp: "2026-04-09T08:00:00Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "workflow_create",
    resource: "Workflow: Relance échéance",
    details: "Création d'un workflow de relance automatique 7 jours avant échéance",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0021",
    timestamp: "2026-04-08T17:15:29Z",
    userId: "u-005",
    userName: "Aissatou Diallo",
    action: "crm_account_update",
    resource: "Compte: AGUIPE",
    details: "Mise à jour des informations de l'Agence Guinéenne de l'Informatique",
    ipAddress: "196.128.33.90",
  },
  {
    id: "aud-0022",
    timestamp: "2026-04-08T10:50:37Z",
    userId: "u-002",
    userName: "Fatoumata Binta Bah",
    action: "tender_view",
    resource: "AO/DNE/2026/0087",
    details: "Consultation de l'AO Panneaux solaires centres de santé",
    ipAddress: "196.128.67.34",
  },
  {
    id: "aud-0023",
    timestamp: "2026-04-07T16:22:05Z",
    userId: "demo-1",
    userName: "Mamadou Diallo",
    action: "logout",
    resource: "Système",
    details: "Déconnexion manuelle depuis Conakry",
    ipAddress: "196.128.45.12",
  },
  {
    id: "aud-0024",
    timestamp: "2026-04-07T09:05:18Z",
    userId: "u-003",
    userName: "Ibrahima Keita",
    action: "ai_prompt_generate",
    resource: "AO/ONGUI/2026/0012",
    details: "Génération d'un plan méthodologique pour la restructuration ONGUI",
    ipAddress: "196.128.22.8",
  },
  {
    id: "aud-0025",
    timestamp: "2026-04-06T14:48:33Z",
    userId: "u-004",
    userName: "Mariama Condé",
    action: "document_delete",
    resource: "AO/SEG/2026/0198",
    details: "Suppression d'une ancienne version du bordereau de prix",
    ipAddress: "196.128.91.56",
  },
];

// Initialize the audit store with seed data
auditStore = [...SEED_ENTRIES];
idCounter = SEED_ENTRIES.length;
