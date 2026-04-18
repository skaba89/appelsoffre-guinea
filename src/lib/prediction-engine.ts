// ─── TenderFlow Guinea — Moteur de Prédiction IA ──────────────────────────────
//
// Système de prédiction avancé pour les appels d'offres en Guinée.
// Utilise des modèles statistiques et des heuristiques adaptées au marché guinéen
// pour prévoir les probabilités de gain, les volumes sectoriels, les prix optimaux,
// les opportunités émergentes et les menaces concurrentielles.

// ===== Types et Interfaces =====

/** Niveau de menace concurrentielle */
export type ThreatLevel = "critique" | "élevé" | "modéré" | "faible";

/** Niveau de confiance de la prédiction */
export type PredictionConfidence = "high" | "medium" | "low";

/** Tendance sectorielle */
export type SectorTrend = "rising" | "stable" | "declining";

/** Prédiction de probabilité de gain pour un tender */
export interface WinProbability {
  /** Identifiant du tender */
  tenderId: string;
  /** Titre court du tender */
  tenderTitle: string;
  /** Secteur d'activité */
  sector: string;
  /** Probabilité de gain estimée (0-100) */
  winPercent: number;
  /** Intervalle de confiance bas (0-100) */
  confidenceLow: number;
  /** Intervalle de confiance haut (0-100) */
  confidenceHigh: number;
  /** Niveau de confiance de la prédiction */
  confidence: PredictionConfidence;
  /** Facteurs clés influençant la prédiction */
  keyFactors: string[];
  /** Recommandation associée */
  recommendation: string;
}

/** Prévision de volume sectoriel pour le prochain trimestre */
export interface TenderForecast {
  /** Secteur d'activité */
  sector: string;
  /** Volume estimé d'appels d'offres */
  predictedVolume: number;
  /** Borne basse de l'intervalle de confiance */
  volumeLow: number;
  /** Borne haute de l'intervalle de confiance */
  volumeHigh: number;
  /** Valeur totale estimée en milliards GNF */
  predictedValueBn: number;
  /** Tendance par rapport au trimestre précédent */
  trend: SectorTrend;
  /** Variation en pourcentage par rapport au trimestre précédent */
  trendPercent: number;
  /** Données mensuelles pour le graphique de prévision */
  monthlyData: ForecastMonth[];
}

/** Données mensuelles de prévision */
export interface ForecastMonth {
  /** Mois (ex: "Avr", "Mai", "Jun") */
  month: string;
  /** Volume prédit */
  predicted: number;
  /** Borne basse de l'intervalle de confiance */
  low: number;
  /** Borne haute de l'intervalle de confiance */
  high: number;
  /** Volume réel (si disponible) */
  actual?: number;
}

/** Recommandation de prix optimal */
export interface OptimalPricing {
  /** Secteur d'activité */
  sector: string;
  /** Prix plancher recommandé en M GNF */
  priceFloor: number;
  /** Prix optimal recommandé en M GNF */
  priceOptimal: number;
  /** Prix plafond recommandé en M GNF */
  priceCeiling: number;
  /** Marge estimée au prix optimal (%) */
  estimatedMargin: number;
  /** Compétitivité du prix par rapport au marché (0-100) */
  competitivenessScore: number;
  /** Conseil stratégique */
  advice: string;
}

/** Opportunité émergente identifiée */
export interface EmergingOpportunity {
  /** Secteur d'activité */
  sector: string;
  /** Score d'opportunité (0-100) */
  opportunityScore: number;
  /** Tendance du secteur */
  trend: SectorTrend;
  /** Intensité de la tendance (%) */
  trendIntensity: number;
  /** Raisons de l'émergence */
  reasons: string[];
  /** Régions clés pour ce secteur en Guinée */
  keyRegions: string[];
  /** Niveau de préparation requis */
  preparationLevel: "immédiat" | "court_terme" | "moyen_terme";
  /** Score de compatibilité avec le profil entreprise (0-100) */
  compatibilityScore: number;
}

/** Analyse de menace concurrentielle */
export interface CompetitorThreat {
  /** Nom du concurrent ou catégorie */
  competitor: string;
  /** Secteur d'impact principal */
  sector: string;
  /** Niveau de menace */
  threatLevel: ThreatLevel;
  /** Score de menace (0-100) */
  threatScore: number;
  /** Part de marché estimée du concurrent (%) */
  marketShare: number;
  /** Nombre estimé de soumissions actives */
  activeBids: number;
  /** Avantages concurrentiels identifiés */
  advantages: string[];
  /** Vulnérabilités identifiées */
  vulnerabilities: string[];
  /** Recommandation de contre-mesure */
  counterStrategy: string;
}

/** Résultat complet de la prédiction */
export interface PredictionResult {
  /** Prédictions de probabilité de gain */
  winProbabilities: WinProbability[];
  /** Prévisions sectorielles */
  sectorForecasts: TenderForecast[];
  /** Recommandations de prix optimal */
  optimalPricings: OptimalPricing[];
  /** Opportunités émergentes */
  emergingOpportunities: EmergingOpportunity[];
  /** Menaces concurrentielles */
  competitorThreats: CompetitorThreat[];
  /** Score global de prédiction (0-100) */
  overallPredictionScore: number;
  /** Horodatage de la prédiction */
  predictedAt: string;
}

// ===== Données de référence Guinée =====

/** Historique des volumes sectoriels (simulé — 4 derniers trimestres) */
const SECTOR_VOLUME_HISTORY: Record<string, { quarters: number[]; avgValueBn: number }> = {
  "BTP": { quarters: [22, 26, 30, 35], avgValueBn: 45.2 },
  "IT / Digital": { quarters: [8, 12, 15, 18], avgValueBn: 12.8 },
  "Mines": { quarters: [10, 9, 8, 7], avgValueBn: 38.5 },
  "Santé": { quarters: [6, 7, 9, 11], avgValueBn: 8.4 },
  "Éducation": { quarters: [4, 5, 6, 8], avgValueBn: 5.6 },
  "Énergie": { quarters: [5, 7, 10, 14], avgValueBn: 22.3 },
  "Conseil": { quarters: [3, 4, 5, 6], avgValueBn: 3.2 },
  "Finance": { quarters: [4, 5, 5, 6], avgValueBn: 4.8 },
  "Eau / Assainissement": { quarters: [3, 4, 5, 7], avgValueBn: 15.6 },
  "Télécom": { quarters: [2, 3, 4, 5], avgValueBn: 18.2 },
  "Agriculture": { quarters: [3, 4, 5, 6], avgValueBn: 7.4 },
};

/** Profil concurrentiel en Guinée */
const COMPETITOR_PROFILES: Record<string, {
  name: string;
  sectors: string[];
  marketShare: number;
  activeBids: number;
  advantages: string[];
  vulnerabilities: string[];
}> = {
  "chinese_consortium": {
    name: "Consortiums chinois",
    sectors: ["BTP", "Mines", "Énergie"],
    marketShare: 32,
    activeBids: 12,
    advantages: [
      "Financement intégré (Banque chinoise)",
      "Capacité d'exécution rapide",
      "Prix agressifs (subventions étatiques)",
      "Relations gouvernementales établies",
    ],
    vulnerabilities: [
      "Qualité perçue inférieure",
      "Peu de transfert de compétences",
      "Normes environnementales parfois insuffisantes",
      "Langue et barrière culturelle",
    ],
  },
  "french_cos": {
    name: "Entreprises françaises",
    sectors: ["Conseil", "Finance", "IT / Digital"],
    marketShare: 18,
    activeBids: 6,
    advantages: [
      "Références institutionnelles solides",
      "Maîtrise des normes internationales",
      "Langue française native",
      "Accès aux financements AFD/BAD",
    ],
    vulnerabilities: [
      "Coûts de structure élevés",
      "Temps de réponse plus long",
      "Flexibilité limitée sur les prix",
      "Moins de présence terrain",
    ],
  },
  "turkish_firms": {
    name: "Entreprises turques",
    sectors: ["BTP", "Énergie", "Télécom"],
    marketShare: 14,
    activeBids: 8,
    advantages: [
      "Rapport qualité-prix compétitif",
      "Expérience en Afrique de l'Ouest",
      "Financement via Eximbank",
      "Délais de livraison courts",
    ],
    vulnerabilities: [
      "Connaissance locale limitée",
      "Réseau de partenaires restreint",
      "Service après-vente parfois insuffisant",
    ],
  },
  "local_leaders": {
    name: "Leaders locaux",
    sectors: ["Santé", "Éducation", "Fournitures"],
    marketShare: 22,
    activeBids: 5,
    advantages: [
      "Connaissance approfondie du marché",
      "Réseau relationnel local",
      "Coûts opérationnels bas",
      "Avantage préférentiel (25% sur les AO nationaux)",
    ],
    vulnerabilities: [
      "Capacité technique limitée sur les gros marchés",
      "Difficultés de financement",
      "Manque de certifications internationales",
      "Capacité de production restreinte",
    ],
  },
};

/** Facteurs de pondération pour la probabilité de gain */
const WIN_PROBABILITY_WEIGHTS = {
  sectorFit: 0.22,
  competitionLevel: 0.18,
  financialCapacity: 0.15,
  teamExpertise: 0.13,
  pastPerformance: 0.12,
  deadlineFeasibility: 0.10,
  geographicAdvantage: 0.10,
};

// ===== Fonctions utilitaires =====

/** Génère un bruit aléatoire borné pour simuler la variabilité ML */
function mlNoise(base: number, amplitude: number = 3): number {
  return base + (Math.random() - 0.5) * 2 * amplitude;
}

/** Clamp une valeur entre min et max */
function clamp(value: number, min: number = 0, max: number = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Calcule la tendance linéaire simple d'une série temporelle */
function linearTrend(values: number[]): { slope: number; intercept: number } {
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/** Détermine la tendance à partir du slope */
function determineTrend(slope: number, avgVolume: number): SectorTrend {
  const relativeSlope = slope / avgVolume;
  if (relativeSlope > 0.05) return "rising";
  if (relativeSlope < -0.05) return "declining";
  return "stable";
}

// ===== Prédiction : Probabilité de gain =====

/**
 * Calcule la probabilité de gain pour un ensemble de tenders.
 * Utilise les données historiques guinéennes et les caractéristiques du tender.
 */
export function predictWinProbabilities(tenders: Array<{
  id: string;
  title: string;
  sector: string;
  region: string;
  tender_type: string;
  budget_min: number;
  budget_max: number;
  publishing_authority: string;
  priority_score: number;
  compatibility_score: number;
  feasibility_score: number;
  win_probability_score: number;
  strategy_recommendation: string;
}>): WinProbability[] {
  return tenders.slice(0, 5).map((tender) => {
    // Score de base à partir du score existant
    let baseScore = tender.win_probability_score * 100;

    // Ajustement sectoriel — les secteurs où on est fort
    const sectorBonus: Record<string, number> = {
      "IT / Digital": 12,
      "Conseil": 10,
      "Finance": 8,
      "Énergie": 5,
      "Éducation": 4,
      "BTP": -3,
      "Mines": -8,
      "Agriculture": -12,
      "Sécurité": -15,
    };
    baseScore += sectorBonus[tender.sector] || 0;

    // Ajustement concurrence
    const competitionImpact: Record<string, number> = {
      "international": -10,
      "national": 8,
    };
    baseScore += competitionImpact[tender.sector] || 0;

    // Ajustement budget — les petits marchés sont plus accessibles
    const avgBudget = (tender.budget_min + tender.budget_max) / 2;
    if (avgBudget < 2_000_000_000) baseScore += 5;
    else if (avgBudget > 20_000_000_000) baseScore -= 8;

    // Ajustement compatibilité
    baseScore += (tender.compatibility_score - 0.5) * 20;
    baseScore += (tender.feasibility_score - 0.5) * 15;

    // Bruit ML
    baseScore = clamp(mlNoise(baseScore, 4));

    // Intervalle de confiance (±8-15% selon le score)
    const confidenceRange = baseScore > 70 ? 8 : baseScore > 40 ? 12 : 15;
    const confidenceLow = clamp(baseScore - confidenceRange);
    const confidenceHigh = clamp(baseScore + confidenceRange);

    // Niveau de confiance
    const confidence: PredictionConfidence =
      tender.compatibility_score > 0.8 && tender.feasibility_score > 0.8
        ? "high"
        : tender.compatibility_score > 0.5
          ? "medium"
          : "low";

    // Facteurs clés
    const keyFactors: string[] = [];
    if (tender.compatibility_score > 0.8) keyFactors.push("Forte compatibilité sectorielle");
    if (tender.feasibility_score > 0.8) keyFactors.push("Faisabilité élevée");
    if (tender.tender_type === "national") keyFactors.push("AO national — avantage préférentiel");
    if (avgBudget < 5_000_000_000) keyFactors.push("Budget accessible");
    if (avgBudget > 15_000_000_000) keyFactors.push("Budget élevé — concurrence accrue");
    if (tender.region === "Conakry") keyFactors.push("Présence locale forte (Conakry)");
    if (tender.sector === "Mines" || tender.sector === "BTP") keyFactors.push("Concurrence internationale significative");
    if (tender.strategy_recommendation === "go") keyFactors.push("Recommandation GO validée");
    if (keyFactors.length === 0) keyFactors.push("Profil modéré — approche conditionnée");

    // Recommandation
    let recommendation: string;
    if (baseScore >= 65) {
      recommendation = "Soumettre avec confiance. Concentrer l'argumentaire sur les différenciateurs techniques.";
    } else if (baseScore >= 45) {
      recommendation = "Soumettre sous conditions. Renforcer le consortium et l'offre technique.";
    } else {
      recommendation = "Risque élevé. Envisager un partenariat stratégique ou reconsidérer la participation.";
    }

    return {
      tenderId: tender.id,
      tenderTitle: tender.title.length > 50 ? tender.title.slice(0, 47) + "..." : tender.title,
      sector: tender.sector,
      winPercent: Math.round(baseScore),
      confidenceLow: Math.round(confidenceLow),
      confidenceHigh: Math.round(confidenceHigh),
      confidence,
      keyFactors,
      recommendation,
    };
  });
}

// ===== Prédiction : Volume sectoriel =====

/**
 * Prévoit le volume d'appels d'offres par secteur pour le prochain trimestre.
 * Utilise une régression linéaire sur les données historiques avec intervalles de confiance.
 */
export function forecastSectorVolumes(): TenderForecast[] {
  const sectors = Object.keys(SECTOR_VOLUME_HISTORY);

  return sectors.map((sector) => {
    const history = SECTOR_VOLUME_HISTORY[sector];
    const { slope, intercept } = linearTrend(history.quarters);

    // Prédiction pour le prochain trimestre (index 4)
    const predictedVolume = Math.round(intercept + slope * 4);
    const avgVolume = history.quarters.reduce((a, b) => a + b, 0) / history.quarters.length;

    // Intervalle de confiance (élargi pour la prédiction)
    const stdDev = Math.sqrt(
      history.quarters.reduce((sum, v) => sum + Math.pow(v - avgVolume, 2), 0) / history.quarters.length
    );
    const volumeLow = Math.max(1, Math.round(predictedVolume - 1.96 * stdDev));
    const volumeHigh = Math.round(predictedVolume + 1.96 * stdDev);

    // Tendance
    const trend = determineTrend(slope, avgVolume);
    const trendPercent = Math.round((slope / avgVolume) * 100);

    // Valeur estimée en milliards GNF
    const predictedValueBn = Math.round(predictedVolume * (history.avgValueBn / avgVolume) * 10) / 10;

    // Données mensuelles pour le graphique (3 mois du prochain trimestre)
    const monthNames = ["Avr", "Mai", "Jun"];
    const monthlyData: ForecastMonth[] = monthNames.map((month, i) => {
      const monthPredicted = Math.round(predictedVolume / 3 + mlNoise(0, predictedVolume * 0.08));
      const monthStd = stdDev * 0.6;
      return {
        month,
        predicted: monthPredicted,
        low: Math.max(0, Math.round(monthPredicted - 1.96 * monthStd)),
        high: Math.round(monthPredicted + 1.96 * monthStd),
      };
    });

    return {
      sector,
      predictedVolume,
      volumeLow,
      volumeHigh,
      predictedValueBn,
      trend,
      trendPercent,
      monthlyData,
    };
  });
}

// ===== Prédiction : Prix optimal =====

/**
 * Calcule les fourchettes de prix optimales par secteur.
 * Basé sur les données historiques de prix et les marges cibles en Guinée.
 */
export function calculateOptimalPricings(): OptimalPricing[] {
  /** Données de référence prix/marge par secteur en Guinée */
  const sectorPricingData: Record<string, {
    avgPricePerUnit: number; // en M GNF
    marginRange: [number, number];
    competitionEffect: number; // -10 to +10 adjustment
    advice: string;
  }> = {
    "BTP": {
      avgPricePerUnit: 850,
      marginRange: [8, 18],
      competitionEffect: -6,
      advice: "Prix agressif recommandé face aux consortiums chinois. Compenser par la qualité technique et les garanties.",
    },
    "IT / Digital": {
      avgPricePerUnit: 280,
      marginRange: [15, 30],
      competitionEffect: 4,
      advice: "Valoriser l'expertise technique et l'innovation. Marges plus élevées possibles grâce à la rareté des compétences.",
    },
    "Mines": {
      avgPricePerUnit: 620,
      marginRange: [10, 20],
      competitionEffect: -8,
      advice: "Marché très concurrentiel. Privilégier les partenariats et le transfert de compétences comme différenciateur.",
    },
    "Santé": {
      avgPricePerUnit: 180,
      marginRange: [12, 22],
      competitionEffect: 2,
      advice: "Les certifications et la traçabilité justifient un prix légèrement premium. Mettre en avant la conformité.",
    },
    "Éducation": {
      avgPricePerUnit: 150,
      marginRange: [10, 20],
      competitionEffect: 3,
      advice: "Marché en croissance. Proposer des solutions numériques intégrées pour se démarquer.",
    },
    "Énergie": {
      avgPricePerUnit: 520,
      marginRange: [12, 25],
      competitionEffect: 0,
      advice: "Positionnement milieu de gamme recommandé. Les projets solaires permettent des marges supérieures.",
    },
    "Conseil": {
      avgPricePerUnit: 120,
      marginRange: [20, 35],
      competitionEffect: 5,
      advice: "La valeur ajoutée intellectuelle justifie des marges élevées. Démontrer le ROI des missions.",
    },
    "Finance": {
      avgPricePerUnit: 200,
      marginRange: [18, 28],
      competitionEffect: 3,
      advice: "Les certifications internationales (ISA, IFRS) justifient un premium. Argumenter sur la crédibilité.",
    },
    "Eau / Assainissement": {
      avgPricePerUnit: 450,
      marginRange: [8, 16],
      competitionEffect: -3,
      advice: "Concurrence internationale active. Se démarquer par la connaissance du terrain et les solutions adaptées.",
    },
    "Télécom": {
      avgPricePerUnit: 380,
      marginRange: [10, 18],
      competitionEffect: -4,
      advice: "Marché dominé par les acteurs existants. Proposer des solutions innovantes (5G, IoT) pour se différencier.",
    },
    "Agriculture": {
      avgPricePerUnit: 160,
      marginRange: [8, 15],
      competitionEffect: 0,
      advice: "Secteur sous-financé mais stratégique. Les projets FIDA/BAD offrent des opportunités régulières.",
    },
  };

  return Object.entries(sectorPricingData).map(([sector, data]) => {
    const optimalMargin = (data.marginRange[0] + data.marginRange[1]) / 2 + data.competitionEffect;
    const clampedMargin = clamp(optimalMargin, data.marginRange[0], data.marginRange[1]);

    const priceOptimal = Math.round(data.avgPricePerUnit * (1 + clampedMargin / 100));
    const priceFloor = Math.round(data.avgPricePerUnit * (1 + data.marginRange[0] / 100));
    const priceCeiling = Math.round(data.avgPricePerUnit * (1 + data.marginRange[1] / 100));

    const competitivenessScore = clamp(
      70 + data.competitionEffect * 2 + (clampedMargin < 18 ? 10 : 0),
      30,
      95
    );

    return {
      sector,
      priceFloor,
      priceOptimal,
      priceCeiling,
      estimatedMargin: Math.round(clampedMargin),
      competitivenessScore: Math.round(competitivenessScore),
      advice: data.advice,
    };
  });
}

// ===== Prédiction : Opportunités émergentes =====

/**
 * Identifie les secteurs en croissance et les opportunités émergentes en Guinée.
 * Combine les tendances de volume avec les signaux contextuels.
 */
export function identifyEmergingOpportunities(): EmergingOpportunity[] {
  const opportunities: EmergingOpportunity[] = [];

  // Analyse basée sur les tendances de volume et le contexte guinéen
  const sectorContexts: Record<string, {
    trend: SectorTrend;
    intensity: number;
    reasons: string[];
    regions: string[];
    preparation: "immédiat" | "court_terme" | "moyen_terme";
    compatibility: number;
  }> = {
    "Énergie": {
      trend: "rising",
      intensity: 42,
      reasons: [
        "Plan d'électrification rurale 2025-2030 en cours",
        "Engagement COP26 : 80% d'énergies renouvelables d'ici 2030",
        "Financement BAD/Banque Mondiale pour le solaire",
        "Appel à projets hydroélectricité sur le Konkouré",
      ],
      regions: ["Conakry", "Kindia", "Boké"],
      preparation: "immédiat",
      compatibility: 78,
    },
    "IT / Digital": {
      trend: "rising",
      intensity: 38,
      reasons: [
        "Transformation digitale de l'administration (e-gouvernement)",
        "Croissance de la cybersécurité post-attaques 2025",
        "Programme national de numérisation AGUIPE",
        "Demande forte en SIG et data management minier",
      ],
      regions: ["Conakry"],
      preparation: "immédiat",
      compatibility: 85,
    },
    "Santé": {
      trend: "rising",
      intensity: 32,
      reasons: [
        "Plan national de développement sanitaire 2025-2029",
        "Construction de 15 nouveaux centres hospitaliers",
        "Programme OMS de lutte contre les maladies tropicales",
        "Numérisation des dossiers médicaux",
      ],
      regions: ["Conakry", "Nzérékoré", "Kankan"],
      preparation: "court_terme",
      compatibility: 62,
    },
    "Éducation": {
      trend: "rising",
      intensity: 28,
      reasons: [
        "Programme d'équipement numérique scolaire",
        "Partenariat UNESCO pour l'éducation en ligne",
        "Construction de 50 écoles dans les zones rurales",
        "Formation continue des enseignants via le numérique",
      ],
      regions: ["Conakry", "Kankan", "Labé"],
      preparation: "court_terme",
      compatibility: 68,
    },
    "Eau / Assainissement": {
      trend: "rising",
      intensity: 25,
      reasons: [
        "Objectif ODD 6 : accès universel à l'eau potable",
        "Réhabilitation du réseau Conakry (Phase 2 en cours)",
        "Programme WASH en zone rurale (UNICEF)",
        "Nouveau plan directeur de l'assainissement 2026",
      ],
      regions: ["Conakry", "Kindia"],
      preparation: "moyen_terme",
      compatibility: 55,
    },
    "BTP": {
      trend: "stable",
      intensity: 12,
      reasons: [
        "Projets routiers en cours (Boké-Kamsar, Transguinéenne)",
        "Construction habituelle d'infrastructures publiques",
        "Marché soutenu mais à forte concurrence",
      ],
      regions: ["Conakry", "Kankan", "Boké"],
      preparation: "immédiat",
      compatibility: 48,
    },
    "Mines": {
      trend: "declining",
      intensity: -15,
      reasons: [
        "Ralentissement de la demande mondiale en bauxite",
        "Renforcement des exigences ESG par les bailleurs",
        "Concurrence chinoise de plus en plus agressive",
        "Baisse des volumes d'AO dans le secteur",
      ],
      regions: ["Boké", "Kindia", "Nzérékoré"],
      preparation: "moyen_terme",
      compatibility: 35,
    },
  };

  for (const [sector, ctx] of Object.entries(sectorContexts)) {
    const opportunityScore = clamp(
      50 + ctx.intensity + ctx.compatibility * 0.3 + (ctx.trend === "rising" ? 10 : 0),
      10,
      98
    );

    // Ne retenir que les opportunités significatives (score > 45)
    if (opportunityScore > 45) {
      opportunities.push({
        sector,
        opportunityScore: Math.round(opportunityScore),
        trend: ctx.trend,
        trendIntensity: ctx.intensity,
        reasons: ctx.reasons,
        keyRegions: ctx.regions,
        preparationLevel: ctx.preparation,
        compatibilityScore: ctx.compatibility,
      });
    }
  }

  // Trier par score d'opportunité décroissant
  return opportunities.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

// ===== Prédiction : Menaces concurrentielles =====

/**
 * Génère une analyse des menaces concurrentielles sur le marché guinéen.
 */
export function analyzeCompetitorThreats(): CompetitorThreat[] {
  const threats: CompetitorThreat[] = [];

  const threatLevelMap: Record<string, ThreatLevel> = {
    "chinese_consortium": "critique",
    "french_cos": "modéré",
    "turkish_firms": "élevé",
    "local_leaders": "faible",
  };

  const threatScoreMap: Record<string, number> = {
    "chinese_consortium": 88,
    "french_cos": 52,
    "turkish_firms": 68,
    "local_leaders": 35,
  };

  const counterStrategies: Record<string, string> = {
    "chinese_consortium": "Différencier par la qualité, les normes ESG et le transfert de compétences. Mettre en avant la conformité réglementaire et les partenariats locaux. Les bailleurs internationaux privilégient de plus en plus les critères RSE.",
    "french_cos": "Compenser par la réactivité, la flexibilité tarifaire et la connaissance terrain. Proposer des approches hybrides combinant expertise internationale et ancrage local. Mettre en avant la disponibilité opérationnelle.",
    "turkish_firms": "Miser sur la qualité de service après-vente et les garanties de performance. Les entreprises turques peinent sur le suivi long terme. Valoriser les références locales et les partenariats durables.",
    "local_leaders": "Apporter la dimension technique et internationale que les acteurs locaux ne peuvent pas fournir. Proposer des consortiums gagnant-gagnant où le partenaire local bénéficie du transfert de compétences.",
  };

  for (const [key, profile] of Object.entries(COMPETITOR_PROFILES)) {
    threats.push({
      competitor: profile.name,
      sector: profile.sectors.join(", "),
      threatLevel: threatLevelMap[key],
      threatScore: threatScoreMap[key],
      marketShare: profile.marketShare,
      activeBids: profile.activeBids,
      advantages: profile.advantages,
      vulnerabilities: profile.vulnerabilities,
      counterStrategy: counterStrategies[key],
    });
  }

  // Trier par score de menace décroissant
  return threats.sort((a, b) => b.threatScore - a.threatScore);
}

// ===== Fonction principale : generatePrediction =====

/**
 * Génère une prédiction complète pour le marché des appels d'offres en Guinée.
 *
 * @param tenders - Liste des tenders actuels pour la prédiction de gain
 * @returns Un résultat de prédiction complet
 *
 * @example
 * ```ts
 * const result = generatePrediction(mockTenders);
 * console.log(result.winProbabilities); // Prédictions de gain
 * console.log(result.sectorForecasts);  // Prévisions sectorielles
 * console.log(result.optimalPricings);   // Prix optimaux
 * ```
 */
export function generatePrediction(tenders: Array<{
  id: string;
  title: string;
  sector: string;
  region: string;
  tender_type: string;
  budget_min: number;
  budget_max: number;
  publishing_authority: string;
  priority_score: number;
  compatibility_score: number;
  feasibility_score: number;
  win_probability_score: number;
  strategy_recommendation: string;
}>): PredictionResult {
  const winProbabilities = predictWinProbabilities(tenders);
  const sectorForecasts = forecastSectorVolumes();
  const optimalPricings = calculateOptimalPricings();
  const emergingOpportunities = identifyEmergingOpportunities();
  const competitorThreats = analyzeCompetitorThreats();

  // Score global de prédiction (moyenne pondérée)
  const avgWinProb = winProbabilities.reduce((s, w) => s + w.winPercent, 0) / Math.max(1, winProbabilities.length);
  const avgOpportunity = emergingOpportunities.reduce((s, o) => s + o.opportunityScore, 0) / Math.max(1, emergingOpportunities.length);
  const avgThreatInverted = 100 - competitorThreats.reduce((s, c) => s + c.threatScore, 0) / Math.max(1, competitorThreats.length);

  const overallPredictionScore = Math.round(
    avgWinProb * 0.35 + avgOpportunity * 0.35 + avgThreatInverted * 0.30
  );

  return {
    winProbabilities,
    sectorForecasts,
    optimalPricings,
    emergingOpportunities,
    competitorThreats,
    overallPredictionScore: clamp(overallPredictionScore, 10, 95),
    predictedAt: new Date().toISOString(),
  };
}
