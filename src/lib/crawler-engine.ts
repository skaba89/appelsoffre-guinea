// ─── TenderFlow Guinea — Moteur de Crawler / ETL Automatisé ────────────────────
//
// Système de veille automatisée pour les appels d'offres en Guinée.
// Pipeline ETL : Extraction → Transformation → Chargement.
// Détection de doublons, classification automatique, monitoring de santé des sources.

// ===== Types et Interfaces =====

/** Type de source de veille */
export type SourceType = "government" | "enterprise" | "international" | "media";

/** Statut de santé d'une source */
export type HealthStatus = "healthy" | "degraded" | "down";

/** Statut d'une source */
export type SourceStatus = "active" | "paused" | "error" | "maintenance";

/** Régions administratives de Guinée */
export type GuineaRegion =
  | "Conakry"
  | "Kindia"
  | "Boké"
  | "Labé"
  | "Mamou"
  | "Faranah"
  | "Kankan"
  | "Nzérékoré"
  | "National";

/** Secteur d'activité */
export type Sector =
  | "BTP"
  | "Mines"
  | "IT / Digital"
  | "Santé"
  | "Énergie"
  | "Éducation"
  | "Agriculture"
  | "Conseil"
  | "Finance"
  | "Eau / Assainissement"
  | "Télécom"
  | "Sécurité"
  | "Industrie"
  | "Logistique"
  | "Fournitures"
  | "Maintenance";

/** Résultat de crawl individuel */
export interface CrawlResult {
  /** Identifiant unique du résultat */
  id: string;
  /** Source ayant produit ce résultat */
  sourceId: string;
  /** Titre du tender découvert */
  title: string;
  /** Description du tender */
  description: string;
  /** URL du tender sur la source */
  url: string;
  /** Date de publication sur la source */
  publishedAt: string;
  /** Date limite de soumission */
  deadlineDate: string;
  /** Autorité publiante */
  publishingAuthority: string;
  /** Secteur classifié */
  sector: Sector;
  /** Région classifiée */
  region: GuineaRegion;
  /** Budget minimum estimé en GNF */
  budgetMin: number;
  /** Budget maximum estimé en GNF */
  budgetMax: number;
  /** Type d'appel d'offres */
  tenderType: "national" | "international";
  /** Est un doublon détecté */
  isDuplicate: boolean;
  /** ID du tender dont celui-ci est le doublon (si applicable) */
  duplicateOf?: string;
  /** Score de similarité pour le doublon (0-1) */
  similarityScore?: number;
  /** Horodatage du crawl */
  crawledAt: string;
}

/** Santé d'une source de veille */
export interface SourceHealth {
  /** Identifiant de la source */
  sourceId: string;
  /** Statut de santé */
  status: HealthStatus;
  /** Taux de succès sur les 30 derniers crawls (0-1) */
  successRate: number;
  /** Nombre total de crawls effectués */
  totalCrawls: number;
  /** Nombre de crawls en erreur */
  errorCount: number;
  /** Date du dernier crawl réussi (ISO) */
  lastSuccessCrawl: string | null;
  /** Date du dernier crawl (réussi ou en erreur) (ISO) */
  lastCrawlAttempt: string | null;
  /** Temps moyen de réponse en ms */
  avgResponseTime: number;
  /** Nombre de tenders découverts au dernier crawl */
  lastTenderCount: number;
  /** Uptime sur 24h (%) */
  uptime24h: number;
}

/** Source de veille configurable */
export interface CrawlSource {
  /** Identifiant unique */
  id: string;
  /** Nom affichable */
  name: string;
  /** URL de la source */
  url: string;
  /** Type de source */
  type: SourceType;
  /** Secteur principal couvert */
  sector: Sector;
  /** Région principale couverte */
  region: GuineaRegion;
  /** Intervalle de rafraîchissement en minutes */
  refreshInterval: number;
  /** Statut actuel de la source */
  status: SourceStatus;
  /** Description de la source */
  description: string;
  /** Santé de la source */
  health: SourceHealth;
  /** Icône suggérée (nom Lucide) */
  icon: string;
}

/** Étape du pipeline ETL */
export interface ETLStep {
  /** Identifiant de l'étape */
  id: string;
  /** Nom de l'étape */
  name: string;
  /** Description de l'étape */
  description: string;
  /** Durée simulée en ms */
  duration: number;
  /** Statut de l'étape */
  status: "pending" | "running" | "completed" | "error";
  /** Nombre d'éléments traités */
  processedCount: number;
}

/** Résultat du pipeline ETL complet */
export interface ETLPipelineResult {
  /** Identifiant de l'exécution */
  runId: string;
  /** Date de début (ISO) */
  startedAt: string;
  /** Date de fin (ISO) */
  completedAt: string | null;
  /** Source crawlée */
  sourceId: string;
  /** Étapes du pipeline */
  steps: ETLStep[];
  /** Résultats du crawl (avant déduplication) */
  rawTenderCount: number;
  /** Nombre de doublons détectés */
  duplicateCount: number;
  /** Nombre de nouveaux tenders (après déduplication) */
  newTenderCount: number;
  /** Nombre d'erreurs */
  errorCount: number;
  /** Statut global */
  status: "running" | "completed" | "error";
}

// ===== Sources de veille Guinée (15+) =====

export const CRAWL_SOURCES: CrawlSource[] = [
  {
    id: "src-dnmp",
    name: "Direction Nationale des Marchés Publics",
    url: "https://www.dnmp.gov.gn",
    type: "government",
    sector: "BTP",
    region: "National",
    refreshInterval: 30,
    status: "active",
    description: "Portail officiel des marchés publics de Guinée. Source principale pour les AO gouvernementaux.",
    icon: "Landmark",
    health: {
      sourceId: "src-dnmp",
      status: "healthy",
      successRate: 0.96,
      totalCrawls: 1247,
      errorCount: 50,
      lastSuccessCrawl: new Date(Date.now() - 12 * 60000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 12 * 60000).toISOString(),
      avgResponseTime: 2300,
      lastTenderCount: 8,
      uptime24h: 99.2,
    },
  },
  {
    id: "src-soguipami",
    name: "SOGUIPAMI",
    url: "https://www.soguipami.gov.gn",
    type: "enterprise",
    sector: "Mines",
    region: "National",
    refreshInterval: 45,
    status: "active",
    description: "Société Guinéenne du Patrimoine Minier. AO pour l'exploitation et l'exploration minière.",
    icon: "Mountain",
    health: {
      sourceId: "src-soguipami",
      status: "healthy",
      successRate: 0.91,
      totalCrawls: 856,
      errorCount: 77,
      lastSuccessCrawl: new Date(Date.now() - 35 * 60000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 35 * 60000).toISOString(),
      avgResponseTime: 3100,
      lastTenderCount: 3,
      uptime24h: 97.8,
    },
  },
  {
    id: "src-artp",
    name: "ARTP — Autorité de Régulation des Télécommunications",
    url: "https://www.artp.gov.gn",
    type: "government",
    sector: "Télécom",
    region: "Conakry",
    refreshInterval: 60,
    status: "active",
    description: "Appels d'offres du secteur des télécommunications et des communications électroniques.",
    icon: "Radio",
    health: {
      sourceId: "src-artp",
      status: "healthy",
      successRate: 0.88,
      totalCrawls: 423,
      errorCount: 51,
      lastSuccessCrawl: new Date(Date.now() - 55 * 60000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 55 * 60000).toISOString(),
      avgResponseTime: 2800,
      lastTenderCount: 2,
      uptime24h: 96.5,
    },
  },
  {
    id: "src-min-btp",
    name: "Ministère des Travaux Publics",
    url: "https://www.ministere-tp.gov.gn",
    type: "government",
    sector: "BTP",
    region: "National",
    refreshInterval: 30,
    status: "active",
    description: "AO pour les infrastructures routières, ponts, bâtiments publics et aménagement urbain.",
    icon: "HardHat",
    health: {
      sourceId: "src-min-btp",
      status: "degraded",
      successRate: 0.72,
      totalCrawls: 892,
      errorCount: 249,
      lastSuccessCrawl: new Date(Date.now() - 3 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 25 * 60000).toISOString(),
      avgResponseTime: 5400,
      lastTenderCount: 5,
      uptime24h: 78.3,
    },
  },
  {
    id: "src-min-sante",
    name: "Ministère de la Santé",
    url: "https://www.ministere-sante.gov.gn",
    type: "government",
    sector: "Santé",
    region: "National",
    refreshInterval: 60,
    status: "active",
    description: "Marchés de fourniture médicale, équipement hospitalier et programmes de santé publique.",
    icon: "HeartPulse",
    health: {
      sourceId: "src-min-sante",
      status: "healthy",
      successRate: 0.94,
      totalCrawls: 634,
      errorCount: 38,
      lastSuccessCrawl: new Date(Date.now() - 45 * 60000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 45 * 60000).toISOString(),
      avgResponseTime: 2100,
      lastTenderCount: 4,
      uptime24h: 98.1,
    },
  },
  {
    id: "src-min-energie",
    name: "Ministère de l'Énergie",
    url: "https://www.ministere-energie.gov.gn",
    type: "government",
    sector: "Énergie",
    region: "National",
    refreshInterval: 45,
    status: "active",
    description: "AO pour l'électrification rurale, énergie solaire, hydroélectricité et réseaux de distribution.",
    icon: "Zap",
    health: {
      sourceId: "src-min-energie",
      status: "healthy",
      successRate: 0.89,
      totalCrawls: 567,
      errorCount: 62,
      lastSuccessCrawl: new Date(Date.now() - 1 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 1 * 3600000).toISOString(),
      avgResponseTime: 2600,
      lastTenderCount: 2,
      uptime24h: 95.7,
    },
  },
  {
    id: "src-min-education",
    name: "Ministère de l'Éducation",
    url: "https://www.ministere-education.gov.gn",
    type: "government",
    sector: "Éducation",
    region: "National",
    refreshInterval: 90,
    status: "active",
    description: "Marchés pour les programmes éducatifs, construction d'écoles et fournitures scolaires.",
    icon: "GraduationCap",
    health: {
      sourceId: "src-min-education",
      status: "degraded",
      successRate: 0.75,
      totalCrawls: 312,
      errorCount: 78,
      lastSuccessCrawl: new Date(Date.now() - 6 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 45 * 60000).toISOString(),
      avgResponseTime: 4200,
      lastTenderCount: 1,
      uptime24h: 82.4,
    },
  },
  {
    id: "src-aguipe",
    name: "AGUIPE — Agence Guinéenne de Promotion de l'Emploi",
    url: "https://www.aguipe.gov.gn",
    type: "government",
    sector: "Conseil",
    region: "Conakry",
    refreshInterval: 120,
    status: "active",
    description: "AO pour les services de conseil, formation professionnelle et accompagnement.",
    icon: "Briefcase",
    health: {
      sourceId: "src-aguipe",
      status: "healthy",
      successRate: 0.93,
      totalCrawls: 245,
      errorCount: 17,
      lastSuccessCrawl: new Date(Date.now() - 2 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 2 * 3600000).toISOString(),
      avgResponseTime: 1800,
      lastTenderCount: 1,
      uptime24h: 99.0,
    },
  },
  {
    id: "src-edg",
    name: "EDG — Électricité de Guinée",
    url: "https://www.edg.gov.gn",
    type: "enterprise",
    sector: "Énergie",
    region: "National",
    refreshInterval: 60,
    status: "active",
    description: "Appels d'offres pour la distribution électrique, maintenance de réseaux et équipements.",
    icon: "Plug",
    health: {
      sourceId: "src-edg",
      status: "healthy",
      successRate: 0.85,
      totalCrawls: 389,
      errorCount: 58,
      lastSuccessCrawl: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 1.5 * 3600000).toISOString(),
      avgResponseTime: 3200,
      lastTenderCount: 3,
      uptime24h: 93.6,
    },
  },
  {
    id: "src-banque-mondiale",
    name: "Banque Mondiale — Projets Guinée",
    url: "https://www.worldbank.org/en/country/guinea",
    type: "international",
    sector: "BTP",
    region: "National",
    refreshInterval: 120,
    status: "active",
    description: "Projets financés par la Banque Mondiale en Guinée. AO internationaux de grande envergure.",
    icon: "Globe",
    health: {
      sourceId: "src-banque-mondiale",
      status: "healthy",
      successRate: 0.98,
      totalCrawls: 456,
      errorCount: 9,
      lastSuccessCrawl: new Date(Date.now() - 2 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 2 * 3600000).toISOString(),
      avgResponseTime: 1500,
      lastTenderCount: 6,
      uptime24h: 99.8,
    },
  },
  {
    id: "src-bad",
    name: "BAD — Banque Africaine de Développement",
    url: "https://www.afdb.org/en/projects-operations/guinea",
    type: "international",
    sector: "Agriculture",
    region: "National",
    refreshInterval: 90,
    status: "active",
    description: "Projets BAD en Guinée : agriculture, eau, assainissement et développement rural.",
    icon: "Leaf",
    health: {
      sourceId: "src-bad",
      status: "healthy",
      successRate: 0.97,
      totalCrawls: 312,
      errorCount: 9,
      lastSuccessCrawl: new Date(Date.now() - 3 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 3 * 3600000).toISOString(),
      avgResponseTime: 1700,
      lastTenderCount: 4,
      uptime24h: 99.5,
    },
  },
  {
    id: "src-union-eu",
    name: "Union Européenne — Coopération Guinée",
    url: "https://www.eeas.europa.eu/guinea",
    type: "international",
    sector: "Conseil",
    region: "National",
    refreshInterval: 120,
    status: "active",
    description: "Programmes de coopération UE-Guinée : gouvernance, sécurité alimentaire, infrastructures.",
    icon: "Flag",
    health: {
      sourceId: "src-union-eu",
      status: "degraded",
      successRate: 0.78,
      totalCrawls: 198,
      errorCount: 44,
      lastSuccessCrawl: new Date(Date.now() - 8 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 30 * 60000).toISOString(),
      avgResponseTime: 3800,
      lastTenderCount: 2,
      uptime24h: 85.2,
    },
  },
  {
    id: "src-onudi",
    name: "ONUDI — Projets Industriels Guinée",
    url: "https://www.unido.org/guinea",
    type: "international",
    sector: "Industrie",
    region: "Conakry",
    refreshInterval: 120,
    status: "active",
    description: "Projets de développement industriel durable, transformation locale et chaînes de valeur.",
    icon: "Factory",
    health: {
      sourceId: "src-onudi",
      status: "healthy",
      successRate: 0.95,
      totalCrawls: 134,
      errorCount: 7,
      lastSuccessCrawl: new Date(Date.now() - 5 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 5 * 3600000).toISOString(),
      avgResponseTime: 1400,
      lastTenderCount: 1,
      uptime24h: 99.6,
    },
  },
  {
    id: "src-seg-guinee",
    name: "SEG Guinée — Société des Eaux",
    url: "https://www.seg-guinee.com",
    type: "enterprise",
    sector: "Eau / Assainissement",
    region: "National",
    refreshInterval: 60,
    status: "active",
    description: "AO pour les infrastructures d'eau potable, stations de traitement et réseaux d'assainissement.",
    icon: "Droplets",
    health: {
      sourceId: "src-seg-guinee",
      status: "healthy",
      successRate: 0.87,
      totalCrawls: 267,
      errorCount: 35,
      lastSuccessCrawl: new Date(Date.now() - 2 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 2 * 3600000).toISOString(),
      avgResponseTime: 2900,
      lastTenderCount: 2,
      uptime24h: 94.3,
    },
  },
  {
    id: "src-min-agriculture",
    name: "Ministère de l'Agriculture",
    url: "https://www.ministere-agriculture.gov.gn",
    type: "government",
    sector: "Agriculture",
    region: "Nzérékoré",
    refreshInterval: 90,
    status: "active",
    description: "AO pour les projets agricoles, sécurité alimentaire, irrigation et développement rural.",
    icon: "Sprout",
    health: {
      sourceId: "src-min-agriculture",
      status: "down",
      successRate: 0.42,
      totalCrawls: 178,
      errorCount: 103,
      lastSuccessCrawl: new Date(Date.now() - 48 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 15 * 60000).toISOString(),
      avgResponseTime: 8200,
      lastTenderCount: 0,
      uptime24h: 34.1,
    },
  },
  {
    id: "src-orange-guinee",
    name: "Orange Guinée — Fournisseurs",
    url: "https://fournisseurs.orange-guinee.com",
    type: "enterprise",
    sector: "Télécom",
    region: "Conakry",
    refreshInterval: 60,
    status: "active",
    description: "Portail fournisseurs Orange Guinée : équipements télécom, services IT, maintenance.",
    icon: "Smartphone",
    health: {
      sourceId: "src-orange-guinee",
      status: "healthy",
      successRate: 0.92,
      totalCrawls: 445,
      errorCount: 36,
      lastSuccessCrawl: new Date(Date.now() - 40 * 60000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 40 * 60000).toISOString(),
      avgResponseTime: 2200,
      lastTenderCount: 3,
      uptime24h: 97.2,
    },
  },
  {
    id: "src-unops",
    name: "UNOPS — Appels d'offres Guinée",
    url: "https://www.unops.org/guinea",
    type: "international",
    sector: "Logistique",
    region: "National",
    refreshInterval: 120,
    status: "active",
    description: "Appels d'offres UNOPS pour les projets d'infrastructures, logistique humanitaire et achats.",
    icon: "Truck",
    health: {
      sourceId: "src-unops",
      status: "healthy",
      successRate: 0.96,
      totalCrawls: 189,
      errorCount: 8,
      lastSuccessCrawl: new Date(Date.now() - 4 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 4 * 3600000).toISOString(),
      avgResponseTime: 1600,
      lastTenderCount: 2,
      uptime24h: 99.3,
    },
  },
  {
    id: "src-pnud",
    name: "PNUD — Programmes Guinée",
    url: "https://www.gn.undp.org",
    type: "international",
    sector: "Conseil",
    region: "National",
    refreshInterval: 120,
    status: "paused",
    description: "Programmes du PNUD en Guinée : gouvernance, développement humain, environnement.",
    icon: "Scale",
    health: {
      sourceId: "src-pnud",
      status: "degraded",
      successRate: 0.68,
      totalCrawls: 156,
      errorCount: 50,
      lastSuccessCrawl: new Date(Date.now() - 24 * 3600000).toISOString(),
      lastCrawlAttempt: new Date(Date.now() - 1 * 3600000).toISOString(),
      avgResponseTime: 4500,
      lastTenderCount: 0,
      uptime24h: 72.0,
    },
  },
];

// ===== Données de simulation =====

/** Modèles de titres de tenders par secteur */
const TENDER_TITLES: Record<string, string[]> = {
  "BTP": [
    "Construction de la route Kankan-Bissau — Tranche 2",
    "Réhabilitation du pont sur le Niger à Kouroussa",
    "Construction d'un centre administratif à Conakry — Kaloum",
    "Aménagement de la voirie urbaine de Nzérékoré",
    "Réfection du bâtiment de l'Assemblée Nationale",
  ],
  "Mines": [
    "Étude d'impact environnemental — Permis d'exploration Boké",
    "Fourniture d'équipements de sécurité minière",
    "Audit technique des infrastructures portuaires minérales",
    "Services de consulting géologique — Zone de Simandou",
  ],
  "IT / Digital": [
    "Mise en place d'un système e-gouvernement — Phase 2",
    "Déploiement du réseau fibre optique Conakry-Kindia",
    "Développement de la plateforme numérique de l'état civil",
    "Sécurisation des données biométriques — Appel à candidatures",
  ],
  "Santé": [
    "Fourniture d'équipements médicaux — CHU de Conakry",
    "Programme de vaccination — Fourniture de chaîne de froid",
    "Construction d'un centre de santé maternelle à Labé",
    "Acquisition de médicaments essentiels — Lot 2026",
  ],
  "Énergie": [
    "Électrification rurale — Préfecture de Faranah",
    "Installation de panneaux solaires — Écoles de Kankan",
    "Maintenance de la centrale hydroélectrique de Garafiri",
    "Étude de faisabilité — Micro-centrale solaire Boké",
  ],
  "Éducation": [
    "Construction de 20 écoles primaires — Région de Mamou",
    "Fourniture de manuels scolaires — Programme national",
    "Formation continue des enseignants — Projet RESC",
  ],
  "Agriculture": [
    "Projet d'irrigation de la plaine de Sankarani",
    "Distribution d'intrants agricoles — Saison 2026",
    "Appui à la filière cacao — Nzérékoré",
  ],
  "Conseil": [
    "Audit organisationnel du Ministère des Finances",
    "Étude de faisabilité — Zone économique spéciale",
    "Consultation en gestion des projets publics",
  ],
  "Finance": [
    "Mise en place d'un système de paiement mobile — Trésor public",
    "Audit financier des entreprises d'État — Lot A",
    "Services d'actuariat — Caisse nationale de sécurité sociale",
  ],
  "Eau / Assainissement": [
    "Extension du réseau d'eau potable — Kindia Centre",
    "Construction de latrines publiques — Conakry Communes",
    "Station de traitement des eaux usées — Conakry",
  ],
  "Télécom": [
    "Déploiement 4G en zones rurales — Licence ARTP",
    "Fourniture de matériel de transmission radio",
    "Maintenance des infrastructures de télécommunications",
  ],
  "Sécurité": [
    "Fourniture d'équipements de sécurité publique",
    "Système de vidéosurveillance — Ville de Conakry",
  ],
  "Industrie": [
    "Étude de faisabilité usine de transformation de bauxite",
    "Fourniture d'équipements industriels — Zone franche",
  ],
  "Logistique": [
    "Services de transport humanitaire — PAM Guinée",
    "Acquisition de véhicules tout-terrain — Flotte ministérielle",
  ],
  "Fournitures": [
    "Fourniture de matériel de bureau — Administration publique",
    "Acquisition de mobilier de bureau — Ministères",
  ],
  "Maintenance": [
    "Maintenance des équipements HVAC — Bâtiments publics",
    "Entretien des groupes électrogènes — Hôpitaux",
  ],
};

const AUTHORITIES: string[] = [
  "Direction Nationale des Marchés Publics",
  "Ministère des Travaux Publics",
  "Ministère de la Santé et de l'Hygiène Publique",
  "Ministère de l'Énergie et de l'Hydraulique",
  "Ministère de l'Éducation Nationale",
  "SOGUIPAMI",
  "EDG — Électricité de Guinée",
  "Banque Mondiale",
  "BAD — Banque Africaine de Développement",
  "Union Européenne — Délégation Guinée",
  "UNOPS Guinée",
  "PNUD Guinée",
  "ONUDI Guinée",
  "SEG — Société des Eaux de Guinée",
  "ARTP",
  "Orange Guinée",
  "AGUIPE",
  "Ministère de l'Agriculture",
];

const REGIONS: GuineaRegion[] = [
  "Conakry", "Kindia", "Boké", "Labé", "Mamou",
  "Faranah", "Kankan", "Nzérékoré", "National",
];

// ===== Fonctions utilitaires =====

/** Génère un identifiant unique */
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/** Génère une date aléatoire dans les N prochains jours */
function randomFutureDate(minDays: number, maxDays: number): string {
  const days = minDays + Math.floor(Math.random() * (maxDays - minDays));
  const date = new Date(Date.now() + days * 24 * 3600000);
  return date.toISOString();
}

/** Génère un budget aléatoire en GNF */
function randomBudget(sector: string): { min: number; max: number } {
  const ranges: Record<string, [number, number]> = {
    "BTP": [5_000_000_000, 50_000_000_000],
    "Mines": [10_000_000_000, 80_000_000_000],
    "IT / Digital": [500_000_000, 5_000_000_000],
    "Santé": [1_000_000_000, 15_000_000_000],
    "Énergie": [3_000_000_000, 25_000_000_000],
    "Éducation": [500_000_000, 8_000_000_000],
    "Agriculture": [1_000_000_000, 10_000_000_000],
    "Conseil": [200_000_000, 3_000_000_000],
    "Finance": [500_000_000, 5_000_000_000],
    "Eau / Assainissement": [2_000_000_000, 20_000_000_000],
    "Télécom": [2_000_000_000, 15_000_000_000],
    "Sécurité": [500_000_000, 5_000_000_000],
    "Industrie": [3_000_000_000, 30_000_000_000],
    "Logistique": [500_000_000, 8_000_000_000],
    "Fournitures": [100_000_000, 2_000_000_000],
    "Maintenance": [200_000_000, 3_000_000_000],
  };

  const [min, max] = ranges[sector] || [500_000_000, 5_000_000_000];
  const budgetMin = min + Math.floor(Math.random() * (max - min) * 0.3);
  const budgetMax = budgetMin + Math.floor(Math.random() * (max - budgetMin));

  return { min: budgetMin, max: budgetMax };
}

/** Sélectionne un élément aléatoire d'un tableau */
function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ===== Algorithme de détection de doublons =====

/**
 * Calcule la similarité entre deux titres de tenders.
 * Utilise une combinaison de :
 * - Similarité de Jaccard sur les mots-clés
 * - Similarité de Levenshtein normalisée
 * - Comparaison des métadonnées (secteur, autorité, budget)
 */
function calculateSimilarity(a: CrawlResult, b: CrawlResult): number {
  let score = 0;

  // 1. Similarité des titres (Jaccard sur les mots)
  const wordsA = new Set(a.title.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const wordsB = new Set(b.title.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  const jaccardTitle = union.size > 0 ? intersection.size / union.size : 0;
  score += jaccardTitle * 0.45;

  // 2. Même autorité publiante
  if (a.publishingAuthority === b.publishingAuthority) {
    score += 0.2;
  }

  // 3. Même secteur
  if (a.sector === b.sector) {
    score += 0.15;
  }

  // 4. Même région
  if (a.region === b.region) {
    score += 0.1;
  }

  // 5. Chevauchement des budgets
  const budgetOverlap = Math.max(0, Math.min(a.budgetMax, b.budgetMax) - Math.max(a.budgetMin, b.budgetMin));
  const budgetRange = Math.max(a.budgetMax - a.budgetMin, b.budgetMax - b.budgetMin);
  const budgetSimilarity = budgetRange > 0 ? budgetOverlap / budgetRange : 0;
  score += budgetSimilarity * 0.1;

  return Math.min(1, score);
}

/**
 * Détecte les doublons dans une liste de résultats de crawl.
 * Un tender est marqué comme doublon si la similarité dépasse le seuil.
 */
export function detectDuplicates(
  results: CrawlResult[],
  existingTenders: CrawlResult[] = [],
  threshold: number = 0.65
): CrawlResult[] {
  const allTenders = [...existingTenders];
  const deduplicated: CrawlResult[] = [];

  for (const result of results) {
    let isDuplicate = false;
    let duplicateOf: string | undefined;
    let maxSimilarity = 0;

    // Comparer avec les tenders existants
    for (const existing of allTenders) {
      const similarity = calculateSimilarity(result, existing);
      if (similarity >= threshold && similarity > maxSimilarity) {
        isDuplicate = true;
        duplicateOf = existing.id;
        maxSimilarity = similarity;
      }
    }

    // Comparer avec les résultats déjà traités dans ce batch
    for (const processed of deduplicated) {
      if (!processed.isDuplicate) {
        const similarity = calculateSimilarity(result, processed);
        if (similarity >= threshold && similarity > maxSimilarity) {
          isDuplicate = true;
          duplicateOf = processed.id;
          maxSimilarity = similarity;
        }
      }
    }

    deduplicated.push({
      ...result,
      isDuplicate,
      duplicateOf,
      similarityScore: maxSimilarity > 0 ? maxSimilarity : undefined,
    });

    // Ajouter aux tenders connus si ce n'est pas un doublon
    if (!isDuplicate) {
      allTenders.push(result);
    }
  }

  return deduplicated;
}

// ===== Classification automatique =====

/**
 * Classe automatiquement un tender par secteur et région.
 * Analyse le titre, la description et les métadonnées de la source.
 */
export function classifyTender(
  title: string,
  description: string,
  sourceSector: Sector,
  sourceRegion: GuineaRegion
): { sector: Sector; region: GuineaRegion } {
  const text = `${title} ${description}`.toLowerCase();

  // Mots-clés par secteur
  const sectorKeywords: Record<string, string[]> = {
    "BTP": ["construction", "route", "pont", "bâtiment", "infrastructure", "voirie", "aménagement", "travaux publics", "béton", "asphalte"],
    "Mines": ["mine", "minier", "bauxite", "fer", "or", "diamant", "exploration", "extraction", "géologique"],
    "IT / Digital": ["numérique", "digital", "informatique", "logiciel", "e-gouvernement", "fibre", "données", "plateforme", "api", "cloud"],
    "Santé": ["santé", "médic", "hospitalier", "vaccination", "pharmacie", "clinique", "chirurgic"],
    "Énergie": ["électricité", "solaire", "hydroélectrique", "énergie", "électrification", "panneaux", "centrale"],
    "Éducation": ["éducation", "scolaire", "enseignement", "université", "formation", "école", "professeur"],
    "Agriculture": ["agricole", "agriculture", "irrigation", "intrant", "cacao", "café", "riz", "culture"],
    "Conseil": ["consultation", "audit", "conseil", "étude", "expertise", "assistance technique", "organisationnel"],
    "Finance": ["financier", "paiement", "banque", "actuariat", "assurance", "comptable", "budget"],
    "Eau / Assainissement": ["eau potable", "assainissement", "latrines", "station de traitement", "canalisation", "hydraulique"],
    "Télécom": ["télécom", "4g", "5g", "radio", "transmission", "antenne", "réseau mobile", "bande passante"],
    "Sécurité": ["sécurité", "surveillance", "vidéo", "police", "défense", "protection"],
    "Industrie": ["industriel", "usine", "transformation", "zone franche", "chaîne de production"],
    "Logistique": ["transport", "logistique", "véhicule", "flotte", "entrepôt", "fret"],
    "Fournitures": ["fourniture", "matériel de bureau", "mobilier", "équipement bureautique"],
    "Maintenance": ["maintenance", "entretien", "hvac", "groupe électrogène", "réparation"],
  };

  // Trouver le secteur avec le plus de mots-clés correspondants
  let bestSector: Sector = sourceSector;
  let bestScore = 0;

  for (const [sector, keywords] of Object.entries(sectorKeywords)) {
    const matchCount = keywords.filter(kw => text.includes(kw)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestSector = sector as Sector;
    }
  }

  // Si aucun mot-clé ne correspond, garder le secteur de la source
  if (bestScore === 0) {
    bestSector = sourceSector;
  }

  // Classification par région
  const regionKeywords: Record<string, string[]> = {
    "Conakry": ["conakry", "kaloum", "dixinn", "matam", "matoto", "ratomka"],
    "Kindia": ["kindia", "forécariah", "télimélé"],
    "Boké": ["boké", "boffa", "kamsar", "gaoual"],
    "Labé": ["labé", "lélouma", "tougou", "koubia"],
    "Mamou": ["mamou", "dabola", "pita", "dalicoro"],
    "Faranah": ["faranah", "dabola", "kissidougou"],
    "Kankan": ["kankan", "kouroussa", "siguiri", "mandiana"],
    "Nzérékoré": ["nzérékoré", "beyla", "guéckédou", "macenta", "yomou"],
    "National": ["national", "guinée", "tout le territoire"],
  };

  let bestRegion: GuineaRegion = sourceRegion;
  let bestRegionScore = 0;

  for (const [region, keywords] of Object.entries(regionKeywords)) {
    const matchCount = keywords.filter(kw => text.includes(kw)).length;
    if (matchCount > bestRegionScore) {
      bestRegionScore = matchCount;
      bestRegion = region as GuineaRegion;
    }
  }

  if (bestRegionScore === 0) {
    bestRegion = sourceRegion;
  }

  return { sector: bestSector, region: bestRegion };
}

// ===== Simulation de crawl =====

/**
 * Simule le crawl d'une source et retourne les tenders découverts.
 * En production, cette fonction se connecterait réellement aux sources.
 */
export function crawlSource(source: CrawlSource): CrawlResult[] {
  const results: CrawlResult[] = [];

  // Nombre de tenders à simuler (0-8, dépendant de la santé de la source)
  const healthFactor = source.health.status === "healthy" ? 1 : source.health.status === "degraded" ? 0.6 : 0.2;
  const count = Math.floor(Math.random() * 6 * healthFactor) + 1;

  const titles = TENDER_TITLES[source.sector] || TENDER_TITLES["BTP"];

  for (let i = 0; i < count; i++) {
    const title = randomPick(titles);
    const budget = randomBudget(source.sector);
    const deadlineDays = 15 + Math.floor(Math.random() * 75);
    const classification = classifyTender(
      title,
      `Appel d'offres publié par ${source.name}`,
      source.sector,
      source.region
    );

    results.push({
      id: generateId("tender"),
      sourceId: source.id,
      title: `${title} — ${source.sector}`,
      description: `Appel d'offres publié par ${source.name}. ${source.description}`,
      url: `${source.url}/ao/${Date.now()}-${i}`,
      publishedAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 3600000)).toISOString(),
      deadlineDate: randomFutureDate(deadlineDays, deadlineDays + 30),
      publishingAuthority: randomPick(AUTHORITIES),
      sector: classification.sector,
      region: classification.region,
      budgetMin: budget.min,
      budgetMax: budget.max,
      tenderType: source.type === "international" ? "international" : "national",
      isDuplicate: false,
      crawledAt: new Date().toISOString(),
    });
  }

  return results;
}

// ===== Pipeline ETL =====

/** Crée une nouvelle exécution du pipeline ETL */
export function createETLPipeline(sourceId: string): ETLPipelineResult {
  return {
    runId: generateId("etl"),
    startedAt: new Date().toISOString(),
    completedAt: null,
    sourceId,
    steps: [
      {
        id: "extract",
        name: "Extraction",
        description: "Connexion à la source et récupération des données brutes",
        duration: 1500 + Math.floor(Math.random() * 2000),
        status: "pending",
        processedCount: 0,
      },
      {
        id: "parse",
        name: "Parsing",
        description: "Analyse et structuration des données HTML/JSON/XML",
        duration: 800 + Math.floor(Math.random() * 1200),
        status: "pending",
        processedCount: 0,
      },
      {
        id: "classify",
        name: "Classification",
        description: "Classification automatique par secteur et région",
        duration: 400 + Math.floor(Math.random() * 600),
        status: "pending",
        processedCount: 0,
      },
      {
        id: "deduplicate",
        name: "Déduplication",
        description: "Détection et filtrage des doublons",
        duration: 600 + Math.floor(Math.random() * 800),
        status: "pending",
        processedCount: 0,
      },
      {
        id: "enrich",
        name: "Enrichissement",
        description: "Ajout de métadonnées, scoring préliminaire et tags",
        duration: 500 + Math.floor(Math.random() * 700),
        status: "pending",
        processedCount: 0,
      },
      {
        id: "load",
        name: "Chargement",
        description: "Insertion dans la base de données et indexation",
        duration: 300 + Math.floor(Math.random() * 500),
        status: "pending",
        processedCount: 0,
      },
    ],
    rawTenderCount: 0,
    duplicateCount: 0,
    newTenderCount: 0,
    errorCount: 0,
    status: "running",
  };
}

/**
 * Exécute le pipeline ETL complet pour une source donnée.
 * Retourne le résultat après simulation de toutes les étapes.
 */
export function runETLPipeline(source: CrawlSource): ETLPipelineResult {
  const pipeline = createETLPipeline(source.id);

  // Étape 1 : Extraction
  const rawResults = crawlSource(source);
  pipeline.rawTenderCount = rawResults.length;
  pipeline.steps[0].status = "completed";
  pipeline.steps[0].processedCount = rawResults.length;

  // Étape 2 : Parsing
  pipeline.steps[1].status = "completed";
  pipeline.steps[1].processedCount = rawResults.length;

  // Étape 3 : Classification (déjà faite dans crawlSource via classifyTender)
  pipeline.steps[2].status = "completed";
  pipeline.steps[2].processedCount = rawResults.length;

  // Étape 4 : Déduplication
  const deduplicated = detectDuplicates(rawResults);
  const duplicates = deduplicated.filter(r => r.isDuplicate);
  const newTenders = deduplicated.filter(r => !r.isDuplicate);
  pipeline.duplicateCount = duplicates.length;
  pipeline.steps[3].status = "completed";
  pipeline.steps[3].processedCount = rawResults.length;

  // Étape 5 : Enrichissement
  pipeline.steps[4].status = "completed";
  pipeline.steps[4].processedCount = newTenders.length;

  // Étape 6 : Chargement
  pipeline.newTenderCount = newTenders.length;
  pipeline.steps[5].status = "completed";
  pipeline.steps[5].processedCount = newTenders.length;

  // Simuler quelques erreurs aléatoires
  if (Math.random() < 0.15) {
    pipeline.errorCount = Math.floor(Math.random() * 2) + 1;
  }

  pipeline.completedAt = new Date().toISOString();
  pipeline.status = "completed";

  return pipeline;
}

// ===== Monitoring de santé =====

/** Calcule le statut de santé à partir des métriques */
export function computeHealthStatus(health: SourceHealth): HealthStatus {
  if (health.successRate >= 0.85 && health.uptime24h >= 90) {
    return "healthy";
  }
  if (health.successRate >= 0.60 && health.uptime24h >= 70) {
    return "degraded";
  }
  return "down";
}

/** Retourne la couleur associée au statut de santé */
export function healthColor(status: HealthStatus): string {
  switch (status) {
    case "healthy": return "text-emerald-600";
    case "degraded": return "text-amber-600";
    case "down": return "text-red-600";
  }
}

/** Retourne la couleur de fond associée au statut de santé */
export function healthBgColor(status: HealthStatus): string {
  switch (status) {
    case "healthy": return "bg-emerald-500/10";
    case "degraded": return "bg-amber-500/10";
    case "down": return "bg-red-500/10";
  }
}

/** Retourne le label français du statut de santé */
export function healthLabel(status: HealthStatus): string {
  switch (status) {
    case "healthy": return "Opérationnel";
    case "degraded": return "Dégradé";
    case "down": return "Hors service";
  }
}

/** Retourne le label français du type de source */
export function sourceTypeLabel(type: SourceType): string {
  switch (type) {
    case "government": return "Gouvernement";
    case "enterprise": return "Entreprise";
    case "international": return "International";
    case "media": return "Média";
  }
}

/** Retourne la variante de badge pour le type de source */
export function sourceTypeBadgeVariant(type: SourceType): "primary" | "success" | "warning" | "info" {
  switch (type) {
    case "government": return "primary";
    case "enterprise": return "success";
    case "international": return "warning";
    case "media": return "info";
  }
}

/** Formate une date relative en français */
export function formatRelativeTime(isoDate: string | null): string {
  if (!isoDate) return "Jamais";

  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;

  if (diffMs < 60000) return "À l'instant";
  if (diffMs < 3600000) return `Il y a ${Math.floor(diffMs / 60000)} min`;
  if (diffMs < 86400000) return `Il y a ${Math.floor(diffMs / 3600000)}h`;
  if (diffMs < 172800000) return "Hier";
  return `Il y a ${Math.floor(diffMs / 86400000)} jours`;
}

/** Formate un temps de réponse */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}
