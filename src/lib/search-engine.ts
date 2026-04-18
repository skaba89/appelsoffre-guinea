// ─── TenderFlow Guinea — Advanced Search Engine ────────────────────────────────
//
// Moteur de recherche full-text avec scoring de pertinence,
// filtres croisés, suggestions automatiques et sauvegarde de recherches.

// ===== Types =====

export interface SearchDocument {
  id: string;
  type: "tender" | "contact" | "account" | "document" | "opportunity";
  title: string;
  description: string;
  sector?: string;
  region?: string;
  status?: string;
  authority?: string;
  budget?: number;
  deadline?: string;
  score?: number;
  tags: string[];
  metadata: Record<string, unknown>;
}

export interface SearchFilter {
  /** Type d'entité */
  type?: SearchDocument["type"][];
  /** Secteurs d'activité */
  sectors?: string[];
  /** Régions */
  regions?: string[];
  /** Statuts */
  statuses?: string[];
  /** Budget minimum (GNF) */
  budgetMin?: number;
  /** Budget maximum (GNF) */
  budgetMax?: number;
  /** Date limite minimum */
  deadlineAfter?: string;
  /** Date limite maximum */
  deadlineBefore?: string;
  /** Score minimum */
  scoreMin?: number;
  /** Recherche dans les autorités */
  authorities?: string[];
}

export interface SearchResult {
  document: SearchDocument;
  /** Score de pertinence (0-1) */
  relevance: number;
  /** Extraits avec termes surlignés */
  highlights: SearchHighlight[];
  /** Correspondances exactes */
  exactMatches: string[];
}

export interface SearchHighlight {
  field: string;
  snippet: string;
  start: number;
  end: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilter;
  createdAt: string;
  lastRunAt: string;
  resultCount: number;
  isAlert: boolean; // Notification automatique quand nouveaux résultats
}

export interface SearchSuggestion {
  text: string;
  type: "history" | "popular" | "completion" | "entity";
  count?: number;
  icon?: string;
}

// ===== Search Index =====

class SearchIndex {
  private documents: Map<string, SearchDocument> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private trigramIndex: Map<string, Set<string>> = new Map();

  /** Ajoute un document à l'index */
  add(doc: SearchDocument): void {
    this.documents.set(doc.id, doc);

    // Index les tokens du titre et de la description
    const tokens = this.tokenize(`${doc.title} ${doc.description} ${doc.tags.join(" ")}`);
    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(doc.id);
    }

    // Index les trigrammes pour la recherche approximative
    const text = `${doc.title} ${doc.description}`.toLowerCase();
    for (let i = 0; i <= text.length - 3; i++) {
      const trigram = text.substring(i, i + 3);
      if (!this.trigramIndex.has(trigram)) {
        this.trigramIndex.set(trigram, new Set());
      }
      this.trigramIndex.get(trigram)!.add(doc.id);
    }
  }

  /** Supprime un document de l'index */
  remove(id: string): void {
    const doc = this.documents.get(id);
    if (!doc) return;

    const tokens = this.tokenize(`${doc.title} ${doc.description} ${doc.tags.join(" ")}`);
    for (const token of tokens) {
      this.invertedIndex.get(token)?.delete(id);
    }

    this.documents.delete(id);
  }

  /** Recherche par tokens exacts */
  searchTokens(query: string): Map<string, number> {
    const scores = new Map<string, number>();
    const queryTokens = this.tokenize(query);

    for (const token of queryTokens) {
      // Correspondance exacte
      const exactMatches = this.invertedIndex.get(token);
      if (exactMatches) {
        for (const docId of exactMatches) {
          scores.set(docId, (scores.get(docId) ?? 0) + 3);
        }
      }

      // Correspondance préfixe
      for (const [indexToken, docIds] of this.invertedIndex.entries()) {
        if (indexToken.startsWith(token) && indexToken !== token) {
          for (const docId of docIds) {
            scores.set(docId, (scores.get(docId) ?? 0) + 1.5);
          }
        }
      }
    }

    return scores;
  }

  /** Recherche approximative (fuzzy) via trigrammes */
  searchFuzzy(query: string): Map<string, number> {
    const scores = new Map<string, number>();
    const text = query.toLowerCase();
    const queryTrigrams = new Set<string>();

    for (let i = 0; i <= text.length - 3; i++) {
      queryTrigrams.add(text.substring(i, i + 3));
    }

    for (const trigram of queryTrigrams) {
      const docIds = this.trigramIndex.get(trigram);
      if (docIds) {
        for (const docId of docIds) {
          scores.set(docId, (scores.get(docId) ?? 0) + 0.5);
        }
      }
    }

    return scores;
  }

  /** Tokenize un texte en mots normalisés */
  private tokenize(text: string): string[] {
    const normalized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .replace(/[^a-z0-9\s]/g, " ");

    const tokens = normalized.split(/\s+/).filter((t) => t.length > 1);

    // Stop words français
    const stopWords = new Set([
      "le", "la", "les", "un", "une", "des", "de", "du", "au", "aux",
      "et", "ou", "mais", "donc", "car", "ni", "que", "qui", "quoi",
      "dans", "sur", "sous", "avec", "pour", "par", "en", "vers",
      "ce", "cet", "cette", "ces", "il", "elle", "ils", "elles",
      "son", "sa", "ses", "leur", "leurs", "nous", "vous",
      "ne", "pas", "plus", "moins", "tres", "tout", "tous",
    ]);

    return tokens.filter((t) => !stopWords.has(t));
  }

  /** Récupère un document par ID */
  get(id: string): SearchDocument | undefined {
    return this.documents.get(id);
  }

  /** Récupère tous les documents */
  getAll(): SearchDocument[] {
    return Array.from(this.documents.values());
  }

  /** Nombre de documents indexés */
  get size(): number {
    return this.documents.size;
  }
}

// ===== Singleton Index =====

let searchIndexInstance: SearchIndex | null = null;

export function getSearchIndex(): SearchIndex {
  if (!searchIndexInstance) {
    searchIndexInstance = new SearchIndex();
    initializeSearchIndex(searchIndexInstance);
  }
  return searchIndexInstance;
}

// ===== Données initiales =====

function initializeSearchIndex(index: SearchIndex): void {
  const sampleDocs: SearchDocument[] = [
    {
      id: "t-001",
      type: "tender",
      title: "Construction de la route Nationale 1 — Section Conakry-Kindia",
      description: "Rehabilitation et élargissement de la RN1 sur 120km. Projet financé par la Banque Mondiale dans le cadre du Programme National d'Infrastructures.",
      sector: "BTP",
      region: "Conakry",
      status: "new",
      authority: "Ministère des Travaux Publics",
      budget: 25_000_000_000,
      deadline: "2026-07-15",
      score: 72,
      tags: ["infrastructure", "routes", "banque-mondiale", "conakry"],
      metadata: { reference: "AO/MTP/2026/001" },
    },
    {
      id: "t-002",
      type: "tender",
      title: "Fourniture d'équipements informatiques pour l'administration publique",
      description: "Acquisition de 2000 ordinateurs portables, 500 imprimantes et infrastructure réseau pour les ministères. Financement BAD.",
      sector: "IT / Digital",
      region: "Conakry",
      status: "qualifying",
      authority: "Direction Générale des Systèmes d'Information",
      budget: 8_000_000_000,
      deadline: "2026-06-30",
      score: 85,
      tags: ["informatique", "numérique", "équipement", "BAD"],
      metadata: { reference: "AO/DGSI/2026/003" },
    },
    {
      id: "t-003",
      type: "tender",
      title: "Électrification rurale — 50 villages dans la préfecture de Labé",
      description: "Installation de panneaux solaires et de mini-réseaux pour l'électrification de 50 villages. Projet FIDA avec cofinancement gouvernement.",
      sector: "Énergie",
      region: "Labé",
      status: "qualified",
      authority: "Énergie de Guinée (EDG)",
      budget: 12_000_000_000,
      deadline: "2026-08-01",
      score: 68,
      tags: ["énergie", "solaire", "rural", "FIDA", "électrification"],
      metadata: { reference: "AO/EDG/2026/007" },
    },
    {
      id: "t-004",
      type: "tender",
      title: "Services de consulting en governance minière",
      description: "Assistance technique pour la mise en conformité avec les standards EITI et la révision du code minier guinéen.",
      sector: "Conseil",
      region: "Conakry",
      status: "go",
      authority: "Ministère des Mines et de la Géologie",
      budget: 3_000_000_000,
      deadline: "2026-05-20",
      score: 78,
      tags: ["consulting", "mines", "gouvernance", "EITI"],
      metadata: { reference: "AO/MMG/2026/012" },
    },
    {
      id: "t-005",
      type: "tender",
      title: "Construction du Centre Hospitalier Régional de Nzérékoré",
      description: "Construction d'un CHR de 200 lits avec équipements médicaux complets. Financement Union Européenne.",
      sector: "Santé",
      region: "Nzérékoré",
      status: "new",
      authority: "Ministère de la Santé",
      budget: 18_000_000_000,
      deadline: "2026-09-15",
      score: 62,
      tags: ["santé", "hôpital", "UE", "infrastructure"],
      metadata: { reference: "AO/MS/2026/005" },
    },
    {
      id: "t-006",
      type: "tender",
      title: "Programme d'appui au secteur agricole — Zone de Kankan",
      description: "Distribution d'intrants, formation des agriculteurs et construction de stockages pour 5000 exploitants dans la région de Kankan.",
      sector: "Agriculture",
      region: "Kankan",
      status: "responding",
      authority: "Ministère de l'Agriculture",
      budget: 6_000_000_000,
      deadline: "2026-06-01",
      score: 55,
      tags: ["agriculture", "intrants", "formation", "PNUD"],
      metadata: { reference: "AO/MA/2026/009" },
    },
    {
      id: "t-007",
      type: "tender",
      title: "Système d'information judiciaire — Digitalisation des tribunaux",
      description: "Mise en place d'un système intégré de gestion des dossiers judiciaires dans les 38 tribunaux de Guinée.",
      sector: "IT / Digital",
      region: "National",
      status: "go",
      authority: "Ministère de la Justice",
      budget: 5_000_000_000,
      deadline: "2026-07-30",
      score: 82,
      tags: ["numérique", "justice", "e-gouvernement", "système"],
      metadata: { reference: "AO/MJ/2026/004" },
    },
    {
      id: "t-008",
      type: "tender",
      title: "Exploitation minière bauxite — Sangarédi Plateau",
      description: "Concession d'exploitation de bauxite sur le plateau de Sangarédi. Appel d'offres international pour partenariat stratégique.",
      sector: "Mines",
      region: "Boké",
      status: "no_go",
      authority: "SOGUIPAMI",
      budget: 100_000_000_000,
      deadline: "2026-04-30",
      score: 38,
      tags: ["mines", "bauxite", "international", "concession"],
      metadata: { reference: "AO/SOGUIPAMI/2026/001" },
    },
    {
      id: "c-001",
      type: "contact",
      title: "Amadou Diallo — Directeur Marchés Publics",
      description: "Ministère des Travaux Publics. Contact clé pour les AO BTP et infrastructure.",
      sector: "BTP",
      region: "Conakry",
      tags: ["décideur", "BTP", "marchés-publics"],
      metadata: { phone: "+224 621 00 00 00", email: "a.diallo@mtp.gn" },
    },
    {
      id: "c-002",
      type: "contact",
      title: "Marie Condé — Chargée de Programmes BAD",
      description: "Représentante résidente de la Banque Africaine de Développement. Finance les projets d'infrastructure et d'énergie.",
      sector: "Énergie",
      region: "Conakry",
      tags: ["bailleur", "BAD", "financement"],
      metadata: { phone: "+224 622 00 00 00", email: "m.conde@bad.org" },
    },
    {
      id: "a-001",
      type: "account",
      title: "SOGUIPAMI — Société Guinéenne du Patrimoine Minier",
      description: "Société d'État gérant le patrimoine minier guinéen. Publie régulièrement des AO pour l'exploitation minière.",
      sector: "Mines",
      region: "Conakry",
      tags: ["société-état", "mines", "bauxite"],
      metadata: { employees: 450, revenue: "200B GNF" },
    },
    {
      id: "d-001",
      type: "document",
      title: "Code des Marchés Publics de Guinée (2018)",
      description: "Texte réglementaire régissant les procédures de passation des marchés publics en République de Guinée.",
      tags: ["réglementation", "marchés-publics", "code", "loi"],
      metadata: { pages: 87, format: "PDF" },
    },
    {
      id: "d-002",
      type: "document",
      title: "Guide du Soumissionnaire — AO Internationales",
      description: "Guide pratique pour la préparation des soumissions aux appels d'offres internationaux en Guinée.",
      tags: ["guide", "soumission", "international", "méthodologie"],
      metadata: { pages: 34, format: "PDF" },
    },
    {
      id: "o-001",
      type: "opportunity",
      title: "Partenariat e-gouvernement — Digitalisation services publics",
      description: "Opportunité de partenariat pour la digitalisation de 12 services publics (état civil, impôts, douanes).",
      sector: "IT / Digital",
      region: "National",
      status: "qualified",
      tags: ["e-gouvernement", "digitalisation", "partenariat"],
      metadata: { estimatedValue: "15B GNF" },
    },
  ];

  for (const doc of sampleDocs) {
    index.add(doc);
  }
}

// ===== Search Functions =====

/**
 * Recherche full-text avec scoring de pertinence.
 * Combine recherche exacte, préfixe et fuzzy (trigrammes).
 */
export function search(
  query: string,
  filters?: SearchFilter,
  options?: { fuzzy?: boolean; maxResults?: number }
): SearchResult[] {
  const index = getSearchIndex();
  const { fuzzy = true, maxResults = 50 } = options ?? {};

  if (!query.trim()) {
    // Si pas de query, retourner tous les documents filtrés
    let docs = index.getAll();
    if (filters) {
      docs = applyFilters(docs, filters);
    }
    return docs.slice(0, maxResults).map((doc) => ({
      document: doc,
      relevance: 1,
      highlights: [],
      exactMatches: [],
    }));
  }

  // Calculer les scores de recherche
  const tokenScores = index.searchTokens(query);
  const fuzzyScores = fuzzy ? index.searchFuzzy(query) : new Map<string, number>();

  // Fusionner les scores
  const mergedScores = new Map<string, number>();
  for (const [id, score] of tokenScores) {
    mergedScores.set(id, score);
  }
  for (const [id, score] of fuzzyScores) {
    mergedScores.set(id, (mergedScores.get(id) ?? 0) + score);
  }

  // Construire les résultats
  const maxScore = Math.max(...mergedScores.values(), 1);
  let results: SearchResult[] = [];

  for (const [docId, rawScore] of mergedScores) {
    const doc = index.get(docId);
    if (!doc) continue;

    // Normaliser le score entre 0 et 1
    const relevance = Math.min(rawScore / maxScore, 1);

    // Générer les highlights
    const highlights = generateHighlights(doc, query);

    // Trouver les correspondances exactes
    const exactMatches = findExactMatches(doc, query);

    results.push({
      document: doc,
      relevance,
      highlights,
      exactMatches,
    });
  }

  // Appliquer les filtres
  if (filters) {
    results = results.filter((r) => matchesFilter(r.document, filters));
  }

  // Trier par pertinence
  results.sort((a, b) => b.relevance - a.relevance);

  return results.slice(0, maxResults);
}

/**
 * Applique les filtres à une liste de documents.
 */
function applyFilters(docs: SearchDocument[], filters: SearchFilter): SearchDocument[] {
  return docs.filter((doc) => matchesFilter(doc, filters));
}

/**
 * Vérifie si un document correspond aux filtres.
 */
function matchesFilter(doc: SearchDocument, filters: SearchFilter): boolean {
  if (filters.type?.length && !filters.type.includes(doc.type)) return false;
  if (filters.sectors?.length && doc.sector && !filters.sectors.includes(doc.sector)) return false;
  if (filters.regions?.length && doc.region && !filters.regions.includes(doc.region)) return false;
  if (filters.statuses?.length && doc.status && !filters.statuses.includes(doc.status)) return false;
  if (filters.budgetMin && doc.budget && doc.budget < filters.budgetMin) return false;
  if (filters.budgetMax && doc.budget && doc.budget > filters.budgetMax) return false;
  if (filters.deadlineAfter && doc.deadline && doc.deadline < filters.deadlineAfter) return false;
  if (filters.deadlineBefore && doc.deadline && doc.deadline > filters.deadlineBefore) return false;
  if (filters.scoreMin && doc.score && doc.score < filters.scoreMin) return false;
  if (filters.authorities?.length && doc.authority && !filters.authorities.some((a) => doc.authority?.includes(a))) return false;
  return true;
}

/**
 * Génère des extraits avec mise en évidence des termes recherchés.
 */
function generateHighlights(doc: SearchDocument, query: string): SearchHighlight[] {
  const highlights: SearchHighlight[] = [];
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  const fields = [
    { field: "title", text: doc.title },
    { field: "description", text: doc.description },
  ];

  for (const { field, text } of fields) {
    const lowerText = text.toLowerCase();
    for (const term of terms) {
      const idx = lowerText.indexOf(term);
      if (idx >= 0) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(text.length, idx + term.length + 30);
        const snippet = (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
        highlights.push({ field, snippet, start: idx, end: idx + term.length });
      }
    }
  }

  return highlights;
}

/**
 * Trouve les correspondances exactes.
 */
function findExactMatches(doc: SearchDocument, query: string): string[] {
  const matches: string[] = [];
  const lowerQuery = query.toLowerCase();
  const fields = [doc.title, doc.description, ...(doc.tags ?? [])];

  for (const field of fields) {
    if (field.toLowerCase().includes(lowerQuery)) {
      matches.push(field);
    }
  }

  return [...new Set(matches)];
}

// ===== Search Suggestions =====

const POPULAR_SEARCHES: SearchSuggestion[] = [
  { text: "BTP Conakry", type: "popular", count: 42, icon: "Building2" },
  { text: "Banque Mondiale", type: "popular", count: 38, icon: "Landmark" },
  { text: "Énergie solaire", type: "popular", count: 31, icon: "Sun" },
  { text: "Informatique administration", type: "popular", count: 28, icon: "Monitor" },
  { text: "Mines bauxite", type: "popular", count: 25, icon: "Mountain" },
  { text: "Santé hôpital", type: "popular", count: 22, icon: "Heart" },
  { text: "Électrification rurale", type: "popular", count: 19, icon: "Zap" },
  { text: "E-gouvernement", type: "popular", count: 17, icon: "Globe" },
];

const ENTITY_SUGGESTIONS: SearchSuggestion[] = [
  { text: "Ministère des Travaux Publics", type: "entity", icon: "Building" },
  { text: "Banque Mondiale", type: "entity", icon: "Landmark" },
  { text: "BAD — Banque Africaine de Développement", type: "entity", icon: "Landmark" },
  { text: "SOGUIPAMI", type: "entity", icon: "Building" },
  { text: "Énergie de Guinée (EDG)", type: "entity", icon: "Zap" },
  { text: "Union Européenne", type: "entity", icon: "Landmark" },
  { text: "FIDA", type: "entity", icon: "Landmark" },
  { text: "PNUD", type: "entity", icon: "Landmark" },
];

/**
 * Génère des suggestions de recherche basées sur la saisie partielle.
 */
export function getSuggestions(query: string): SearchSuggestion[] {
  if (!query.trim()) {
    return [...POPULAR_SEARCHES];
  }

  const lower = query.toLowerCase();
  const suggestions: SearchSuggestion[] = [];

  // Complétions depuis les recherches populaires
  for (const pop of POPULAR_SEARCHES) {
    if (pop.text.toLowerCase().includes(lower)) {
      suggestions.push({ ...pop, type: "completion" });
    }
  }

  // Entités correspondantes
  for (const entity of ENTITY_SUGGESTIONS) {
    if (entity.text.toLowerCase().includes(lower)) {
      suggestions.push(entity);
    }
  }

  // Complétions depuis les documents indexés
  const index = getSearchIndex();
  const allDocs = index.getAll();
  for (const doc of allDocs) {
    if (doc.title.toLowerCase().includes(lower)) {
      suggestions.push({
        text: doc.title,
        type: "completion",
        icon: doc.type === "tender" ? "FileText" : doc.type === "contact" ? "User" : "Folder",
      });
    }
  }

  // Dédupliquer et limiter
  const seen = new Set<string>();
  return suggestions.filter((s) => {
    if (seen.has(s.text.toLowerCase())) return false;
    seen.add(s.text.toLowerCase());
    return true;
  }).slice(0, 10);
}

// ===== Saved Searches =====

let savedSearches: SavedSearch[] = [
  {
    id: "ss-001",
    name: "AO BTP en cours",
    query: "BTP construction route",
    filters: { type: ["tender"], sectors: ["BTP"], statuses: ["new", "qualifying", "qualified"] },
    createdAt: "2026-04-01T10:00:00Z",
    lastRunAt: "2026-04-18T08:30:00Z",
    resultCount: 8,
    isAlert: true,
  },
  {
    id: "ss-002",
    name: "Marchés Banque Mondiale",
    query: "Banque Mondiale",
    filters: { type: ["tender"], authorities: ["Banque Mondiale"] },
    createdAt: "2026-03-15T14:00:00Z",
    lastRunAt: "2026-04-17T09:00:00Z",
    resultCount: 5,
    isAlert: false,
  },
  {
    id: "ss-003",
    name: "Échéances cette semaine",
    query: "",
    filters: { type: ["tender"], deadlineBefore: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0] },
    createdAt: "2026-04-10T16:00:00Z",
    lastRunAt: "2026-04-18T07:00:00Z",
    resultCount: 3,
    isAlert: true,
  },
];

/**
 * Récupère les recherches sauvegardées.
 */
export function getSavedSearches(): SavedSearch[] {
  return savedSearches;
}

/**
 * Sauvegarde une recherche.
 */
export function saveSearch(search: Omit<SavedSearch, "id" | "createdAt" | "lastRunAt" | "resultCount">): SavedSearch {
  const newSearch: SavedSearch = {
    ...search,
    id: `ss-${String(savedSearches.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    lastRunAt: new Date().toISOString(),
    resultCount: searchQuery(search.query, search.filters).length,
  };
  savedSearches.push(newSearch);
  return newSearch;
}

/**
 * Supprime une recherche sauvegardée.
 */
export function deleteSavedSearch(id: string): boolean {
  const idx = savedSearches.findIndex((s) => s.id === id);
  if (idx >= 0) {
    savedSearches.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Alias pour la fonction search (utilisé par saveSearch).
 */
function searchQuery(query: string, filters?: SearchFilter): SearchResult[] {
  return search(query, filters);
}

/**
 * Compte les résultats par type.
 */
export function countByType(results: SearchResult[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of results) {
    counts[r.document.type] = (counts[r.document.type] ?? 0) + 1;
  }
  return counts;
}

/**
 * Facette par secteur.
 */
export function facetBySector(results: SearchResult[]): { sector: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const r of results) {
    if (r.document.sector) {
      counts[r.document.sector] = (counts[r.document.sector] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([sector, count]) => ({ sector, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Facette par région.
 */
export function facetByRegion(results: SearchResult[]): { region: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const r of results) {
    if (r.document.region) {
      counts[r.document.region] = (counts[r.document.region] ?? 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([region, count]) => ({ region, count }))
    .sort((a, b) => b.count - a.count);
}
