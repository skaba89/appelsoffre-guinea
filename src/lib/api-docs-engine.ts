// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — API Documentation Engine
// Complete API endpoint definitions for interactive documentation
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Types ──────────────────────────────────────────────────────────────────────

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface APIParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
  in?: "query" | "path" | "body" | "header";
  default?: string;
  enum?: string[];
}

export interface APIStatusCode {
  code: number;
  description: string;
}

export interface APIExample {
  label: string;
  request?: string;
  response: string;
}

export interface APIEndpoint {
  id: string;
  method: HTTPMethod;
  path: string;
  group: string;
  summary: string;
  description: string;
  parameters: APIParameter[];
  requestExample?: string;
  responseExample: string;
  statusCodes: APIStatusCode[];
  examples: APIExample[];
  tags?: string[];
  deprecated?: boolean;
}

export interface APIGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  endpoints: APIEndpoint[];
}

// ─── HTTP Method Colors ─────────────────────────────────────────────────────────

export const METHOD_COLORS: Record<HTTPMethod, { bg: string; text: string; label: string }> = {
  GET: { bg: "bg-emerald-100 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", label: "GET" },
  POST: { bg: "bg-blue-100 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-400", label: "POST" },
  PUT: { bg: "bg-amber-100 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", label: "PUT" },
  DELETE: { bg: "bg-red-100 dark:bg-red-950/40", text: "text-red-700 dark:text-red-400", label: "DELETE" },
  PATCH: { bg: "bg-purple-100 dark:bg-purple-950/40", text: "text-purple-700 dark:text-purple-400", label: "PATCH" },
};

// ─── All API Endpoints ──────────────────────────────────────────────────────────

const endpoints: APIEndpoint[] = [
  // ─── Root ──────────────────────────────────────────────────────────────────────
  {
    id: "api-root",
    method: "GET",
    path: "/api",
    group: "général",
    summary: "Point d'entrée de l'API",
    description: "Retourne les informations de base sur l'API TenderFlow Guinea, y compris la version et les endpoints disponibles.",
    parameters: [],
    responseExample: JSON.stringify({
      message: "Hello, world!",
      version: "1.0.0",
      documentation: "/admin/api-docs",
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — informations de l'API retournées" },
    ],
    examples: [
      {
        label: "Requête basique",
        response: JSON.stringify({
          message: "Hello, world!",
          version: "1.0.0",
        }, null, 2),
      },
    ],
  },

  // ─── Tenders ──────────────────────────────────────────────────────────────────
  {
    id: "tenders-list",
    method: "GET",
    path: "/api/tenders",
    group: "appels-offres",
    summary: "Lister les appels d'offres",
    description: "Récupère la liste paginée des appels d'offres avec possibilité de filtrer par secteur, région, statut et texte de recherche.",
    parameters: [
      { name: "page", type: "number", required: false, description: "Numéro de page (défaut: 1)", in: "query", default: "1" },
      { name: "limit", type: "number", required: false, description: "Nombre de résultats par page (défaut: 20)", in: "query", default: "20" },
      { name: "sector", type: "string", required: false, description: "Filtrer par secteur (ex: BTP, IT / Digital)", in: "query" },
      { name: "region", type: "string", required: false, description: "Filtrer par région (ex: Conakry, Kankan)", in: "query" },
      { name: "status", type: "string", required: false, description: "Filtrer par statut", in: "query", enum: ["new", "qualifying", "qualified", "go", "responding", "expired", "won", "lost"] },
      { name: "q", type: "string", required: false, description: "Recherche textuelle dans le titre et l'autorité", in: "query" },
    ],
    responseExample: JSON.stringify({
      data: [
        {
          id: "t-001",
          reference: "AO/MTP/2026/001",
          title: "Construction de la route Nationale 1",
          sector: "BTP",
          region: "Conakry",
          status: "new",
          authority: "Ministère des Travaux Publics",
          budgetMin: 20000000000,
          budgetMax: 30000000000,
          deadline: "2026-07-15",
          score: 72,
        },
      ],
      pagination: { page: 1, limit: 20, total: 15, pages: 1 },
      filters: { sector: null, region: null, status: null, q: null },
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — liste des appels d'offres retournée" },
      { code: 400, description: "Paramètres de requête invalides" },
    ],
    examples: [
      {
        label: "Liste par défaut",
        response: JSON.stringify({
          data: [],
          pagination: { page: 1, limit: 20, total: 0, pages: 0 },
        }, null, 2),
      },
      {
        label: "Filtrer par secteur BTP",
        request: "?sector=BTP&limit=5",
        response: JSON.stringify({
          data: [{ id: "t-001", sector: "BTP" }],
          pagination: { page: 1, limit: 5, total: 2, pages: 1 },
        }, null, 2),
      },
    ],
  },
  {
    id: "tenders-detail",
    method: "GET",
    path: "/api/tenders/{id}",
    group: "appels-offres",
    summary: "Détails d'un appel d'offres",
    description: "Récupère les informations complètes d'un appel d'offres spécifique, incluant les scores calculés et la recommandation stratégique.",
    parameters: [
      { name: "id", type: "string", required: true, description: "Identifiant unique de l'appel d'offres", in: "path" },
    ],
    responseExample: JSON.stringify({
      id: "t-001",
      reference: "AO/MTP/2026/0142",
      title: "Construction d'un pont sur le fleuve Niger à Kouroussa",
      description: "Le Ministère des Travaux Publics lance un appel d'offres...",
      sector: "BTP",
      region: "Kankan",
      status: "qualified",
      tender_type: "international",
      deadline_date: "2026-06-15",
      budget_min: 15000000000,
      budget_max: 25000000000,
      publishing_authority: "Ministère des Travaux Publics",
      source_url: "https://mpw.gouv.gn/appels-offres/0142",
      priority_score: 0.92,
      compatibility_score: 0.85,
      feasibility_score: 0.78,
      win_probability_score: 0.65,
      strategy_recommendation: "go",
      computed_score: 80,
      created_at: "2026-04-10T08:30:00Z",
      updated_at: "2026-04-12T14:20:00Z",
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — détails de l'appel d'offres retournés" },
      { code: 404, description: "Appel d'offres introuvable" },
    ],
    examples: [
      {
        label: "Appel d'offres existant",
        request: "/api/tenders/t-001",
        response: JSON.stringify({ id: "t-001", reference: "AO/MTP/2026/0142", title: "Construction d'un pont..." }, null, 2),
      },
      {
        label: "Appel d'offres introuvable",
        request: "/api/tenders/inexistant",
        response: JSON.stringify({ error: "Appel d'offres introuvable" }, null, 2),
      },
    ],
  },

  // ─── Search ───────────────────────────────────────────────────────────────────
  {
    id: "search",
    method: "GET",
    path: "/api/search",
    group: "recherche",
    summary: "Recherche full-text",
    description: "Effectue une recherche full-text sur les appels d'offres avec filtres avancés et suggestions automatiques. Supporte deux modes : recherche et suggestions.",
    parameters: [
      { name: "q", type: "string", required: true, description: "Texte de recherche", in: "query" },
      { name: "mode", type: "string", required: false, description: "Mode de recherche", in: "query", default: "search", enum: ["search", "suggest"] },
      { name: "sectors", type: "string", required: false, description: "Secteurs séparés par des virgules", in: "query" },
      { name: "regions", type: "string", required: false, description: "Régions séparées par des virgules", in: "query" },
      { name: "scoreMin", type: "number", required: false, description: "Score minimum (0-100)", in: "query" },
      { name: "budgetMin", type: "number", required: false, description: "Budget minimum en GNF", in: "query" },
      { name: "budgetMax", type: "number", required: false, description: "Budget maximum en GNF", in: "query" },
      { name: "limit", type: "number", required: false, description: "Nombre maximum de résultats", in: "query", default: "20" },
    ],
    responseExample: JSON.stringify({
      query: "construction",
      total: 3,
      results: [
        {
          id: "t-001",
          type: "tender",
          title: "Construction d'un pont sur le fleuve Niger",
          sector: "BTP",
          region: "Kankan",
          score: 92,
          relevance: 95,
          highlights: ["<mark>Construction</mark> d'un pont..."],
        },
      ],
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — résultats de recherche retournés" },
      { code: 400, description: "Paramètres de recherche invalides" },
    ],
    examples: [
      {
        label: "Recherche standard",
        request: "?q=construction&limit=5",
        response: JSON.stringify({ query: "construction", total: 3, results: [] }, null, 2),
      },
      {
        label: "Mode suggestions",
        request: "?q=cons&mode=suggest",
        response: JSON.stringify({ suggestions: ["construction", "consulting", "consultation"] }, null, 2),
      },
    ],
  },

  // ─── AI ───────────────────────────────────────────────────────────────────────
  {
    id: "ai-chat",
    method: "POST",
    path: "/api/ai/chat",
    group: "ia",
    summary: "Assistant IA avec RAG",
    description: "Interagit avec l'assistant IA alimenté par un moteur RAG (Retrieval-Augmented Generation). Supporte 4 modes de conversation : analyse, rédaction, recherche et stratégie.",
    parameters: [
      { name: "message", type: "string", required: true, description: "Message de l'utilisateur", in: "body" },
      { name: "mode", type: "string", required: false, description: "Mode de conversation", in: "body", default: "analysis", enum: ["analysis", "drafting", "research", "strategy"] },
      { name: "context", type: "string", required: false, description: "Contexte additionnel pour la conversation", in: "body" },
    ],
    requestExample: JSON.stringify({
      message: "Analysez l'opportunité de l'AO/MTP/2026/0142",
      mode: "analysis",
      context: "Secteur BTP, budget 15-25 Mrd GNF",
    }, null, 2),
    responseExample: JSON.stringify({
      content: "L'appel d'offres AO/MTP/2026/0142 présente une opportunité stratégique...",
      sources: [
        { id: "doc-1", title: "Code des Marchés Publics 2018", type: "regulation", relevance: 0.92 },
      ],
      confidence: 0.85,
      suggestions: ["Quels sont les risques identifiés ?", "Proposez une stratégie de réponse"],
      mode: "analysis",
      metadata: { documentsUsed: 3, processingTime: 1200 },
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — réponse IA générée" },
      { code: 400, description: "Message manquant ou invalide" },
      { code: 500, description: "Erreur interne du serveur IA" },
    ],
    examples: [
      {
        label: "Analyse d'opportunité",
        request: JSON.stringify({ message: "Analysez l'AO SOGUIPAMI", mode: "analysis" }, null, 2),
        response: JSON.stringify({ content: "L'AO SOGUIPAMI présente...", confidence: 0.85 }, null, 2),
      },
      {
        label: "Mode recherche",
        request: JSON.stringify({ message: "Quelles sont les réglementations minières ?", mode: "research" }, null, 2),
        response: JSON.stringify({ content: "Le Code Minier guinéen...", sources: [] }, null, 2),
      },
    ],
  },

  // ─── Generate ─────────────────────────────────────────────────────────────────
  {
    id: "generate",
    method: "POST",
    path: "/api/generate",
    group: "documents",
    summary: "Générer un document professionnel",
    description: "Génère des documents professionnels pour les appels d'offres : lettres de manifestation, notes de compréhension, notes GO/NO-GO, plans méthodologiques et analyses de risques.",
    parameters: [
      { name: "type", type: "string", required: true, description: "Type de document à générer", in: "body", enum: ["manifestation", "comprehension", "methodology", "risk_analysis", "go_nogo_note"] },
      { name: "tenderTitle", type: "string", required: true, description: "Titre de l'appel d'offres", in: "body" },
      { name: "reference", type: "string", required: true, description: "Référence de l'appel d'offres", in: "body" },
      { name: "authority", type: "string", required: false, description: "Autorité contractante", in: "body" },
      { name: "sector", type: "string", required: false, description: "Secteur d'activité", in: "body" },
      { name: "region", type: "string", required: false, description: "Région", in: "body" },
      { name: "budget", type: "string", required: false, description: "Budget estimé", in: "body" },
      { name: "deadline", type: "string", required: false, description: "Date limite", in: "body" },
      { name: "companyName", type: "string", required: false, description: "Nom de l'entreprise", in: "body" },
      { name: "companyAddress", type: "string", required: false, description: "Adresse de l'entreprise", in: "body" },
    ],
    requestExample: JSON.stringify({
      type: "manifestation",
      tenderTitle: "Construction d'un pont sur le fleuve Niger",
      reference: "AO/MTP/2026/0142",
      authority: "Ministère des Travaux Publics",
      sector: "BTP",
      region: "Kankan",
      budget: "15 — 25 Mrd GNF",
      deadline: "15 juin 2026",
    }, null, 2),
    responseExample: JSON.stringify({
      type: "manifestation",
      content: "Digital Solutions Guinée SARL\nConakry, le 15 avril 2026\n\nÀ l'attention de :...",
      metadata: {
        reference: "AO/MTP/2026/0142",
        generatedAt: "2026-04-15T10:00:00Z",
        generator: "TenderFlow Guinea",
      },
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — document généré" },
      { code: 400, description: "Champs requis manquants ou type invalide" },
      { code: 500, description: "Erreur lors de la génération" },
    ],
    examples: [
      {
        label: "Lettre de manifestation",
        request: JSON.stringify({ type: "manifestation", tenderTitle: "Pont Kouroussa", reference: "AO/MTP/2026/0142" }, null, 2),
        response: JSON.stringify({ type: "manifestation", content: "...", metadata: {} }, null, 2),
      },
      {
        label: "Note GO/NO-GO",
        request: JSON.stringify({ type: "go_nogo_note", tenderTitle: "SIG Ressources Minières", reference: "AO/SOGUIPAMI/2026/0023" }, null, 2),
        response: JSON.stringify({ type: "go_nogo_note", content: "...", metadata: {} }, null, 2),
      },
    ],
  },

  // ─── Analytics Overview ───────────────────────────────────────────────────────
  {
    id: "analytics-overview",
    method: "GET",
    path: "/api/analytics/overview",
    group: "analytique",
    summary: "Vue d'ensemble analytique",
    description: "Retourne les KPIs du tableau de bord : nombre total d'appels d'offres, appels actifs, score moyen, nombre d'expirations imminentes, distribution par secteur et région, et tendance mensuelle sur 12 mois.",
    parameters: [
      { name: "period", type: "string", required: false, description: "Période d'analyse", in: "query", default: "12m", enum: ["1m", "3m", "6m", "12m"] },
    ],
    responseExample: JSON.stringify({
      kpis: {
        totalTenders: 15,
        activeTenders: 11,
        averageScore: 79,
        expiringCount: 4,
      },
      sectorDistribution: {
        BTP: 2,
        "IT / Digital": 2,
        Énergie: 1,
        Mines: 1,
        Santé: 1,
      },
      regionDistribution: {
        Conakry: 5,
        Kankan: 2,
        Nzérékoré: 1,
        National: 3,
      },
      monthlyTrend: [
        { month: "2025-05", count: 8, avgScore: 72 },
        { month: "2025-06", count: 12, avgScore: 75 },
      ],
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — données analytiques retournées" },
    ],
    examples: [
      {
        label: "Période par défaut (12 mois)",
        response: JSON.stringify({ kpis: { totalTenders: 15, activeTenders: 11 } }, null, 2),
      },
    ],
  },

  // ─── Analytics Sectors ────────────────────────────────────────────────────────
  {
    id: "analytics-sectors",
    method: "GET",
    path: "/api/analytics/sectors",
    group: "analytique",
    summary: "Statistiques par secteur",
    description: "Retourne les statistiques détaillées secteur par secteur : nombre d'appels d'offres, score moyen, budget moyen et taux de succès.",
    parameters: [
      { name: "sortBy", type: "string", required: false, description: "Critère de tri", in: "query", default: "count", enum: ["count", "avgScore", "avgBudget", "winRate"] },
      { name: "order", type: "string", required: false, description: "Ordre de tri", in: "query", default: "desc", enum: ["asc", "desc"] },
    ],
    responseExample: JSON.stringify({
      sectors: [
        { sector: "BTP", tenderCount: 2, averageScore: 81, averageBudget: 47500000000, winRate: 0.35 },
        { sector: "IT / Digital", tenderCount: 2, averageScore: 93, averageBudget: 4000000000, winRate: 0.66 },
      ],
      totalSectors: 8,
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — statistiques sectorielles retournées" },
    ],
    examples: [
      {
        label: "Tri par nombre d'AO",
        request: "?sortBy=count&order=desc",
        response: JSON.stringify({ sectors: [], totalSectors: 8 }, null, 2),
      },
    ],
  },

  // ─── Notifications ────────────────────────────────────────────────────────────
  {
    id: "notifications-list",
    method: "GET",
    path: "/api/notifications",
    group: "notifications",
    summary: "Lister les notifications",
    description: "Récupère les notifications de l'utilisateur courant avec filtres optionnels pour le type et le statut de lecture.",
    parameters: [
      { name: "unread", type: "boolean", required: false, description: "Filtrer les non-lues uniquement", in: "query" },
      { name: "type", type: "string", required: false, description: "Filtrer par type de notification", in: "query", enum: ["deadline", "new_tender", "score", "match", "system", "win", "competitor"] },
      { name: "limit", type: "number", required: false, description: "Nombre maximum de résultats", in: "query", default: "20" },
    ],
    responseExample: JSON.stringify({
      notifications: [
        {
          id: "n-001",
          type: "deadline",
          title: "Échéance proche : Audit comptable MF",
          message: "L'appel d'offres AO/MF/2026/0034 expire dans 10 jours.",
          isRead: false,
          tenderId: "t-010",
          createdAt: "2026-04-15T06:00:00Z",
        },
      ],
      total: 10,
      unreadCount: 5,
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — liste des notifications retournée" },
      { code: 401, description: "Non authentifié" },
    ],
    examples: [
      {
        label: "Notifications non lues",
        request: "?unread=true&limit=10",
        response: JSON.stringify({ notifications: [], total: 5, unreadCount: 5 }, null, 2),
      },
    ],
  },
  {
    id: "notifications-read",
    method: "POST",
    path: "/api/notifications/read",
    group: "notifications",
    summary: "Marquer les notifications comme lues",
    description: "Marque une ou plusieurs notifications comme lues. Peut accepter un ID spécifique ou marquer toutes les notifications comme lues.",
    parameters: [
      { name: "ids", type: "array", required: false, description: "Liste des IDs de notification à marquer comme lues", in: "body" },
      { name: "markAll", type: "boolean", required: false, description: "Marquer toutes les notifications comme lues", in: "body" },
    ],
    requestExample: JSON.stringify({
      ids: ["n-001", "n-002"],
    }, null, 2),
    responseExample: JSON.stringify({
      success: true,
      markedCount: 2,
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — notifications marquées comme lues" },
      { code: 401, description: "Non authentifié" },
    ],
    examples: [
      {
        label: "Marquer des IDs spécifiques",
        request: JSON.stringify({ ids: ["n-001", "n-002"] }, null, 2),
        response: JSON.stringify({ success: true, markedCount: 2 }, null, 2),
      },
      {
        label: "Tout marquer comme lu",
        request: JSON.stringify({ markAll: true }, null, 2),
        response: JSON.stringify({ success: true, markedCount: 5 }, null, 2),
      },
    ],
  },

  // ─── Webhooks ─────────────────────────────────────────────────────────────────
  {
    id: "webhooks-register",
    method: "POST",
    path: "/api/webhooks",
    group: "webhooks",
    summary: "Enregistrer un webhook",
    description: "Enregistre une URL de webhook pour recevoir des notifications d'événements. Les événements disponibles sont : nouveaux appels d'offres, rappels d'échéance, mises à jour de score et alertes concurrentielles.",
    parameters: [
      { name: "url", type: "string", required: true, description: "URL du webhook (doit être une URL valide HTTPS)", in: "body" },
      { name: "events", type: "array", required: true, description: "Liste des événements à écouter", in: "body", enum: ["new_tender", "deadline_reminder", "score_update", "competitor_alert"] },
      { name: "description", type: "string", required: false, description: "Description du webhook", in: "body" },
    ],
    requestExample: JSON.stringify({
      url: "https://mon-app.gn/webhooks/tenderflow",
      events: ["new_tender", "deadline_reminder"],
      description: "Webhook pour notifications internes",
    }, null, 2),
    responseExample: JSON.stringify({
      id: "wh-001",
      url: "https://mon-app.gn/webhooks/tenderflow",
      events: ["new_tender", "deadline_reminder"],
      description: "Webhook pour notifications internes",
      createdAt: "2026-04-15T10:00:00Z",
      status: "active",
    }, null, 2),
    statusCodes: [
      { code: 201, description: "Webhook enregistré avec succès" },
      { code: 400, description: "URL invalide ou événements manquants" },
      { code: 401, description: "Non authentifié" },
    ],
    examples: [
      {
        label: "Enregistrer un webhook",
        request: JSON.stringify({ url: "https://mon-app.gn/webhooks", events: ["new_tender"] }, null, 2),
        response: JSON.stringify({ id: "wh-001", url: "https://mon-app.gn/webhooks", events: ["new_tender"], status: "active" }, null, 2),
      },
    ],
  },
  {
    id: "webhooks-list",
    method: "GET",
    path: "/api/webhooks",
    group: "webhooks",
    summary: "Lister les webhooks",
    description: "Récupère la liste des webhooks enregistrés pour l'utilisateur courant.",
    parameters: [],
    responseExample: JSON.stringify({
      webhooks: [
        {
          id: "wh-001",
          url: "https://mon-app.gn/webhooks/tenderflow",
          events: ["new_tender", "deadline_reminder"],
          description: "Webhook pour notifications internes",
          createdAt: "2026-04-15T10:00:00Z",
          status: "active",
          lastDelivery: "2026-04-15T12:00:00Z",
        },
      ],
      total: 1,
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Succès — liste des webhooks retournée" },
      { code: 401, description: "Non authentifié" },
    ],
    examples: [
      {
        label: "Liste des webhooks",
        response: JSON.stringify({ webhooks: [], total: 0 }, null, 2),
      },
    ],
  },
  {
    id: "webhooks-delete",
    method: "DELETE",
    path: "/api/webhooks/{id}",
    group: "webhooks",
    summary: "Supprimer un webhook",
    description: "Supprime un webhook enregistré. L'URL ne recevra plus de notifications d'événements.",
    parameters: [
      { name: "id", type: "string", required: true, description: "Identifiant unique du webhook", in: "path" },
    ],
    responseExample: JSON.stringify({
      success: true,
      message: "Webhook supprimé avec succès",
    }, null, 2),
    statusCodes: [
      { code: 200, description: "Webhook supprimé avec succès" },
      { code: 404, description: "Webhook introuvable" },
      { code: 401, description: "Non authentifié" },
    ],
    examples: [
      {
        label: "Suppression réussie",
        request: "/api/webhooks/wh-001",
        response: JSON.stringify({ success: true, message: "Webhook supprimé" }, null, 2),
      },
      {
        label: "Webhook introuvable",
        request: "/api/webhooks/inexistant",
        response: JSON.stringify({ error: "Webhook introuvable" }, null, 2),
      },
    ],
  },
];

// ─── Group Definitions ──────────────────────────────────────────────────────────

export const API_GROUPS: APIGroup[] = [
  {
    id: "général",
    name: "Général",
    description: "Endpoints de base de l'API",
    icon: "Globe",
    color: "text-slate-600 dark:text-slate-400",
    endpoints: [],
  },
  {
    id: "appels-offres",
    name: "Appels d'offres",
    description: "Consultation et recherche des appels d'offres",
    icon: "FileText",
    color: "text-emerald-600 dark:text-emerald-400",
    endpoints: [],
  },
  {
    id: "recherche",
    name: "Recherche",
    description: "Recherche full-text et suggestions",
    icon: "Search",
    color: "text-blue-600 dark:text-blue-400",
    endpoints: [],
  },
  {
    id: "ia",
    name: "Intelligence artificielle",
    description: "Assistant IA et moteur RAG",
    icon: "Brain",
    color: "text-purple-600 dark:text-purple-400",
    endpoints: [],
  },
  {
    id: "documents",
    name: "Documents",
    description: "Génération de documents professionnels",
    icon: "FilePen",
    color: "text-amber-600 dark:text-amber-400",
    endpoints: [],
  },
  {
    id: "analytique",
    name: "Analytique",
    description: "Statistiques et tableaux de bord",
    icon: "BarChart3",
    color: "text-cyan-600 dark:text-cyan-400",
    endpoints: [],
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Gestion des notifications utilisateur",
    icon: "Bell",
    color: "text-rose-600 dark:text-rose-400",
    endpoints: [],
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Intégration par webhooks",
    icon: "Webhook",
    color: "text-orange-600 dark:text-orange-400",
    endpoints: [],
  },
];

// ─── Organize Endpoints into Groups ────────────────────────────────────────────

export function getAPIGroups(): APIGroup[] {
  return API_GROUPS.map((group) => ({
    ...group,
    endpoints: endpoints.filter((ep) => ep.group === group.id),
  })).filter((group) => group.endpoints.length > 0);
}

// ─── Search / Filter ────────────────────────────────────────────────────────────

export function searchEndpoints(query: string): APIEndpoint[] {
  if (!query.trim()) return endpoints;
  const lower = query.toLowerCase();
  return endpoints.filter(
    (ep) =>
      ep.path.toLowerCase().includes(lower) ||
      ep.summary.toLowerCase().includes(lower) ||
      ep.description.toLowerCase().includes(lower) ||
      ep.method.toLowerCase().includes(lower) ||
      ep.group.toLowerCase().includes(lower) ||
      ep.tags?.some((t) => t.toLowerCase().includes(lower))
  );
}

export function getEndpointById(id: string): APIEndpoint | undefined {
  return endpoints.find((ep) => ep.id === id);
}

export function getAllEndpoints(): APIEndpoint[] {
  return endpoints;
}

export function getEndpointCount(): number {
  return endpoints.length;
}

export function getGroupCount(): number {
  return API_GROUPS.filter(
    (g) => endpoints.some((ep) => ep.group === g.id)
  ).length;
}
