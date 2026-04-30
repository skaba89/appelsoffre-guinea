// ─── TenderFlow Guinea — Moteur de Scoring ML Avancé ─────────────────────────
//
// Système d'évaluation multi-critères pour les appels d'offres en Guinée.
// Chaque critère est pondéré et évalué sur une échelle de 0 à 100.
// Le moteur produit un score composite avec une recommandation GO/NO-GO.

// ===== Types et Interfaces =====

export type ConfidenceLevel = "high" | "medium" | "low";

export type Recommendation = "go" | "go_conditional" | "no_go";

export type RiskSeverity = "critical" | "high" | "medium" | "low";

export interface CriterionScore {
  /** Identifiant du critère */
  id: string;
  /** Libellé affichable du critère */
  label: string;
  /** Score du critère (0-100) */
  score: number;
  /** Poids du critère dans le score composite (0-1, somme = 1) */
  weight: number;
  /** Explication détaillée du score */
  explanation: string;
  /** Icône suggérée (nom Lucide) */
  icon: string;
}

export interface RiskFactor {
  /** Identifiant du risque */
  id: string;
  /** Description du risque */
  description: string;
  /** Sévérité du risque */
  severity: RiskSeverity;
  /** Catégorie du risque */
  category: "financial" | "technical" | "regulatory" | "operational" | "competitive";
  /** Impact estimé sur le score (-0 à -30) */
  impact: number;
}

export interface StrategicRecommendation {
  /** Titre de la recommandation */
  title: string;
  /** Description détaillée */
  description: string;
  /** Priorité d'action */
  priority: "immediate" | "short_term" | "medium_term";
  /** Impact attendu sur le score */
  expectedImpact: number;
}

export interface ScoringResult {
  /** Score composite pondéré (0-100) */
  compositeScore: number;
  /** Recommandation GO/NO-GO */
  recommendation: Recommendation;
  /** Niveau de confiance de l'évaluation */
  confidence: ConfidenceLevel;
  /** Scores détaillés par critère */
  criteria: CriterionScore[];
  /** Facteurs de risque identifiés */
  riskFactors: RiskFactor[];
  /** Recommandations stratégiques */
  strategicRecommendations: StrategicRecommendation[];
  /** Résumé exécutif en français */
  summary: string;
  /** Horodatage de l'évaluation */
  evaluatedAt: string;
}

// ===== Données de référence Guinée =====

/** Poids par défaut des critères de scoring */
const DEFAULT_WEIGHTS: Record<string, number> = {
  sector_alignment: 0.18,
  financial_capacity: 0.16,
  deadline_feasibility: 0.12,
  competition_level: 0.12,
  compliance_requirements: 0.14,
  geographic_advantage: 0.10,
  team_expertise: 0.10,
  past_performance: 0.08,
};

/** Correspondance secteurs → compétences prioritaires en Guinée */
const SECTOR_PROFILES: Record<string, {
  baseScore: number;
  competitionMultiplier: number;
  keyRegions: string[];
}> = {
  "BTP": {
    baseScore: 72,
    competitionMultiplier: 1.3,
    keyRegions: ["Conakry", "Kankan", "Boké"],
  },
  "Mines": {
    baseScore: 65,
    competitionMultiplier: 1.5,
    keyRegions: ["Boké", "Kindia", "Nzérékoré"],
  },
  "IT / Digital": {
    baseScore: 80,
    competitionMultiplier: 0.8,
    keyRegions: ["Conakry"],
  },
  "Santé": {
    baseScore: 68,
    competitionMultiplier: 1.1,
    keyRegions: ["Conakry", "Nzérékoré"],
  },
  "Énergie": {
    baseScore: 70,
    competitionMultiplier: 1.2,
    keyRegions: ["Conakry", "Kindia", "Boké"],
  },
  "Éducation": {
    baseScore: 65,
    competitionMultiplier: 0.9,
    keyRegions: ["Conakry", "Kankan", "Labé"],
  },
  "Agriculture": {
    baseScore: 55,
    competitionMultiplier: 1.0,
    keyRegions: ["Nzérékoré", "Kankan", "Faranah"],
  },
  "Conseil": {
    baseScore: 75,
    competitionMultiplier: 0.7,
    keyRegions: ["Conakry"],
  },
  "Finance": {
    baseScore: 72,
    competitionMultiplier: 1.0,
    keyRegions: ["Conakry"],
  },
  "Eau / Assainissement": {
    baseScore: 60,
    competitionMultiplier: 1.4,
    keyRegions: ["Conakry", "Kindia"],
  },
  "Télécom": {
    baseScore: 62,
    competitionMultiplier: 1.6,
    keyRegions: ["Conakry", "National"],
  },
  "Sécurité": {
    baseScore: 45,
    competitionMultiplier: 0.6,
    keyRegions: ["Conakry", "Kankan"],
  },
  "Industrie": {
    baseScore: 58,
    competitionMultiplier: 1.2,
    keyRegions: ["Conakry", "Boké"],
  },
  "Logistique": {
    baseScore: 55,
    competitionMultiplier: 1.1,
    keyRegions: ["Conakry", "Boké", "Kankan"],
  },
  "Fournitures": {
    baseScore: 50,
    competitionMultiplier: 0.8,
    keyRegions: ["Conakry"],
  },
  "Maintenance": {
    baseScore: 60,
    competitionMultiplier: 0.9,
    keyRegions: ["Conakry", "Kindia", "Boké"],
  },
};

/** Seuils budgétaires en GNF pour évaluer la capacité financière */
const BUDGET_THRESHOLDS = {
  low: 2_000_000_000,      // < 2 milliards GNF
  medium: 10_000_000_000,  // 2-10 milliards GNF
  high: 30_000_000_000,    // 10-30 milliards GNF
  very_high: 30_000_000_000, // > 30 milliards GNF
};

/** Données de performance historique simulées */
const PAST_PERFORMANCE_DATA: Record<string, { winRate: number; avgDeliveryScore: number }> = {
  "BTP": { winRate: 0.35, avgDeliveryScore: 72 },
  "Mines": { winRate: 0.20, avgDeliveryScore: 65 },
  "IT / Digital": { winRate: 0.55, avgDeliveryScore: 85 },
  "Santé": { winRate: 0.30, avgDeliveryScore: 70 },
  "Énergie": { winRate: 0.40, avgDeliveryScore: 75 },
  "Éducation": { winRate: 0.45, avgDeliveryScore: 78 },
  "Conseil": { winRate: 0.60, avgDeliveryScore: 88 },
  "Finance": { winRate: 0.50, avgDeliveryScore: 82 },
};

// ===== Interface d'entrée du tender =====

export interface TenderInput {
  /** Identifiant du tender */
  id: string;
  /** Secteur d'activité */
  sector: string;
  /** Région géographique */
  region: string;
  /** Type d'appel d'offres (national/international) */
  tenderType: string;
  /** Date limite de soumission (ISO) */
  deadlineDate: string;
  /** Budget minimum en GNF */
  budgetMin: number;
  /** Budget maximum en GNF */
  budgetMax: number;
  /** Autorité publiante */
  publishingAuthority: string;
  /** Score de priorité existant (0-1) */
  priorityScore?: number;
  /** Score de compatibilité existant (0-1) */
  compatibilityScore?: number;
  /** Score de faisabilité existant (0-1) */
  feasibilityScore?: number;
  /** Score de probabilité de gain existant (0-1) */
  winProbabilityScore?: number;
  /** Recommandation stratégique existante */
  strategyRecommendation?: string;
}

// ===== Fonctions utilitaires de scoring =====

/** Génère un bruit aléatoire borné pour simuler la variabilité ML */
function mlNoise(base: number, amplitude: number = 5): number {
  return base + (Math.random() - 0.5) * 2 * amplitude;
}

/** Clamp une valeur entre min et max */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Calcule le nombre de jours restants avant la date limite */
function daysRemaining(deadlineDate: string): number {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  return Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ===== Évaluateurs de critères =====

/**
 * Critère 1 : Alignement sectoriel
 * Évalue l'adéquation entre le secteur du tender et les compétences de l'entreprise.
 */
function evaluateSectorAlignment(tender: TenderInput): CriterionScore {
  const profile = SECTOR_PROFILES[tender.sector] || {
    baseScore: 50,
    competitionMultiplier: 1.0,
    keyRegions: ["Conakry"],
  };

  let score = profile.baseScore;

  // Bonus si l'entreprise a déjà des scores élevés dans ce secteur
  if (tender.compatibilityScore && tender.compatibilityScore > 0.7) {
    score += 15;
  } else if (tender.compatibilityScore && tender.compatibilityScore > 0.5) {
    score += 8;
  }

  // Ajustement pour le type d'AO
  if (tender.tenderType === "national") {
    score += 5; // Avantage pour les AO nationaux
  }

  score = clamp(mlNoise(score, 4));

  const explanations: Record<string, string> = {
    "BTP": "Le secteur BTP en Guinée est porteur mais très concurrentiel. Les grands projets d'infrastructure (routes, ponts) nécessitent une expérience avérée en Afrique de l'Ouest.",
    "Mines": "Le secteur minier guinéen (bauxite, fer, or) attire de nombreux acteurs internationaux. La maîtrise des normes environnementales et sociales est déterminante.",
    "IT / Digital": "Fort potentiel dans le numérique avec les projets e-gouvernement et la transformation digitale. Moins de concurrence locale, avantage technique significatif.",
    "Santé": "Secteur soutenu par les bailleurs internationaux. Les marchés de fourniture médicale et d'équipement hospitalier sont réguliers mais exigent des certifications strictes.",
    "Énergie": "Transition énergétique en cours avec le plan d'électrification rurale. Les projets solaires et hydrauliques offrent de bonnes opportunités.",
  };

  return {
    id: "sector_alignment",
    label: "Alignement sectoriel",
    score,
    weight: DEFAULT_WEIGHTS.sector_alignment,
    explanation: explanations[tender.sector] || `Le secteur ${tender.sector} présente un potentiel modéré en Guinée. L'évaluation tient compte de la dynamique du marché et de la concurrence locale.`,
    icon: "Target",
  };
}

/**
 * Critère 2 : Capacité financière
 * Évalue si l'entreprise peut supporter les exigences financières du marché.
 */
function evaluateFinancialCapacity(tender: TenderInput): CriterionScore {
  const avgBudget = (tender.budgetMin + tender.budgetMax) / 2;
  let score = 70; // Base : capacité financière moyenne

  // Ajustement selon la taille du budget
  if (avgBudget < BUDGET_THRESHOLDS.low) {
    score = 88; // Petit marché → facilement finançable
  } else if (avgBudget < BUDGET_THRESHOLDS.medium) {
    score = 75;
  } else if (avgBudget < BUDGET_THRESHOLDS.high) {
    score = 58;
  } else {
    score = 40; // Très grand marché → nécessite des garanties importantes
  }

  // Bonus pour les AO nationaux (cautionnement moins élevé)
  if (tender.tenderType === "national") {
    score += 8;
  }

  // Malus si l'écart budgétaire est très grand (incertitude)
  const budgetSpread = tender.budgetMax - tender.budgetMin;
  if (budgetSpread > tender.budgetMin * 0.8) {
    score -= 10;
  }

  score = clamp(mlNoise(score, 5));

  let explanation: string;
  if (score >= 70) {
    explanation = `Le budget estimé (${formatBudgetRange(tender.budgetMin, tender.budgetMax)} GNF) est compatible avec la capacité financière de l'entreprise. Les garanties bancaires requises restent dans des limites abordables.`;
  } else if (score >= 50) {
    explanation = `Le budget de ce marché (${formatBudgetRange(tender.budgetMin, tender.budgetMax)} GNF) nécessite une mobilisation financière significative. Un partenariat ou une ligne de crédit dédiée peut être nécessaire.`;
  } else {
    explanation = `Ce marché de ${formatBudgetRange(tender.budgetMin, tender.budgetMax)} GNF dépasse la capacité financière habituelle. Des garanties bancaires substantielles et éventuellement un consortium sont indispensables.`;
  }

  return {
    id: "financial_capacity",
    label: "Capacité financière",
    score,
    weight: DEFAULT_WEIGHTS.financial_capacity,
    explanation,
    icon: "Banknote",
  };
}

/**
 * Critère 3 : Faisabilité du délai
 * Évalue si les délais de soumission et de réalisation sont réalistes.
 */
function evaluateDeadlineFeasibility(tender: TenderInput): CriterionScore {
  const days = daysRemaining(tender.deadlineDate);
  let score = 50;

  if (days < 0) {
    score = 5; // Date limite dépassée
  } else if (days < 7) {
    score = 25; // Délai critique
  } else if (days < 15) {
    score = 45; // Délai serré
  } else if (days < 30) {
    score = 65; // Délai correct
  } else if (days < 60) {
    score = 80; // Bon délai
  } else {
    score = 90; // Délai confortable
  }

  // Ajustement : les AO internationaux nécessitent plus de préparation
  if (tender.tenderType === "international") {
    score -= 10;
  }

  // Les grands marchés BTP nécessitent plus de temps
  if (tender.sector === "BTP" && days < 45) {
    score -= 15;
  }

  score = clamp(mlNoise(score, 3));

  let explanation: string;
  if (days < 0) {
    explanation = "La date limite de soumission est dépassée. Ce marché n'est plus accessible.";
  } else if (days < 7) {
    explanation = `Délai critique : seulement ${days} jours restants. La préparation d'une offre complète est très improbable dans ce délai, sauf si des éléments sont déjà disponibles.`;
  } else if (days < 15) {
    explanation = `Délai serré avec ${days} jours restants. Une mobilisation immédiate des équipes est nécessaire. Priorisation des documents essentiels requise.`;
  } else {
    explanation = `Délai de ${days} jours restants, ${days > 30 ? "confortable" : "correct"} pour préparer une offre de qualité. ${tender.tenderType === "international" ? "Compte tenu du caractère international, un délai supplémentaire pour les partenariats est recommandé." : "Le délai permet une préparation approfondie."}`;
  }

  return {
    id: "deadline_feasibility",
    label: "Faisabilité du délai",
    score,
    weight: DEFAULT_WEIGHTS.deadline_feasibility,
    explanation,
    icon: "Clock",
  };
}

/**
 * Critère 4 : Niveau de concurrence
 * Évalue l'intensité concurrentielle attendue sur ce marché.
 */
function evaluateCompetitionLevel(tender: TenderInput): CriterionScore {
  const profile = SECTOR_PROFILES[tender.sector] || {
    baseScore: 50,
    competitionMultiplier: 1.0,
    keyRegions: [],
  };

  // Score inversé : plus la concurrence est forte, plus le score est bas
  let score = 85 / profile.competitionMultiplier;

  // Les AO internationaux attirent plus de concurrents
  if (tender.tenderType === "international") {
    score -= 15;
  }

  // Les grands budgets attirent plus de concurrents
  const avgBudget = (tender.budgetMin + tender.budgetMax) / 2;
  if (avgBudget > BUDGET_THRESHOLDS.high) {
    score -= 10;
  }

  // Les AO financés par des bailleurs internationaux attirent plus de monde
  const internationalFunders = ["Banque Mondiale", "BAD", "FMI", "Union Européenne", "BAD", "FIDA"];
  if (internationalFunders.some(f => tender.publishingAuthority.includes(f))) {
    score -= 8;
  }

  // Les AO nationaux dans les régions éloignées ont moins de concurrence
  if (tender.tenderType === "national" && !["Conakry"].includes(tender.region)) {
    score += 10;
  }

  score = clamp(mlNoise(score, 6));

  let explanation: string;
  if (score >= 70) {
    explanation = `Concurrence modérée dans le secteur ${tender.sector}. ${tender.tenderType === "national" ? "L'appel d'offres national limite la concurrence internationale." : "L'AO international attire des concurrents régionaux et internationaux."} Positionnement favorable possible.`;
  } else if (score >= 50) {
    explanation = `Concurrence significative attendue sur ce marché. Le secteur ${tender.sector} en Guinée attire plusieurs acteurs qualifiés. Une différenciation technique forte sera nécessaire.`;
  } else {
    explanation = `Forte concurrence prévue. Le secteur ${tender.sector} avec un budget de cette envergure attirera des acteurs internationaux expérimentés. Un consortium ou un avantage technique décisif est indispensable.`;
  }

  return {
    id: "competition_level",
    label: "Niveau de concurrence",
    score,
    weight: DEFAULT_WEIGHTS.competition_level,
    explanation,
    icon: "Swords",
  };
}

/**
 * Critère 5 : Exigences de conformité
 * Évalue la complexité des exigences réglementaires et administratives.
 */
function evaluateComplianceRequirements(tender: TenderInput): CriterionScore {
  let score = 65;

  // Les AO internationaux ont plus d'exigences
  if (tender.tenderType === "international") {
    score -= 12;
  }

  // Certains secteurs ont des exigences réglementaires spécifiques
  const highComplianceSectors: Record<string, number> = {
    "Mines": -15,
    "Santé": -12,
    "IT / Digital": -5,
    "BTP": -10,
    "Énergie": -8,
    "Finance": -15,
    "Eau / Assainissement": -8,
  };
  score += (highComplianceSectors[tender.sector] || 0) * -1;

  // Les marchés avec des bailleurs internationaux exigent plus de conformité
  const internationalFunders = ["Banque Mondiale", "BAD", "FIDA"];
  if (internationalFunders.some(f => tender.publishingAuthority.includes(f))) {
    score -= 8;
  }

  // Les marchés de l'administration guinéenne nécessitent des documents spécifiques
  if (tender.publishingAuthority.includes("Ministère") || tender.publishingAuthority.includes("Direction")) {
    score -= 5;
  }

  score = clamp(mlNoise(score, 4));

  let explanation: string;
  if (score >= 70) {
    explanation = `Les exigences de conformité sont standard pour le secteur ${tender.sector}. Les documents administratifs usuels (NIF, RCS, attestations) sont suffisants. Aucune certification spéciale requise.`;
  } else if (score >= 50) {
    explanation = `Des exigences de conformité avancées sont attendues. ${tender.tenderType === "international" ? "Les normes internationales (ISO, IFC) seront probablement requises." : "Des attestations spécifiques au contexte guinéen seront nécessaires."} Prévoir un délai pour la constitution du dossier administratif.`;
  } else {
    explanation = `Exigences de conformité élevées. Le secteur ${tender.sector} impose des certifications strictes (environnement, sécurité, qualité). L'obtention de ces certifications peut prendre plusieurs mois. Anticipez ou recherchez des partenaires certifiés.`;
  }

  return {
    id: "compliance_requirements",
    label: "Exigences de conformité",
    score,
    weight: DEFAULT_WEIGHTS.compliance_requirements,
    explanation,
    icon: "ShieldCheck",
  };
}

/**
 * Critère 6 : Avantage géographique
 * Évalue l'avantage lié à la localisation et à la présence dans la région.
 */
function evaluateGeographicAdvantage(tender: TenderInput): CriterionScore {
  const profile = SECTOR_PROFILES[tender.sector] || {
    baseScore: 50,
    competitionMultiplier: 1.0,
    keyRegions: ["Conakry"],
  };

  let score = 55;

  // Bonus si la région est un hub du secteur
  if (profile.keyRegions.includes(tender.region)) {
    score += 20;
  }

  // Conakry : présence locale forte
  if (tender.region === "Conakry") {
    score += 12;
  }

  // National : couverture large mais pas d'avantage local spécifique
  if (tender.region === "National") {
    score += 5;
  }

  // Régions éloignées : logistique plus complexe
  const remoteRegions = ["Nzérékoré", "Labé", "Faranah", "Mamou"];
  if (remoteRegions.includes(tender.region)) {
    score -= 8;
  }

  score = clamp(mlNoise(score, 5));

  let explanation: string;
  if (score >= 75) {
    explanation = `Forte présence dans la région ${tender.region}, hub du secteur ${tender.sector}. L'accès aux sites, la logistique et les relations locales constituent un avantage compétitif significatif.`;
  } else if (score >= 55) {
    explanation = `Présence établie dans la région ${tender.region}. La logistique est gérable mais nécessite une coordination pour les zones éloignées de Conakry.`;
  } else {
    explanation = `La région ${tender.region} est éloignée des centres opérationnels. Les coûts logistiques et le temps de déplacement augmentent significativement. Un partenaire local est fortement recommandé.`;
  }

  return {
    id: "geographic_advantage",
    label: "Avantage géographique",
    score,
    weight: DEFAULT_WEIGHTS.geographic_advantage,
    explanation,
    icon: "MapPin",
  };
}

/**
 * Critère 7 : Expertise de l'équipe
 * Évalue si l'entreprise dispose des compétences techniques nécessaires.
 */
function evaluateTeamExpertise(tender: TenderInput): CriterionScore {
  // Base : niveau d'expertise estimé par secteur
  const expertiseBySector: Record<string, number> = {
    "IT / Digital": 82,
    "Conseil": 80,
    "Finance": 75,
    "Énergie": 68,
    "Éducation": 65,
    "Santé": 60,
    "BTP": 55,
    "Mines": 45,
    "Agriculture": 40,
    "Télécom": 55,
    "Eau / Assainissement": 50,
    "Sécurité": 35,
    "Industrie": 52,
    "Logistique": 48,
    "Fournitures": 42,
    "Maintenance": 55,
  };

  let score = expertiseBySector[tender.sector] || 50;

  // Bonus si le score de compatibilité existant est élevé
  if (tender.compatibilityScore && tender.compatibilityScore > 0.8) {
    score += 12;
  } else if (tender.compatibilityScore && tender.compatibilityScore > 0.6) {
    score += 6;
  }

  // Les AO internationaux exigent des profils plus pointus
  if (tender.tenderType === "international") {
    score -= 8;
  }

  score = clamp(mlNoise(score, 5));

  let explanation: string;
  if (score >= 75) {
    explanation = `L'équipe dispose des compétences clés pour le secteur ${tender.sector}. Les profils techniques et fonctionnels sont disponibles en interne. Un renforcement ciblé peut être envisagé pour les aspects spécifiques.`;
  } else if (score >= 55) {
    explanation = `Compétences partielles dans le secteur ${tender.sector}. Un renforcement de l'équipe est nécessaire, notamment par le recrutement de consultants spécialisés ou un partenariat technique.`;
  } else {
    explanation = `Expertise insuffisante dans le secteur ${tender.sector}. La mise en place d'un consortium avec un partenaire technique spécialisé est indispensable pour répondre de manière compétitive.`;
  }

  return {
    id: "team_expertise",
    label: "Expertise de l'équipe",
    score,
    weight: DEFAULT_WEIGHTS.team_expertise,
    explanation,
    icon: "Users",
  };
}

/**
 * Critère 8 : Performance passée
 * Évalue les résultats historiques de l'entreprise sur des marchés similaires.
 */
function evaluatePastPerformance(tender: TenderInput): CriterionScore {
  const performance = PAST_PERFORMANCE_DATA[tender.sector] || {
    winRate: 0.25,
    avgDeliveryScore: 60,
  };

  // Score basé sur le taux de victoire et la qualité de livraison
  let score = performance.winRate * 60 + performance.avgDeliveryScore * 0.4;

  // Bonus pour les marchés de l'autorité si déjà travaillé avec
  const knownAuthorities = ["Ministère", "Direction", "SOGUIPAMI", "AGUIPE"];
  if (knownAuthorities.some(a => tender.publishingAuthority.includes(a))) {
    score += 8;
  }

  // Malus pour les secteurs sans historique
  if (!PAST_PERFORMANCE_DATA[tender.sector]) {
    score -= 10;
  }

  score = clamp(mlNoise(score, 4));

  let explanation: string;
  if (score >= 70) {
    explanation = `Bon historique dans le secteur ${tender.sector} avec un taux de réussite de ${(performance.winRate * 100).toFixed(0)}%. Les références existantes constituent un atout majeur pour la crédibilité de l'offre.`;
  } else if (score >= 50) {
    explanation = `Historique modéré dans le secteur ${tender.sector}. Des références partielles sont disponibles mais il est recommandé de mettre en avant des expériences connexes pour renforcer la crédibilité.`;
  } else {
    explanation = `Peu ou pas d'historique dans le secteur ${tender.sector}. Il sera nécessaire de s'appuyer sur des partenaires avec des références solides ou de proposer des démonstrations de capacité.`;
  }

  return {
    id: "past_performance",
    label: "Performance passée",
    score,
    weight: DEFAULT_WEIGHTS.past_performance,
    explanation,
    icon: "Trophy",
  };
}

// ===== Génération des risques =====

function generateRiskFactors(tender: TenderInput, criteria: CriterionScore[]): RiskFactor[] {
  const risks: RiskFactor[] = [];

  // Risque financier si capacité financière faible
  const financialCriterion = criteria.find(c => c.id === "financial_capacity");
  if (financialCriterion && financialCriterion.score < 50) {
    risks.push({
      id: "risk_financial",
      description: "Risque de sous-capitalisation : les garanties financières requises dépassent la capacité actuelle de l'entreprise.",
      severity: "critical",
      category: "financial",
      impact: -20,
    });
  } else if (financialCriterion && financialCriterion.score < 65) {
    risks.push({
      id: "risk_financial_moderate",
      description: "Contrainte financière modérée : le montage financier nécessite des lignes de crédit ou des partenariats.",
      severity: "medium",
      category: "financial",
      impact: -10,
    });
  }

  // Risque de délai
  const deadlineCriterion = criteria.find(c => c.id === "deadline_feasibility");
  if (deadlineCriterion && deadlineCriterion.score < 40) {
    risks.push({
      id: "risk_deadline",
      description: "Délai de soumission insuffisant pour préparer une offre compétitive et complète.",
      severity: "high",
      category: "operational",
      impact: -15,
    });
  } else if (deadlineCriterion && deadlineCriterion.score < 60) {
    risks.push({
      id: "risk_deadline_moderate",
      description: "Délai serré nécessitant une mobilisation immédiate et priorisée des ressources.",
      severity: "medium",
      category: "operational",
      impact: -8,
    });
  }

  // Risque concurrentiel
  const competitionCriterion = criteria.find(c => c.id === "competition_level");
  if (competitionCriterion && competitionCriterion.score < 45) {
    risks.push({
      id: "risk_competition",
      description: "Concurrence internationale élevée : des acteurs majeurs sont susceptibles de soumettre des offres agressives.",
      severity: "high",
      category: "competitive",
      impact: -15,
    });
  }

  // Risque réglementaire
  const complianceCriterion = criteria.find(c => c.id === "compliance_requirements");
  if (complianceCriterion && complianceCriterion.score < 50) {
    risks.push({
      id: "risk_compliance",
      description: "Exigences réglementaires complexes pouvant entraîner des retards de qualification ou des risques de non-conformité.",
      severity: "high",
      category: "regulatory",
      impact: -12,
    });
  }

  // Risque technique
  const expertiseCriterion = criteria.find(c => c.id === "team_expertise");
  if (expertiseCriterion && expertiseCriterion.score < 45) {
    risks.push({
      id: "risk_technical",
      description: "Lacunes techniques identifiées dans l'équipe pour répondre aux spécifications du cahier des charges.",
      severity: "high",
      category: "technical",
      impact: -18,
    });
  } else if (expertiseCriterion && expertiseCriterion.score < 60) {
    risks.push({
      id: "risk_technical_moderate",
      description: "Compétences partielles : certains aspects techniques nécessitent un renforcement externe.",
      severity: "medium",
      category: "technical",
      impact: -8,
    });
  }

  // Risque géographique
  const geoCriterion = criteria.find(c => c.id === "geographic_advantage");
  if (geoCriterion && geoCriterion.score < 45) {
    risks.push({
      id: "risk_geographic",
      description: "Éloignement géographique augmentant les coûts logistiques et réduisant la réactivité opérationnelle.",
      severity: "medium",
      category: "operational",
      impact: -8,
    });
  }

  return risks;
}

// ===== Génération des recommandations stratégiques =====

function generateStrategicRecommendations(
  tender: TenderInput,
  criteria: CriterionScore[],
  risks: RiskFactor[]
): StrategicRecommendation[] {
  const recommendations: StrategicRecommendation[] = [];

  // Recommandation basée sur la capacité financière
  const financialCriterion = criteria.find(c => c.id === "financial_capacity");
  if (financialCriterion && financialCriterion.score < 60) {
    recommendations.push({
      title: "Constituer un consortium financier",
      description: "S'associer avec un partenaire financier ou bancaire pour renforcer la capacité de garantie. Envisager un consortium avec une entreprise locale ayant des garanties suffisantes.",
      priority: "immediate",
      expectedImpact: 15,
    });
  }

  // Recommandation basée sur l'expertise
  const expertiseCriterion = criteria.find(c => c.id === "team_expertise");
  if (expertiseCriterion && expertiseCriterion.score < 60) {
    recommendations.push({
      title: "Renforcer l'équipe technique",
      description: `Recruter des consultants spécialisés dans le secteur ${tender.sector} ou établir un partenariat technique avec un acteur expérimenté. Les CVs clés doivent être intégrés dès la phase de qualification.`,
      priority: "short_term",
      expectedImpact: 12,
    });
  }

  // Recommandation basée sur la conformité
  const complianceCriterion = criteria.find(c => c.id === "compliance_requirements");
  if (complianceCriterion && complianceCriterion.score < 55) {
    recommendations.push({
      title: "Anticiper les exigences réglementaires",
      description: "Lancer immédiatement les démarches de certification et de constitution du dossier administratif. Identifier les documents manquants et les délais d'obtention.",
      priority: "immediate",
      expectedImpact: 10,
    });
  }

  // Recommandation basée sur la concurrence
  const competitionCriterion = criteria.find(c => c.id === "competition_level");
  if (competitionCriterion && competitionCriterion.score < 55) {
    recommendations.push({
      title: "Différencier l'offre technique",
      description: "Développer un angle de différenciation fort : innovation technologique, approche ESG, transfert de compétences, ou partenariat local. Éviter la concurrence par les prix.",
      priority: "short_term",
      expectedImpact: 8,
    });
  }

  // Recommandation géographique
  const geoCriterion = criteria.find(c => c.id === "geographic_advantage");
  if (geoCriterion && geoCriterion.score < 50) {
    recommendations.push({
      title: "Établir un partenariat local",
      description: `S'associer avec une entreprise locale de la région ${tender.region} pour bénéficier de sa connaissance du terrain, de ses relations institutionnelles et de sa logistique.`,
      priority: "medium_term",
      expectedImpact: 10,
    });
  }

  // Recommandation sur la performance passée
  const performanceCriterion = criteria.find(c => c.id === "past_performance");
  if (performanceCriterion && performanceCriterion.score < 55) {
    recommendations.push({
      title: "Valoriser les références connexes",
      description: `Mettre en avant les expériences réussies dans des secteurs similaires ou dans le contexte ouest-africain. Les références de pays voisins (Mali, Sénégal, Côte d'Ivoire) sont valorisées.`,
      priority: "short_term",
      expectedImpact: 6,
    });
  }

  // Recommandation deadline
  const deadlineCriterion = criteria.find(c => c.id === "deadline_feasibility");
  if (deadlineCriterion && deadlineCriterion.score < 60) {
    recommendations.push({
      title: "Mobiliser une équipe dédiée",
      description: "Constituer immédiatement une cellule de réponse avec des ressources dédiées à temps plein. Prioriser les documents à forte valeur ajoutée (méthodologie, références).",
      priority: "immediate",
      expectedImpact: 8,
    });
  }

  return recommendations;
}

// ===== Calcul du score composite =====

function calculateCompositeScore(criteria: CriterionScore[]): number {
  let totalWeight = 0;
  let weightedSum = 0;

  for (const criterion of criteria) {
    weightedSum += criterion.score * criterion.weight;
    totalWeight += criterion.weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// ===== Détermination de la recommandation =====

function determineRecommendation(
  compositeScore: number,
  criteria: CriterionScore[],
  risks: RiskFactor[]
): Recommendation {
  const criticalRisks = risks.filter(r => r.severity === "critical");
  const highRisks = risks.filter(r => r.severity === "high");

  // Si un risque critique existe → NO-GO
  if (criticalRisks.length > 0) {
    return "no_go";
  }

  // Si 2+ risques élevés → NO-GO
  if (highRisks.length >= 2) {
    return "no_go";
  }

  // Score-based determination
  if (compositeScore >= 70) {
    return "go";
  } else if (compositeScore >= 50) {
    // Vérifier si les critères essentiels sont suffisants
    const essentialCriteria = criteria.filter(c =>
      ["sector_alignment", "financial_capacity", "team_expertise"].includes(c.id)
    );
    const essentialAvg = essentialCriteria.reduce((s, c) => s + c.score, 0) / essentialCriteria.length;

    if (essentialAvg >= 55 && highRisks.length === 0) {
      return "go_conditional";
    }
    return "go_conditional";
  } else {
    return "no_go";
  }
}

// ===== Détermination du niveau de confiance =====

function determineConfidence(criteria: CriterionScore[], tender: TenderInput): ConfidenceLevel {
  // Plus les scores sont extrêmes (proches de 0 ou 100), plus la confiance est élevée
  const scoreVariance = criteria.reduce((sum, c) => {
    const deviation = c.score - 50;
    return sum + deviation * deviation;
  }, 0) / criteria.length;

  const stdDev = Math.sqrt(scoreVariance);

  // Si les scores sont très dispersés → confiance faible
  if (stdDev > 25) {
    return "low";
  }

  // Si on a des scores existants du système → confiance plus élevée
  if (tender.compatibilityScore && tender.feasibilityScore && tender.winProbabilityScore) {
    return "high";
  }

  // Sinon, confiance moyenne
  return "medium";
}

// ===== Génération du résumé exécutif =====

function generateSummary(
  tender: TenderInput,
  compositeScore: number,
  recommendation: Recommendation,
  confidence: ConfidenceLevel,
  criteria: CriterionScore[],
  risks: RiskFactor[]
): string {
  const recLabel = recommendation === "go" ? "GO" : recommendation === "go_conditional" ? "GO SOUS CONDITIONS" : "NO GO";
  const confidenceLabel = confidence === "high" ? "élevée" : confidence === "medium" ? "moyenne" : "faible";

  const strongCriteria = criteria.filter(c => c.score >= 70).map(c => c.label.toLowerCase());
  const weakCriteria = criteria.filter(c => c.score < 45).map(c => c.label.toLowerCase());

  let summary = `Évaluation de l'appel d'offres "${tender.sector}" en ${tender.region} : score composite de ${compositeScore.toFixed(1)}/100 avec une confiance ${confidenceLabel}. `;
  summary += `Recommandation : ${recLabel}. `;

  if (strongCriteria.length > 0) {
    summary += `Points forts : ${strongCriteria.join(", ")}. `;
  }
  if (weakCriteria.length > 0) {
    summary += `Points de vigilance : ${weakCriteria.join(", ")}. `;
  }
  if (risks.length > 0) {
    const criticalAndHigh = risks.filter(r => r.severity === "critical" || r.severity === "high");
    if (criticalAndHigh.length > 0) {
      summary += `${criticalAndHigh.length} risque(s) majeur(s) identifié(s). `;
    }
  }

  return summary.trim();
}

// ===== Fonction utilitaire =====

function formatBudgetRange(min: number, max: number): string {
  const avgBillions = ((min + max) / 2) / 1_000_000_000;
  return avgBillions.toFixed(1);
}

// ===== Fonction principale : scoreTender =====

/**
 * Évalue un appel d'offres et produit un scoring complet.
 *
 * @param tender - Les données du tender à évaluer
 * @returns Un résultat de scoring complet avec recommandation
 *
 * @example
 * ```ts
 * const result = scoreTender({
 *   id: "t-001",
 *   sector: "BTP",
 *   region: "Kankan",
 *   tenderType: "international",
 *   deadlineDate: "2026-06-15",
 *   budgetMin: 15000000000,
 *   budgetMax: 25000000000,
 *   publishingAuthority: "Ministère des Travaux Publics",
 * });
 * console.log(result.recommendation); // "go" | "go_conditional" | "no_go"
 * console.log(result.compositeScore); // 62.4
 * ```
 */
export function scoreTender(tender: TenderInput): ScoringResult {
  // 1. Évaluer chaque critère
  const criteria: CriterionScore[] = [
    evaluateSectorAlignment(tender),
    evaluateFinancialCapacity(tender),
    evaluateDeadlineFeasibility(tender),
    evaluateCompetitionLevel(tender),
    evaluateComplianceRequirements(tender),
    evaluateGeographicAdvantage(tender),
    evaluateTeamExpertise(tender),
    evaluatePastPerformance(tender),
  ];

  // 2. Calculer le score composite pondéré
  const compositeScore = Math.round(calculateCompositeScore(criteria) * 10) / 10;

  // 3. Générer les facteurs de risque
  const riskFactors = generateRiskFactors(tender, criteria);

  // 4. Déterminer la recommandation
  const recommendation = determineRecommendation(compositeScore, criteria, riskFactors);

  // 5. Déterminer le niveau de confiance
  const confidence = determineConfidence(criteria, tender);

  // 6. Générer les recommandations stratégiques
  const strategicRecommendations = generateStrategicRecommendations(tender, criteria, riskFactors);

  // 7. Générer le résumé
  const summary = generateSummary(tender, compositeScore, recommendation, confidence, criteria, riskFactors);

  return {
    compositeScore,
    recommendation,
    confidence,
    criteria,
    riskFactors,
    strategicRecommendations,
    summary,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Récupère les labels français pour les niveaux de sévérité.
 */
export function severityLabel(severity: RiskSeverity): string {
  const labels: Record<RiskSeverity, string> = {
    critical: "Critique",
    high: "Élevé",
    medium: "Moyen",
    low: "Faible",
  };
  return labels[severity];
}

/**
 * Récupère les labels français pour les recommandations.
 */
export function recommendationLabel(rec: Recommendation): string {
  const labels: Record<Recommendation, string> = {
    go: "GO",
    go_conditional: "GO sous conditions",
    no_go: "NO GO",
  };
  return labels[rec];
}

/**
 * Récupère les labels français pour les niveaux de confiance.
 */
export function confidenceLabel(conf: ConfidenceLevel): string {
  const labels: Record<ConfidenceLevel, string> = {
    high: "Élevée",
    medium: "Moyenne",
    low: "Faible",
  };
  return labels[conf];
}

/**
 * Récupère les labels français pour les catégories de risque.
 */
export function riskCategoryLabel(category: RiskFactor["category"]): string {
  const labels: Record<string, string> = {
    financial: "Financier",
    technical: "Technique",
    regulatory: "Réglementaire",
    operational: "Opérationnel",
    competitive: "Concurrentiel",
  };
  return labels[category] || category;
}

/**
 * Récupère les labels français pour les priorités de recommandation.
 */
export function priorityLabel(priority: StrategicRecommendation["priority"]): string {
  const labels: Record<StrategicRecommendation["priority"], string> = {
    immediate: "Immédiate",
    short_term: "Court terme",
    medium_term: "Moyen terme",
  };
  return labels[priority];
}
