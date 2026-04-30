/**
 * TenderFlow Guinea — Reports Engine
 * 
 * Comprehensive reporting system with 6 built-in templates,
 * data generation, and export capabilities.
 */

// ===== Types =====

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "operationnel" | "strategique" | "personnalise";
  sections: ReportSectionDefinition[];
  parameters: ReportParameter[];
}

export interface ReportParameter {
  id: string;
  label: string;
  type: "date_range" | "select" | "multiselect" | "toggle";
  required: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface ReportSectionDefinition {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface ReportData {
  title: string;
  subtitle: string;
  dateRange: { from: string; to: string };
  generatedAt: string;
  executiveSummary: string;
  keyMetrics: ReportMetric[];
  sections: ReportSection[];
  recommendations: ReportRecommendation[];
}

export interface ReportMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
}

export interface ReportSection {
  id: string;
  title: string;
  description: string;
  type: "table" | "chart" | "text";
  data: Record<string, unknown>[];
  columns?: { key: string; label: string }[];
  chartType?: "bar" | "line" | "pie" | "radar";
  chartData?: { name: string; value: number; change?: number }[];
}

export interface ReportChart {
  type: "bar" | "line" | "pie" | "radar";
  title: string;
  data: { name: string; value: number; change?: number }[];
}

export interface ReportRecommendation {
  id: string;
  priority: "immediate" | "court_terme" | "moyen_terme";
  title: string;
  description: string;
  impact: string;
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  data: ReportData;
  parameters: Record<string, unknown>;
}

// ===== Guinea-Specific Mock Data =====

const SECTORS = [
  "BTP & Infrastructures",
  "Mines & Géologie",
  "IT & Digital",
  "Santé & Santé publique",
  "Énergie & Électrification",
  "Éducation & Formation",
  "Agriculture & Élevage",
  "Transport & Logistique",
  "Eau & Assainissement",
  "Télécommunications",
];

const REGIONS = [
  "Conakry",
  "Kindia",
  "Boké",
  "Labé",
  "Mamou",
  "Faranah",
  "Kankan",
  "Nzérékoré",
];

const COMPETITORS = [
  { name: "Consortium Sinohydro", country: "Chine", marketShare: 18, strength: "Grants projets BTP" },
  { name: "Bouygues Guinée", country: "France", marketShare: 12, strength: "Infrastructures routes" },
  { name: "Turma Guinée", country: "Turquie", marketShare: 9, strength: "Bâtiments publics" },
  { name: "Groupement Local Guinéen", country: "Guinée", marketShare: 7, strength: "Connaissance terrain" },
  { name: "Vinci Construction", country: "France", marketShare: 11, strength: "Grands ouvrages" },
  { name: "CGCOC Guinée", country: "Chine", marketShare: 8, strength: "Mines & Énergie" },
];

// ===== Report Templates =====

export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "weekly",
    name: "Rapport hebdomadaire",
    description: "Synthèse des nouveaux appels d'offres, scores IA et échéances de la semaine",
    icon: "Calendar",
    category: "operationnel",
    sections: [
      { id: "new_tenders", title: "Nouveaux appels d'offres", description: "Liste des AO publiés cette semaine", required: true },
      { id: "scores", title: "Scores IA", description: "Évolution des scores de correspondance", required: true },
      { id: "deadlines", title: "Échéances", description: "Appels d'offres arrivant à expiration", required: true },
      { id: "actions", title: "Actions requises", description: "Actions à entreprendre", required: false },
    ],
    parameters: [
      { id: "date_range", label: "Période", type: "date_range", required: true, defaultValue: "last_week" },
      { id: "sectors", label: "Secteurs", type: "multiselect", required: false, options: SECTORS.map(s => ({ value: s, label: s })) },
    ],
  },
  {
    id: "sector",
    name: "Analyse sectorielle",
    description: "Analyse approfondie d'un secteur spécifique avec tendances et opportunités",
    icon: "PieChart",
    category: "strategique",
    sections: [
      { id: "overview", title: "Vue d'ensemble", description: "Volume et budget du secteur", required: true },
      { id: "trends", title: "Tendances", description: "Évolution sur 6 mois", required: true },
      { id: "opportunities", title: "Opportunités", description: "AO à fort potentiel", required: true },
      { id: "competition", title: "Concurrence", description: "Positionnement concurrentiel", required: false },
    ],
    parameters: [
      { id: "sector", label: "Secteur", type: "select", required: true, options: SECTORS.map(s => ({ value: s, label: s })) },
      { id: "date_range", label: "Période", type: "date_range", required: true, defaultValue: "last_3_months" },
    ],
  },
  {
    id: "performance",
    name: "Rapport de performance",
    description: "Taux de réussite, scores moyens et tendances de vos soumissions",
    icon: "TrendingUp",
    category: "strategique",
    sections: [
      { id: "win_rate", title: "Taux de réussite", description: "Évolution du taux de remporte", required: true },
      { id: "scores_evolution", title: "Évolution des scores", description: "Tendance des scores IA", required: true },
      { id: "budget_analysis", title: "Analyse budgétaire", description: "Budget des AO suivis vs remportés", required: true },
      { id: "recommendations", title: "Recommandations", description: "Points d'amélioration", required: false },
    ],
    parameters: [
      { id: "date_range", label: "Période", type: "date_range", required: true, defaultValue: "last_quarter" },
      { id: "include_lost", label: "Inclure les AO perdus", type: "toggle", required: false, defaultValue: "true" },
    ],
  },
  {
    id: "regional",
    name: "Rapport régional",
    description: "Analyse des appels d'offres par région de Guinée avec cartographie",
    icon: "MapPin",
    category: "strategique",
    sections: [
      { id: "regional_overview", title: "Vue par région", description: "Volume d'AO par région", required: true },
      { id: "budget_by_region", title: "Budgets par région", description: "Répartition des budgets", required: true },
      { id: "sector_distribution", title: "Secteurs par région", description: "Spécialisations régionales", required: false },
      { id: "opportunities", title: "Opportunités régionales", description: "Régions à fort potentiel", required: false },
    ],
    parameters: [
      { id: "region", label: "Région", type: "select", required: false, options: [{ value: "all", label: "Toutes les régions" }, ...REGIONS.map(r => ({ value: r, label: r }))] },
      { id: "date_range", label: "Période", type: "date_range", required: true, defaultValue: "last_month" },
    ],
  },
  {
    id: "competitive",
    name: "Analyse concurrentielle",
    description: "Positionnement concurrentiel, parts de marché et stratégies d'adaptation",
    icon: "Swords",
    category: "strategique",
    sections: [
      { id: "market_share", title: "Parts de marché", description: "Positionnement des concurrents", required: true },
      { id: "threats", title: "Menaces concurrentielles", description: "Concurrents actifs sur vos AO", required: true },
      { id: "strengths", title: "Forces & Faiblesses", description: "Analyse SWOT", required: true },
      { id: "strategies", title: "Stratégies", description: "Recommandations de contournement", required: false },
    ],
    parameters: [
      { id: "sectors", label: "Secteurs", type: "multiselect", required: false, options: SECTORS.map(s => ({ value: s, label: s })) },
      { id: "date_range", label: "Période", type: "date_range", required: true, defaultValue: "last_6_months" },
    ],
  },
  {
    id: "custom",
    name: "Rapport personnalisé",
    description: "Créez votre propre rapport en sélectionnant les sections souhaitées",
    icon: "FileStack",
    category: "personnalise",
    sections: [
      { id: "tenders_summary", title: "Résumé des AO", description: "Vue d'ensemble des appels d'offres", required: false },
      { id: "scores_analysis", title: "Analyse des scores", description: "Détail des scores IA", required: false },
      { id: "deadline_tracker", title: "Suivi des échéances", description: "Échéances à venir", required: false },
      { id: "budget_report", title: "Rapport budgétaire", description: "Analyse des budgets", required: false },
      { id: "regional_analysis", title: "Analyse régionale", description: "Répartition géographique", required: false },
      { id: "sector_analysis", title: "Analyse sectorielle", description: "Performance par secteur", required: false },
    ],
    parameters: [
      { id: "sections", label: "Sections", type: "multiselect", required: true, options: [
        { value: "tenders_summary", label: "Résumé des AO" },
        { value: "scores_analysis", label: "Analyse des scores" },
        { value: "deadline_tracker", label: "Suivi des échéances" },
        { value: "budget_report", label: "Rapport budgétaire" },
        { value: "regional_analysis", label: "Analyse régionale" },
        { value: "sector_analysis", label: "Analyse sectorielle" },
      ] },
      { id: "date_range", label: "Période", type: "date_range", required: true, defaultValue: "last_month" },
    ],
  },
];

// ===== Helper Functions =====

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatGNF(amount: number): string {
  return new Intl.NumberFormat("fr-GN").format(amount) + " GNF";
}

function getDateRange(period: string): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from: string;
  switch (period) {
    case "last_week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      from = d.toISOString().split("T")[0];
      break;
    }
    case "last_month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      from = d.toISOString().split("T")[0];
      break;
    }
    case "last_3_months": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      from = d.toISOString().split("T")[0];
      break;
    }
    case "last_quarter": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      from = d.toISOString().split("T")[0];
      break;
    }
    case "last_6_months": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      from = d.toISOString().split("T")[0];
      break;
    }
    default: {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      from = d.toISOString().split("T")[0];
    }
  }
  return { from, to };
}

// ===== Report Generation Functions =====

function generateWeeklyReport(parameters: Record<string, unknown>): ReportData {
  const period = (parameters.date_range as string) || "last_week";
  const dateRange = getDateRange(period);

  return {
    title: "Rapport hebdomadaire",
    subtitle: `Semaine du ${new Date(dateRange.from).toLocaleDateString("fr-FR")} au ${new Date(dateRange.to).toLocaleDateString("fr-FR")}`,
    dateRange,
    generatedAt: new Date().toISOString(),
    executiveSummary: "Cette semaine a été marquée par une augmentation significative des appels d'offres dans le secteur BTP (+23%) et Énergie (+15%). Le score moyen de correspondance de votre profil est de 72/100, en hausse de 4 points. Trois appels d'offres nécessitent une attention immédiate avec des échéances sous 5 jours.",
    keyMetrics: [
      { label: "Nouveaux AO", value: "47", change: 12, trend: "up" },
      { label: "Score moyen IA", value: "72/100", change: 4, trend: "up" },
      { label: "Échéances proches", value: "8", change: -3, trend: "down" },
      { label: "Budget total", value: formatGNF(28_500_000_000), change: 18, trend: "up" },
      { label: "AO correspondants", value: "14", change: 5, trend: "up" },
      { label: "Taux de réponse", value: "68%", change: -2, trend: "down" },
    ],
    sections: [
      {
        id: "new_tenders",
        title: "Nouveaux appels d'offres",
        description: "47 nouveaux AO publiés cette semaine",
        type: "table",
        columns: [
          { key: "reference", label: "Référence" },
          { key: "title", label: "Intitulé" },
          { key: "sector", label: "Secteur" },
          { key: "budget", label: "Budget" },
          { key: "deadline", label: "Échéance" },
          { key: "score", label: "Score IA" },
        ],
        data: [
          { reference: "AO/MTP/2026/0142", title: "Reconstruction pont Tombo", sector: "BTP & Infrastructures", budget: formatGNF(4_200_000_000), deadline: "2026-05-15", score: "87/100" },
          { reference: "AO/EDG/2026/0089", title: "Électrification rurale Nzérékoré", sector: "Énergie & Électrification", budget: formatGNF(8_500_000_000), deadline: "2026-05-20", score: "82/100" },
          { reference: "AO/MS/2026/0056", title: "Fourniture équipements hospitaliers", sector: "Santé & Santé publique", budget: formatGNF(1_200_000_000), deadline: "2026-04-28", score: "76/100" },
          { reference: "AO/ME/2026/0078", title: "Réseau fibre optique Kankan", sector: "IT & Digital", budget: formatGNF(3_800_000_000), deadline: "2026-05-10", score: "74/100" },
          { reference: "AO/MA/2026/0034", title: "Irrigation périmètre Haute-Guinée", sector: "Agriculture & Élevage", budget: formatGNF(2_100_000_000), deadline: "2026-05-25", score: "69/100" },
        ],
      },
      {
        id: "scores",
        title: "Évolution des scores IA",
        description: "Tendance des scores de correspondance",
        type: "chart",
        chartType: "line",
        chartData: [
          { name: "S1 Mars", value: 65, change: 0 },
          { name: "S2 Mars", value: 68, change: 3 },
          { name: "S3 Mars", value: 66, change: -2 },
          { name: "S4 Mars", value: 71, change: 5 },
          { name: "S1 Avr", value: 69, change: -2 },
          { name: "S2 Avr", value: 72, change: 3 },
        ],
        data: [],
      },
      {
        id: "deadlines",
        title: "Échéances critiques",
        description: "8 appels d'offres avec échéances sous 14 jours",
        type: "table",
        columns: [
          { key: "reference", label: "Référence" },
          { key: "title", label: "Intitulé" },
          { key: "deadline", label: "Échéance" },
          { key: "daysLeft", label: "Jours restants" },
          { key: "status", label: "Statut" },
        ],
        data: [
          { reference: "AO/MS/2026/0056", title: "Fourniture équipements hospitaliers", deadline: "2026-04-28", daysLeft: "3 jours", status: "Critique" },
          { reference: "AO/MTP/2026/0135", title: "Réhabilitation route Conakry-Kindia", deadline: "2026-04-30", daysLeft: "5 jours", status: "Urgent" },
          { reference: "AO/DNE/2026/0091", title: "Audit système informatique", deadline: "2026-05-02", daysLeft: "7 jours", status: "Attention" },
          { reference: "AO/ME/2026/0078", title: "Réseau fibre optique Kankan", deadline: "2026-05-10", daysLeft: "15 jours", status: "Normal" },
        ],
      },
    ],
    recommendations: [
      { id: "r1", priority: "immediate", title: "Soumission AO/MTP/2026/0142", description: "Score de 87/100 — forte correspondance avec votre profil BTP. Préparer la soumission en priorité.", impact: "Potentiel de gain : 4,2 Mds GNF" },
      { id: "r2", priority: "immediate", title: "Accélérer AO/MS/2026/0056", description: "Échéance dans 3 jours. Score de 76/100, dossier en cours de préparation.", impact: "Budget : 1,2 Mds GNF" },
      { id: "r3", priority: "court_terme", title: "Partenariat énergie", description: "Former un consortium pour l'AO d'électrification rurale à Nzérékoré.", impact: "Budget : 8,5 Mds GNF" },
      { id: "r4", priority: "moyen_terme", title: "Diversifier vers l'agriculture", description: "Le secteur agricole représente 12% des AO mais 3% de vos soumissions.", impact: "Opportunité de marché inexploitée" },
    ],
  };
}

function generateSectorReport(parameters: Record<string, unknown>): ReportData {
  const sector = (parameters.sector as string) || "BTP & Infrastructures";
  const period = (parameters.date_range as string) || "last_3_months";
  const dateRange = getDateRange(period);

  return {
    title: "Analyse sectorielle",
    subtitle: `${sector} — ${new Date(dateRange.from).toLocaleDateString("fr-FR")} au ${new Date(dateRange.to).toLocaleDateString("fr-FR")}`,
    dateRange,
    generatedAt: new Date().toISOString(),
    executiveSummary: `Le secteur ${sector} représente 34% des appels d'offres publiés en Guinée ce trimestre, avec un budget cumulé de 125 Mds GNF. L'activité est concentrée à Conakry (42%) et Kankan (18%). Les projets d'infrastructure routière dominent avec 56% du volume. Votre positionnement est solide avec un taux de correspondance de 78%.`,
    keyMetrics: [
      { label: "Volume d'AO", value: "156", change: 23, trend: "up" },
      { label: "Budget total", value: "125 Mds GNF", change: 15, trend: "up" },
      { label: "Score secteur", value: "78/100", change: 6, trend: "up" },
      { label: "Concurrents actifs", value: "12", change: 3, trend: "up" },
      { label: "Votre rang", value: "4e", change: 1, trend: "up" },
      { label: "AO correspondants", value: "42", change: 8, trend: "up" },
    ],
    sections: [
      {
        id: "overview",
        title: "Vue d'ensemble du secteur",
        description: "Volume et budget des AO dans le secteur",
        type: "chart",
        chartType: "bar",
        chartData: SECTORS.slice(0, 6).map(s => ({
          name: s.split(" & ")[0],
          value: randomBetween(20, 180),
          change: randomBetween(-10, 25),
        })),
        data: [],
      },
      {
        id: "trends",
        title: "Tendances trimestrielles",
        description: "Évolution du nombre d'AO sur 6 mois",
        type: "chart",
        chartType: "line",
        chartData: [
          { name: "Nov", value: 112, change: 0 },
          { name: "Déc", value: 98, change: -14 },
          { name: "Jan", value: 125, change: 27 },
          { name: "Fév", value: 138, change: 13 },
          { name: "Mar", value: 145, change: 7 },
          { name: "Avr", value: 156, change: 11 },
        ],
        data: [],
      },
      {
        id: "opportunities",
        title: "Top opportunités",
        description: "AO à fort potentiel dans ce secteur",
        type: "table",
        columns: [
          { key: "reference", label: "Référence" },
          { key: "title", label: "Intitulé" },
          { key: "budget", label: "Budget" },
          { key: "region", label: "Région" },
          { key: "score", label: "Score" },
        ],
        data: [
          { reference: "AO/MTP/2026/0142", title: "Reconstruction pont Tombo", budget: formatGNF(4_200_000_000), region: "Conakry", score: "87/100" },
          { reference: "AO/MTP/2026/0138", title: "Route Kankan-Kérouané", budget: formatGNF(6_800_000_000), region: "Kankan", score: "84/100" },
          { reference: "AO/MTP/2026/0145", title: "Drainage quartier Kaloum", budget: formatGNF(2_500_000_000), region: "Conakry", score: "81/100" },
          { reference: "AO/MTP/2026/0150", title: "Pont Guéckédou-Nzérékoré", budget: formatGNF(5_100_000_000), region: "Nzérékoré", score: "79/100" },
        ],
      },
    ],
    recommendations: [
      { id: "r1", priority: "immediate", title: "Cibler les AO > 2 Mds GNF", description: "Votre avantage concurrentiel est plus marqué sur les gros projets.", impact: "+15% taux de réussite estimé" },
      { id: "r2", priority: "court_terme", title: "Renforcer présence Kankan", description: "Région en croissance avec peu de concurrents locaux.", impact: "12 AO non disputés" },
      { id: "r3", priority: "moyen_terme", title: "Certification ISO 9001", description: "Critère de plus en plus demandé dans les AO BTP.", impact: "Accès à 20% d'AO supplémentaires" },
    ],
  };
}

function generatePerformanceReport(parameters: Record<string, unknown>): ReportData {
  const period = (parameters.date_range as string) || "last_quarter";
  const dateRange = getDateRange(period);

  return {
    title: "Rapport de performance",
    subtitle: `T1 2026 — ${new Date(dateRange.from).toLocaleDateString("fr-FR")} au ${new Date(dateRange.to).toLocaleDateString("fr-FR")}`,
    dateRange,
    generatedAt: new Date().toISOString(),
    executiveSummary: "Sur le trimestre, votre taux de réussite est de 28% (vs 22% au T4 2025), en progression constante. Le score moyen de vos soumissions est de 74/100 (+5 points). Les secteurs BTP et Énergie restent vos points forts. L'axe d'amélioration principal est le secteur Mines avec un taux de 12%.",
    keyMetrics: [
      { label: "Taux de réussite", value: "28%", change: 6, trend: "up" },
      { label: "Score moyen", value: "74/100", change: 5, trend: "up" },
      { label: "Soumissions", value: "18", change: 4, trend: "up" },
      { label: "AO remportés", value: "5", change: 2, trend: "up" },
      { label: "Budget remporté", value: "18,5 Mds GNF", change: 35, trend: "up" },
      { label: "Temps moyen réponse", value: "3,2 jours", change: -0.5, trend: "up" },
    ],
    sections: [
      {
        id: "win_rate",
        title: "Évolution du taux de réussite",
        description: "Taux de remporte par trimestre",
        type: "chart",
        chartType: "bar",
        chartData: [
          { name: "T2 2025", value: 18, change: 0 },
          { name: "T3 2025", value: 20, change: 2 },
          { name: "T4 2025", value: 22, change: 2 },
          { name: "T1 2026", value: 28, change: 6 },
        ],
        data: [],
      },
      {
        id: "scores_evolution",
        title: "Évolution des scores IA",
        description: "Score moyen par mois",
        type: "chart",
        chartType: "line",
        chartData: [
          { name: "Oct", value: 62, change: 0 },
          { name: "Nov", value: 65, change: 3 },
          { name: "Déc", value: 64, change: -1 },
          { name: "Jan", value: 69, change: 5 },
          { name: "Fév", value: 72, change: 3 },
          { name: "Mar", value: 74, change: 2 },
        ],
        data: [],
      },
      {
        id: "budget_analysis",
        title: "Analyse budgétaire",
        description: "Budget des AO suivis vs remportés",
        type: "table",
        columns: [
          { key: "sector", label: "Secteur" },
          { key: "followed", label: "AO suivis" },
          { key: "won", label: "Remportés" },
          { key: "winRate", label: "Taux" },
          { key: "budgetWon", label: "Budget remporté" },
        ],
        data: [
          { sector: "BTP & Infrastructures", followed: "8", won: "3", winRate: "38%", budgetWon: formatGNF(9_800_000_000) },
          { sector: "Énergie & Électrification", followed: "5", won: "1", winRate: "20%", budgetWon: formatGNF(5_200_000_000) },
          { sector: "IT & Digital", followed: "3", won: "1", winRate: "33%", budgetWon: formatGNF(2_100_000_000) },
          { sector: "Mines & Géologie", followed: "2", won: "0", winRate: "0%", budgetWon: "0 GNF" },
        ],
      },
    ],
    recommendations: [
      { id: "r1", priority: "immediate", title: "Améliorer les dossiers Mines", description: "Taux de 0% — engager un expert mines pour renforcer les soumissions.", impact: "Potentiel 2-3 AO Mines ce trimestre" },
      { id: "r2", priority: "court_terme", title: "Standardiser les réponses BTP", description: "Votre taux de 38% en BTP peut atteindre 45% avec des modèles standardisés.", impact: "+7% taux de réussite" },
      { id: "r3", priority: "moyen_terme", title: "Former consortiums énergie", description: "Les grands projets énergie nécessitent des groupements.", impact: "Accès à AO > 5 Mds GNF" },
    ],
  };
}

function generateRegionalReport(parameters: Record<string, unknown>): ReportData {
  const region = (parameters.region as string) || "all";
  const period = (parameters.date_range as string) || "last_month";
  const dateRange = getDateRange(period);

  const regionLabel = region === "all" ? "Toutes les régions" : region;

  return {
    title: "Rapport régional",
    subtitle: `${regionLabel} — ${new Date(dateRange.from).toLocaleDateString("fr-FR")} au ${new Date(dateRange.to).toLocaleDateString("fr-FR")}`,
    dateRange,
    generatedAt: new Date().toISOString(),
    executiveSummary: "Conakry concentre 42% des appels d'offres avec un budget de 85 Mds GNF, suivi de Kankan (18%) et Nzérékoré (14%). Les régions de Labé et Mamou présentent un potentiel inexploité avec peu de concurrents. L'électrification rurale et les projets BTP dominent hors-Conakry.",
    keyMetrics: [
      { label: "Régions actives", value: "8/8", change: 0, trend: "stable" },
      { label: "Total AO", value: "312", change: 15, trend: "up" },
      { label: "Budget national", value: "198 Mds GNF", change: 22, trend: "up" },
      { label: "Concentration Conakry", value: "42%", change: -3, trend: "down" },
      { label: "Région émergente", value: "Kankan", change: 0, trend: "up" },
      { label: "Potentiel inexploité", value: "Labé, Mamou", change: 0, trend: "stable" },
    ],
    sections: [
      {
        id: "regional_overview",
        title: "Volume d'AO par région",
        description: "Répartition géographique des appels d'offres",
        type: "chart",
        chartType: "bar",
        chartData: REGIONS.map(r => ({
          name: r,
          value: randomBetween(15, 140),
          change: randomBetween(-5, 20),
        })),
        data: [],
      },
      {
        id: "budget_by_region",
        title: "Budget par région",
        description: "Répartition des budgets en Mds GNF",
        type: "table",
        columns: [
          { key: "region", label: "Région" },
          { key: "tenders", label: "Nombre d'AO" },
          { key: "budget", label: "Budget total" },
          { key: "avgBudget", label: "Budget moyen" },
          { key: "topSector", label: "Secteur dominant" },
        ],
        data: [
          { region: "Conakry", tenders: "131", budget: "85 Mds GNF", avgBudget: "649 M GNF", topSector: "BTP & Infrastructures" },
          { region: "Kankan", tenders: "56", budget: "32 Mds GNF", avgBudget: "571 M GNF", topSector: "Mines & Géologie" },
          { region: "Nzérékoré", tenders: "44", budget: "25 Mds GNF", avgBudget: "568 M GNF", topSector: "Agriculture & Élevage" },
          { region: "Boké", tenders: "32", budget: "28 Mds GNF", avgBudget: "875 M GNF", topSector: "Mines & Géologie" },
          { region: "Kindia", tenders: "22", budget: "12 Mds GNF", avgBudget: "545 M GNF", topSector: "BTP & Infrastructures" },
          { region: "Labé", tenders: "14", budget: "8 Mds GNF", avgBudget: "571 M GNF", topSector: "Éducation & Formation" },
          { region: "Mamou", tenders: "8", budget: "5 Mds GNF", avgBudget: "625 M GNF", topSector: "Agriculture & Élevage" },
          { region: "Faranah", tenders: "5", budget: "3 Mds GNF", avgBudget: "600 M GNF", topSector: "Agriculture & Élevage" },
        ],
      },
      {
        id: "sector_distribution",
        title: "Secteurs dominants par région",
        description: "Spécialisation sectorielle régionale",
        type: "chart",
        chartType: "pie",
        chartData: [
          { name: "BTP", value: 34, change: 0 },
          { name: "Mines", value: 22, change: 0 },
          { name: "Énergie", value: 18, change: 0 },
          { name: "Agriculture", value: 12, change: 0 },
          { name: "Santé", value: 8, change: 0 },
          { name: "Autres", value: 6, change: 0 },
        ],
        data: [],
      },
    ],
    recommendations: [
      { id: "r1", priority: "immediate", title: "Cibler Kankan et Nzérékoré", description: "Croissance forte, peu de concurrents locaux dans ces régions.", impact: "Potentiel 15 AO non disputés" },
      { id: "r2", priority: "court_terme", title: "Établir bureau Labé", description: "Région avec 0 concurrent permanent — première arrivée = avantage.", impact: "14 AO exclusifs potentiels" },
      { id: "r3", priority: "moyen_terme", title: "Programme électrification rurale", description: "Budget de 45 Mds GNF réparti sur toutes les régions intérieures.", impact: "Marché de 45 Mds GNF sur 3 ans" },
    ],
  };
}

function generateCompetitiveReport(parameters: Record<string, unknown>): ReportData {
  const period = (parameters.date_range as string) || "last_6_months";
  const dateRange = getDateRange(period);

  return {
    title: "Analyse concurrentielle",
    description: "Positionnement et stratégies",
    subtitle: `${new Date(dateRange.from).toLocaleDateString("fr-FR")} au ${new Date(dateRange.to).toLocaleDateString("fr-FR")}`,
    dateRange,
    generatedAt: new Date().toISOString(),
    executiveSummary: "Le marché des appels d'offres en Guinée est dominé par les consortiums chinois (26% de parts de marché combinées) et les entreprises françaises (23%). Votre position actuelle est de 7% avec une forte présence en BTP. Les concurrents les plus menaçants sont Sinohydro et Bouygues sur le segment infrastructure.",
    keyMetrics: [
      { label: "Votre part de marché", value: "7%", change: 1.5, trend: "up" },
      { label: "Concurrents actifs", value: "24", change: 4, trend: "up" },
      { label: "AO disputés", value: "38", change: 8, trend: "up" },
      { label: "Taux de gain vs concurrents", value: "32%", change: 3, trend: "up" },
      { label: "Menace principale", value: "Sinohydro", change: 0, trend: "stable" },
      { label: "Opportunité", value: "Consortiums locaux", change: 0, trend: "up" },
    ],
    sections: [
      {
        id: "market_share",
        title: "Parts de marché",
        description: "Positionnement des principaux concurrents",
        type: "chart",
        chartType: "bar",
        chartData: [
          ...COMPETITORS.map(c => ({ name: c.name.split(" ")[0], value: c.marketShare, change: randomBetween(-3, 5) })),
          { name: "Vous", value: 7, change: 1.5 },
        ],
        data: [],
      },
      {
        id: "threats",
        title: "Menaces concurrentielles",
        description: "Concurrents actifs sur vos AO cibles",
        type: "table",
        columns: [
          { key: "competitor", label: "Concurrent" },
          { key: "country", label: "Origine" },
          { key: "marketShare", label: "PdM" },
          { key: "strength", label: "Force" },
          { key: "threat", label: "Menace" },
        ],
        data: COMPETITORS.map(c => ({
          competitor: c.name,
          country: c.country,
          marketShare: `${c.marketShare}%`,
          strength: c.strength,
          threat: c.marketShare >= 15 ? "Critique" : c.marketShare >= 10 ? "Élevée" : "Modérée",
        })),
      },
      {
        id: "strengths",
        title: "Analyse SWOT",
        description: "Vos forces, faiblesses, opportunités et menaces",
        type: "table",
        columns: [
          { key: "type", label: "Type" },
          { key: "item", label: "Élément" },
          { key: "impact", label: "Impact" },
        ],
        data: [
          { type: "Force", item: "Connaissance terrain Guinea", impact: "Élevé" },
          { type: "Force", item: "Réseau local établi", impact: "Élevé" },
          { type: "Force", item: "Rapidité de réponse", impact: "Moyen" },
          { type: "Faiblesse", item: "Capacité financière limitée vs grands groupes", impact: "Élevé" },
          { type: "Faiblesse", item: "Absence de certification ISO", impact: "Moyen" },
          { type: "Opportunité", item: "Préférence nationale dans les AO", impact: "Élevé" },
          { type: "Opportunité", item: "Marché électrification rurale", impact: "Élevé" },
          { type: "Menace", item: "Consortiums étrangers sous-évaluant", impact: "Critique" },
          { type: "Menace", item: "Nouveaux entrants turcs et indiens", impact: "Moyen" },
        ],
      },
    ],
    recommendations: [
      { id: "r1", priority: "immediate", title: "Former consortiums locaux", description: "S'unir avec d'autres PME guinéennes pour les grands projets.", impact: "Compétitif sur AO > 3 Mds GNF" },
      { id: "r2", priority: "court_terme", title: "Miser sur la préférence nationale", description: "Le Code des Marchés Publics accorde 15% de préférence aux entreprises locales.", impact: "Avantage de 15% sur les scores" },
      { id: "r3", priority: "moyen_terme", title: "Développer des partenariats internationaux", description: "Apporter la composante locale à des consortiums étrangers.", impact: "Accès à des AO inaccessibles seul" },
    ],
  };
}

function generateCustomReport(parameters: Record<string, unknown>): ReportData {
  const sections = (parameters.sections as string[]) || ["tenders_summary"];
  const period = (parameters.date_range as string) || "last_month";
  const dateRange = getDateRange(period);

  const allSections: ReportSection[] = [];
  const allRecommendations: ReportRecommendation[] = [];

  if (sections.includes("tenders_summary")) {
    allSections.push({
      id: "tenders_summary",
      title: "Résumé des appels d'offres",
      description: "Vue d'ensemble des AO actifs",
      type: "table",
      columns: [
        { key: "reference", label: "Référence" },
        { key: "title", label: "Intitulé" },
        { key: "sector", label: "Secteur" },
        { key: "budget", label: "Budget" },
        { key: "deadline", label: "Échéance" },
      ],
      data: [
        { reference: "AO/MTP/2026/0142", title: "Reconstruction pont Tombo", sector: "BTP", budget: formatGNF(4_200_000_000), deadline: "2026-05-15" },
        { reference: "AO/EDG/2026/0089", title: "Électrification rurale Nzérékoré", sector: "Énergie", budget: formatGNF(8_500_000_000), deadline: "2026-05-20" },
        { reference: "AO/MS/2026/0056", title: "Fourniture équipements hospitaliers", sector: "Santé", budget: formatGNF(1_200_000_000), deadline: "2026-04-28" },
      ],
    });
  }

  if (sections.includes("scores_analysis")) {
    allSections.push({
      id: "scores_analysis",
      title: "Analyse des scores IA",
      description: "Distribution et tendance des scores",
      type: "chart",
      chartType: "bar",
      chartData: [
        { name: "0-30", value: 8, change: -2 },
        { name: "31-50", value: 22, change: 3 },
        { name: "51-70", value: 45, change: 5 },
        { name: "71-85", value: 30, change: 8 },
        { name: "86-100", value: 12, change: 4 },
      ],
      data: [],
    });
  }

  if (sections.includes("deadline_tracker")) {
    allSections.push({
      id: "deadline_tracker",
      title: "Suivi des échéances",
      description: "AO arrivant à expiration",
      type: "table",
      columns: [
        { key: "reference", label: "Référence" },
        { key: "title", label: "Intitulé" },
        { key: "deadline", label: "Échéance" },
        { key: "urgency", label: "Urgence" },
      ],
      data: [
        { reference: "AO/MS/2026/0056", title: "Équipements hospitaliers", deadline: "2026-04-28", urgency: "🔴 Critique" },
        { reference: "AO/MTP/2026/0135", title: "Route Conakry-Kindia", deadline: "2026-04-30", urgency: "🟠 Urgent" },
        { reference: "AO/DNE/2026/0091", title: "Audit système informatique", deadline: "2026-05-02", urgency: "🟡 Attention" },
      ],
    });
  }

  if (sections.includes("budget_report")) {
    allSections.push({
      id: "budget_report",
      title: "Rapport budgétaire",
      description: "Répartition des budgets par secteur",
      type: "chart",
      chartType: "pie",
      chartData: [
        { name: "BTP", value: 42, change: 0 },
        { name: "Mines", value: 25, change: 0 },
        { name: "Énergie", value: 18, change: 0 },
        { name: "Santé", value: 8, change: 0 },
        { name: "Autres", value: 7, change: 0 },
      ],
      data: [],
    });
  }

  if (sections.includes("regional_analysis")) {
    allSections.push({
      id: "regional_analysis",
      title: "Analyse régionale",
      description: "Répartition géographique",
      type: "chart",
      chartType: "bar",
      chartData: REGIONS.map(r => ({ name: r, value: randomBetween(15, 130), change: randomBetween(-5, 15) })),
      data: [],
    });
  }

  if (sections.includes("sector_analysis")) {
    allSections.push({
      id: "sector_analysis",
      title: "Analyse sectorielle",
      description: "Performance par secteur",
      type: "table",
      columns: [
        { key: "sector", label: "Secteur" },
        { key: "tenders", label: "AO" },
        { key: "avgScore", label: "Score moyen" },
        { key: "winRate", label: "Taux réussite" },
      ],
      data: SECTORS.slice(0, 6).map(s => ({
        sector: s,
        tenders: randomBetween(5, 50).toString(),
        avgScore: `${randomBetween(55, 85)}/100`,
        winRate: `${randomBetween(10, 45)}%`,
      })),
    });
  }

  return {
    title: "Rapport personnalisé",
    subtitle: `Rapport sur mesure — ${new Date(dateRange.from).toLocaleDateString("fr-FR")} au ${new Date(dateRange.to).toLocaleDateString("fr-FR")}`,
    dateRange,
    generatedAt: new Date().toISOString(),
    executiveSummary: "Ce rapport personnalisé compile les sections sélectionnées pour une analyse ciblée de votre activité de veille des appels d'offres en Guinée.",
    keyMetrics: [
      { label: "Sections incluses", value: sections.length.toString(), change: 0, trend: "stable" },
      { label: "AO analysés", value: "117", change: 12, trend: "up" },
      { label: "Score global", value: "72/100", change: 3, trend: "up" },
    ],
    sections: allSections,
    recommendations: [
      { id: "r1", priority: "immediate", title: "Consulter le détail complet", description: "Approfondir les sections les plus pertinentes identifiées dans ce rapport.", impact: "Meilleure prise de décision" },
      { id: "r2", priority: "court_terme", title: "Partager avec l'équipe", description: "Distribuer ce rapport aux membres concernés de votre organisation.", impact: "Alignement stratégique" },
    ],
  };
}

// ===== Main Functions =====

export function getReportTemplates(): ReportTemplate[] {
  return REPORT_TEMPLATES;
}

export function generateReport(templateId: string, parameters: Record<string, unknown> = {}): GeneratedReport {
  const template = REPORT_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template de rapport introuvable : ${templateId}`);
  }

  let data: ReportData;

  switch (templateId) {
    case "weekly":
      data = generateWeeklyReport(parameters);
      break;
    case "sector":
      data = generateSectorReport(parameters);
      break;
    case "performance":
      data = generatePerformanceReport(parameters);
      break;
    case "regional":
      data = generateRegionalReport(parameters);
      break;
    case "competitive":
      data = generateCompetitiveReport(parameters);
      break;
    case "custom":
      data = generateCustomReport(parameters);
      break;
    default:
      data = generateWeeklyReport(parameters);
  }

  return {
    id: `rpt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    templateId,
    templateName: template.name,
    data,
    parameters,
  };
}

export function getReportPreview(templateId: string): { title: string; description: string; metricsCount: number; sectionsCount: number } {
  const template = REPORT_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template de rapport introuvable : ${templateId}`);
  }

  return {
    title: template.name,
    description: template.description,
    metricsCount: templateId === "custom" ? 3 : 6,
    sectionsCount: template.sections.length,
  };
}

export function exportReportAsPDF(report: GeneratedReport): string {
  const { data } = report;
  let html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>${data.title} — TenderFlow Guinea</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; color: #1a1a2e; }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #1e40af; margin: 0; }
    .header p { color: #6b7280; margin: 4px 0; }
    .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0; }
    .metric { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
    .metric .label { font-size: 12px; color: #6b7280; }
    .metric .value { font-size: 24px; font-weight: 700; color: #1e40af; }
    .metric .change { font-size: 11px; }
    .change.positive { color: #059669; }
    .change.negative { color: #dc2626; }
    .section { margin: 25px 0; }
    .section h2 { color: #1e40af; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 8px 12px; border: 1px solid #e2e8f0; font-weight: 600; }
    td { padding: 8px 12px; border: 1px solid #e2e8f0; }
    .recommendation { background: #fefce8; border-left: 4px solid #f59e0b; padding: 12px; margin: 8px 0; border-radius: 0 8px 8px 0; }
    .recommendation h3 { margin: 0 0 4px; font-size: 14px; }
    .recommendation p { margin: 0; font-size: 12px; color: #6b7280; }
    .priority-immediate { border-left-color: #dc2626; background: #fef2f2; }
    .priority-court_terme { border-left-color: #f59e0b; background: #fefce8; }
    .priority-moyen_terme { border-left-color: #2563eb; background: #eff6ff; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 15px; font-size: 11px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${data.title}</h1>
    <p>${data.subtitle}</p>
    <p>Généré le ${new Date(data.generatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
  </div>
  
  <h2>Résumé exécutif</h2>
  <p>${data.executiveSummary}</p>
  
  <div class="metrics">
    ${data.keyMetrics.map(m => `
    <div class="metric">
      <div class="label">${m.label}</div>
      <div class="value">${m.value}</div>
      <div class="change ${m.change >= 0 ? "positive" : "negative"}">${m.change >= 0 ? "↑" : "↓"} ${Math.abs(m.change)}%</div>
    </div>`).join("")}
  </div>
  
  ${data.sections.map(section => `
  <div class="section">
    <h2>${section.title}</h2>
    <p>${section.description}</p>
    ${section.type === "table" && section.columns && section.data.length > 0 ? `
    <table>
      <thead><tr>${section.columns.map(c => `<th>${c.label}</th>`).join("")}</tr></thead>
      <tbody>${section.data.map(row => `<tr>${section.columns!.map(c => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>` : ""}
    ${section.type === "chart" && section.chartData ? `
    <table>
      <thead><tr><th>Élément</th><th>Valeur</th><th> Variation</th></tr></thead>
      <tbody>${section.chartData.map(d => `<tr><td>${d.name}</td><td>${d.value}</td><td class="${(d.change ?? 0) >= 0 ? "positive" : "negative"}">${(d.change ?? 0) >= 0 ? "+" : ""}${d.change ?? 0}%</td></tr>`).join("")}</tbody>
    </table>` : ""}
  </div>`).join("")}
  
  <h2>Recommandations</h2>
  ${data.recommendations.map(r => `
  <div class="recommendation priority-${r.priority}">
    <h3>[${r.priority.replace("_", " ")}] ${r.title}</h3>
    <p>${r.description}</p>
    <p><strong>Impact :</strong> ${r.impact}</p>
  </div>`).join("")}
  
  <div class="footer">
    <p>TenderFlow Guinea — Rapport généré automatiquement — ${new Date().toLocaleDateString("fr-FR")}</p>
  </div>
</body>
</html>`;
  return html;
}

export function exportReportAsCSV(report: GeneratedReport): string {
  const { data } = report;
  const lines: string[] = [];

  // Header
  lines.push(`Rapport: ${data.title}`);
  lines.push(`Sous-titre: ${data.subtitle}`);
  lines.push(`Période: ${data.dateRange.from} - ${data.dateRange.to}`);
  lines.push(`Généré le: ${data.generatedAt}`);
  lines.push("");

  // Executive Summary
  lines.push("RÉSUMÉ EXÉCUTIF");
  lines.push(data.executiveSummary);
  lines.push("");

  // Key Metrics
  lines.push("INDICATEURS CLÉS");
  lines.push("Indicateur,Valeur,Variation,Tendance");
  data.keyMetrics.forEach(m => {
    lines.push(`"${m.label}","${m.value}",${m.change},${m.trend}`);
  });
  lines.push("");

  // Sections with tables
  data.sections.forEach(section => {
    if (section.type === "table" && section.columns && section.data.length > 0) {
      lines.push(section.title.toUpperCase());
      lines.push(section.columns.map(c => `"${c.label}"`).join(","));
      section.data.forEach(row => {
        lines.push(section.columns!.map(c => `"${row[c.key] ?? ""}"`).join(","));
      });
      lines.push("");
    }
    if (section.type === "chart" && section.chartData) {
      lines.push(section.title.toUpperCase());
      lines.push("Élément,Valeur,Variation");
      section.chartData.forEach(d => {
        lines.push(`"${d.name}",${d.value},${d.change ?? 0}`);
      });
      lines.push("");
    }
  });

  // Recommendations
  lines.push("RECOMMANDATIONS");
  lines.push("Priorité,Titre,Description,Impact");
  data.recommendations.forEach(r => {
    lines.push(`"${r.priority}","${r.title}","${r.description}","${r.impact}"`);
  });

  // BOM for Excel UTF-8
  return "\uFEFF" + lines.join("\n");
}

export function exportReportAsJSON(report: GeneratedReport): string {
  return JSON.stringify(report, null, 2);
}

// ===== Mock Report History =====

export interface ReportHistoryEntry {
  id: string;
  templateId: string;
  templateName: string;
  generatedAt: string;
  parameters: Record<string, unknown>;
  title: string;
}

export function getReportHistory(): ReportHistoryEntry[] {
  return [
    {
      id: "rpt-001",
      templateId: "weekly",
      templateName: "Rapport hebdomadaire",
      generatedAt: "2026-04-14T09:30:00Z",
      parameters: { date_range: "last_week" },
      title: "Semaine 15 — Avril 2026",
    },
    {
      id: "rpt-002",
      templateId: "sector",
      templateName: "Analyse sectorielle",
      generatedAt: "2026-04-10T14:15:00Z",
      parameters: { sector: "BTP & Infrastructures", date_range: "last_3_months" },
      title: "BTP & Infrastructures — T1 2026",
    },
    {
      id: "rpt-003",
      templateId: "performance",
      templateName: "Rapport de performance",
      generatedAt: "2026-04-01T08:00:00Z",
      parameters: { date_range: "last_quarter" },
      title: "Performance T1 2026",
    },
    {
      id: "rpt-004",
      templateName: "Rapport régional",
      templateId: "regional",
      generatedAt: "2026-03-28T11:45:00Z",
      parameters: { region: "all", date_range: "last_month" },
      title: "Toutes les régions — Mars 2026",
    },
    {
      id: "rpt-005",
      templateId: "competitive",
      templateName: "Analyse concurrentielle",
      generatedAt: "2026-03-15T16:20:00Z",
      parameters: { date_range: "last_6_months" },
      title: "Concurrence — H2 2025 / H1 2026",
    },
  ];
}

// ===== Utility Functions =====

export const priorityLabels: Record<string, string> = {
  immediate: "Immédiat",
  court_terme: "Court terme",
  moyen_terme: "Moyen terme",
};

export const priorityColors: Record<string, string> = {
  immediate: "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/20 dark:border-red-900/40",
  court_terme: "text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20 dark:border-amber-900/40",
  moyen_terme: "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20 dark:border-blue-900/40",
};

export const categoryLabels: Record<string, string> = {
  operationnel: "Opérationnel",
  strategique: "Stratégique",
  personnalise: "Personnalisé",
};

export const categoryColors: Record<string, string> = {
  operationnel: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  strategique: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  personnalise: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export const trendIcons: Record<string, { icon: string; color: string }> = {
  up: { icon: "↑", color: "text-emerald-600 dark:text-emerald-400" },
  down: { icon: "↓", color: "text-red-600 dark:text-red-400" },
  stable: { icon: "→", color: "text-muted-foreground" },
};
