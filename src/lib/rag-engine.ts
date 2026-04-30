/**
 * TenderFlow Guinea — RAG Engine
 * 
 * Moteur de recherche augmentée par récupération (RAG) spécialisé
 * pour les appels d'offres en République de Guinée.
 * 
 * Fonctionnalités :
 * - Base de connaissances documentaire sur les marchés publics guinéens
 * - Recherche sémantique simulée (scoring TF-IDF)
 * - Modes de conversation multiples (Analyse, Rédaction, Recherche, Stratégie)
 * - Templates de documents pré-définis
 * - Réponses contextuelles avec sources et niveau de confiance
 */

// ===== Types & Interfaces =====

export type ConversationMode = "analysis" | "drafting" | "research" | "strategy";

export interface RAGSource {
  id: string;
  title: string;
  type: "regulation" | "guide" | "template" | "tender" | "faq";
  excerpt: string;
  relevance: number; // 0-1
  url?: string;
}

export interface RAGSuggestion {
  id: string;
  label: string;
  prompt: string;
  icon: string; // lucide icon name
}

export interface RAGResponse {
  content: string;
  sources: RAGSource[];
  confidence: number; // 0-1
  suggestions: RAGSuggestion[];
  mode: ConversationMode;
  metadata: {
    retrievedDocs: number;
    processingTime: number;
    tokensUsed: number;
  };
}

export interface RAGMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: RAGSource[];
  confidence?: number;
  suggestions?: RAGSuggestion[];
  mode?: ConversationMode;
}

export interface RAGConversation {
  id: string;
  title: string;
  mode: ConversationMode;
  messages: RAGMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ===== Knowledge Base =====

interface KnowledgeDocument {
  id: string;
  title: string;
  type: "regulation" | "guide" | "template" | "tender" | "faq";
  content: string;
  keywords: string[];
  sector?: string;
  region?: string;
}

const knowledgeBase: KnowledgeDocument[] = [
  // --- Réglementations ---
  {
    id: "reg-001",
    title: "Code des Marchés Publics de la République de Guinée (2018)",
    type: "regulation",
    content: `Le Code des Marchés Publics de la République de Guinée, adopté par la loi L/2018/AN du 12 juin 2018, régit la passation des marchés publics. Les principes fondamentaux sont : liberté d'accès à la commande publique, égalité de traitement des candidats, transparence des procédures, et efficacité de la commande publique. Les seuils de passation sont : appel d'offres international au-dessus de 500 millions GNF, appel d'offres national entre 50 et 500 millions GNF, et consultation restreinte en dessous de 50 millions GNF. Le délai minimum de publication est de 30 jours pour les appels d'offres nationaux et 45 jours pour les internationaux.`,
    keywords: ["code", "marchés publics", "réglementation", "seuils", "passation", "loi", "2018", "transparence", "appel d'offres", "international", "national", "consultation", "publication", "délai"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "reg-002",
    title: "Décret d'application du Code des Marchés Publics",
    type: "regulation",
    content: `Le décret D/2019/PRG/SGG précise les modalités d'application du Code des Marchés Publics. Il définit les critères d'évaluation des offres : qualité technique (40-60%), prix (30-50%), et délais de réalisation (10-20%). La commission d'évaluation doit comporter au minimum 5 membres dont au moins une femme. Les critères de qualification exigent : une expérience similaire de 5 ans minimum, un chiffre d'affaires minimum égal à 2 fois le montant du marché, et la justification de personnel qualifié. La sous-traitance est limitée à 30% du montant total du marché.`,
    keywords: ["décret", "critères", "évaluation", "qualification", "commission", "technique", "prix", "sous-traitance", "expérience", "chiffre d'affaires", "personnel"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "reg-003",
    title: "Loi sur les Partenariats Public-Privé (PPP) en Guinée",
    type: "regulation",
    content: `La loi L/2020/AN sur les PPP permet aux entités publiques guinéennes de conclure des contrats de partenariat avec des personnes morales de droit privé pour la construction, l'exploitation et la maintenance d'équipements ou d'infrastructures. Les secteurs éligibles incluent : BTP, énergie, eau, télécommunications, transport, santé et éducation. La durée des contrats PPP est de 5 à 30 ans. Le mécanisme de financement peut inclure : apport privé, redevances, garanties de l'État, et financements bancaires. L'APIP (Agence de Promotion des Investissements Privés) est l'interlocuteur principal.`,
    keywords: ["ppp", "partenariat", "public-privé", "infrastructure", "financement", "APIP", "contrat", "concession", "investissement"],
    sector: undefined,
    region: undefined,
  },
  // --- Guides ---
  {
    id: "guide-001",
    title: "Guide pratique de réponse aux appels d'offres en Guinée",
    type: "guide",
    content: `Pour répondre efficacement à un appel d'offres en Guinée, suivez ces étapes : 1) Vérifiez votre éligibilité (registre de commerce, NIF, CNPS) ; 2) Analysez le cahier des charges en détail ; 3) Préparez votre dossier administratif (certificats, attestations, références) ; 4) Rédigez votre offre technique avec une note de compréhension, une méthodologie détaillée et un planning ; 5) Préparez votre offre financière avec un bordereau des prix unitaires ; 6) Respectez strictement les délais (les retards sont automatiquement exclus). Les erreurs fréquentes : dossiers incomplets, non-respect du format exigé, absence de cautionnement, et offres financières irréalistes.`,
    keywords: ["guide", "réponse", "appel d'offres", "éligibilité", "dossier", "offre technique", "offre financière", "cautionnement", "erreurs", "délais"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "guide-002",
    title: "Guide sectoriel BTP — Marchés publics guinéens",
    type: "guide",
    content: `Le secteur BTP représente 35% des marchés publics en Guinée. Les principales autorités contractantes sont : le Ministère des Travaux Publics (MTP), le Ministère de l'Urbanisme, et les collectivités locales. Les projets BTP majeurs en 2026 incluent : construction de ponts, réhabilitation routière, bâtiments administratifs et infrastructures hydrauliques. Les exigences techniques courantes : études géotechniques, normes AFNOR/EUROCODE, plan qualité, plan HSE, et garantie décennale. Les financements proviennent souvent de bailleurs internationaux (Banque Mondiale, BAD, BID, Coopération Chinoise). Prévoir un coefficient de majoration de 15-25% pour les projets en zones intérieures (logistique, main d'œuvre).`,
    keywords: ["btp", "construction", "infrastructure", "travaux publics", "pont", "route", "géotechnique", "normes", "qualité", "hse", "financement", "bailleur", "banque mondiale"],
    sector: "BTP",
    region: undefined,
  },
  {
    id: "guide-003",
    title: "Guide sectoriel IT & Digital — Marchés publics guinéens",
    type: "guide",
    content: `Le secteur IT/Digital croît de 22% par an dans les marchés publics guinéens. Les principaux donneurs d'ordres : AGUIPE, SOGUIPAMI, Ministère des Télécommunications, ARTP. Les projets typiques : systèmes d'information, cybersécurité, réseaux de télécommunications, applications mobiles, SIG. Les exigences techniques : certifications ISO 27001/27002 pour la sécurité, hébergement local des données (loi sur la protection des données de 2022), interopérabilité des systèmes, et formation du personnel. La préférence nationale s'applique aux marchés IT nationaux en dessous de 200 millions GNF. Les partenariats avec des entreprises locales sont un atout majeur.`,
    keywords: ["it", "digital", "système d'information", "cybersécurité", "télécom", "certification", "iso", "données", "application", "réseau", "partenariat"],
    sector: "IT / Digital",
    region: undefined,
  },
  {
    id: "guide-004",
    title: "Guide des régions administratives de Guinée pour les appels d'offres",
    type: "guide",
    content: `La Guinée compte 8 régions administratives avec des spécificités pour les marchés publics : Conakry (siège de 60% des marchés, concurrence élevée), Kankan (2ème pôle économique, projets miniers et BTP), Nzérékoré (agriculture, foresterie, projets ruraux), Kindia (mines de bauxite, infrastructures), Boké (industrie minière, port de Kamsar), Labé (élevage, agriculture, énergie solaire), Faranah (agriculture, routes), Mamou (agriculture, transport). Chaque région a une Direction Régionale des Marchés Publics. Les projets financés par les bailleurs internationaux sont souvent centralisés à Conakry mais exécutés en régions.`,
    keywords: ["région", "conakry", "kankan", "n'zérékoré", "kindia", "boké", "labé", "faranah", "mamou", "spécificité", "direction régionale"],
    sector: undefined,
    region: undefined,
  },
  // --- Templates ---
  {
    id: "tpl-001",
    title: "Template — Lettre de manifestation d'intérêt",
    type: "template",
    content: `Structure d'une lettre de manifestation d'intérêt pour un appel d'offres en Guinée : En-tête (logo, raison sociale, NIF, RC) ; Objet : Manifestation d'intérêt pour [référence AO] ; Introduction (identification de l'entreprise) ; Corps : intérêt pour le projet, compétences clés, expérience pertinente (3-5 références), moyens humains et techniques ; Conclusion : disponibilité pour compléments d'information ; Signature et cachet. Format : maximum 3 pages, police 12, interligne 1.5. Joindre : KBIS, certificat de régularité fiscale, attestation CNPS.`,
    keywords: ["lettre", "manifestation", "intérêt", "template", "modèle", "format", "références", "kbis", "fiscale", "cnps"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "tpl-002",
    title: "Template — Note de compréhension du besoin",
    type: "template",
    content: `La note de compréhension est un élément clé de l'offre technique (pondération 15-25%). Structure recommandée : 1) Contexte et enjeux du projet (1-2 pages) ; 2) Analyse des besoins identifiés dans le cahier des charges (2-3 pages) ; 3) Compréhension des contraintes (délais, budget, réglementation) ; 4) Vision et approche proposée (1-2 pages) ; 5) Valeur ajoutée de votre proposition (1 page). Astuce : montrez que vous comprenez le contexte guinéen spécifique (réglementation, acteurs, contraintes logistiques). Mentionnez les visites de terrain si effectuées. Total : 6-10 pages.`,
    keywords: ["note", "compréhension", "offre technique", "cahier des charges", "besoins", "approche", "valeur ajoutée", "contexte"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "tpl-003",
    title: "Template — Analyse de risques projet",
    type: "template",
    content: `Matrice d'analyse des risques pour projets en Guinée : Catégories de risques — Techniques (malfaçons, retards équipements, aléas géotechniques) ; Financiers (fluctuation change GNF/USD, inflation matériaux, coûts logistiques) ; Juridiques (contentieux, modification réglementaire, résiliation) ; Opérationnels (sécurité sur site, pénurie main d'œuvre qualifiée, pandémie) ; Environnementaux (saison des pluies, inondations, pollution). Pour chaque risque : probabilité (1-5), impact (1-5), mesure d'atténuation, responsable, budget de contingence. Spécificités Guinée : saison des pluies (juin-octobre), taux de change volatile, délais administratifs imprévisibles.`,
    keywords: ["risque", "analyse", "matrice", "technique", "financier", "juridique", "opérationnel", "environnement", "atténuation", "contingence", "saison des pluies"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "tpl-004",
    title: "Template — Synthèse GO/NO-GO",
    type: "template",
    content: `Grille d'évaluation GO/NO-GO pour appel d'offres en Guinée : Critères éliminatoires (NO-GO automatique) : éligibilité non respectée, expérience insuffisante, CA minimum non atteint, conflit d'intérêt, délai de réponse trop court. Critères d'évaluation (scoring) : Adéquation technique (0-25), Compatibilité secteur (0-20), Capacité financière (0-15), Disponibilité ressources (0-15), Niveau concurrence (0-10), Rentabilité potentielle (0-10), Risques identifiés (0-5). Seuil GO : 60/100. GO conditionnel : 45-60. NO-GO : < 45. Inclure une recommandation finale avec justification.`,
    keywords: ["go", "no-go", "synthèse", "évaluation", "éligibilité", "scoring", "recommandation", "critères", "concurrence", "rentabilité"],
    sector: undefined,
    region: undefined,
  },
  // --- Appels d'offres référencés ---
  {
    id: "ao-001",
    title: "AO/MTP/2026/0142 — Pont sur le Niger à Kouroussa",
    type: "tender",
    content: `Appel d'offres international pour la conception et construction d'un pont routier de 320m sur le fleuve Niger. Budget : 15-25 milliards GNF. Maître d'ouvrage : Ministère des Travaux Publics. Date limite : 15 juin 2026. Exigences : 10 ans d'expérience en ouvrages d'art similaires, CA minimum 30 milliards GNF, certification ISO 9001. Le projet inclut : études géotechniques, conception structurelle, fondations, piles, tablier, accès routiers. Financement : Budget national + BAD. Zone sismique à prendre en compte (classe II).`,
    keywords: ["pont", "niger", "kouroussa", "ouvrage d'art", "btp", "mtp", "construction", "géotechnique", "fondation", "bad", "sismique"],
    sector: "BTP",
    region: "Kankan",
  },
  {
    id: "ao-002",
    title: "AO/DNE/2026/0087 — Panneaux solaires centres de santé",
    type: "tender",
    content: `Appel d'offres national pour la fourniture, installation et maintenance de systèmes d'énergie solaire dans 50 centres de santé. Budget : 5-8 milliards GNF. Régions : Boké, Kindia, Nzérékoré. Chaque installation : panneaux solaires, onduleurs, batteries de stockage, monitoring à distance. Exigences : expérience 5 ans en énergie solaire en Afrique, certification IEC pour les équipements, garantie 5 ans minimum. Préférence pour les entreprises à capital guinéen majoritaire.`,
    keywords: ["solaire", "énergie", "panneaux", "santé", "centres", "onduleurs", "batteries", "monitoring", "iec", "guinéen"],
    sector: "Énergie",
    region: "National",
  },
  {
    id: "ao-003",
    title: "AO/SOGUIPAMI/2026/0023 — SIG ressources minières",
    type: "tender",
    content: `Appel d'offres international pour un système d'information intégré de gestion des ressources minières. Budget : 3-6 milliards GNF. Composantes : portail web, application mobile, SIG (Système d'Information Géographique), module de reporting avancé. Exigences : expérience SIG dans le secteur minier, interopérabilité avec les systèmes existants, hébergement local des données, formation des utilisateurs. La solution doit gérer les titres miniers, le suivi des redevances et la cartographie minière. Délai de mise en œuvre : 18 mois.`,
    keywords: ["sig", "système d'information", "mines", "soguipami", "géographique", "cartographie", "titres miniers", "redevances", "reporting", "portail"],
    sector: "IT / Digital",
    region: "Conakry",
  },
  {
    id: "ao-004",
    title: "AO/AGUIPE/2026/0019 — Cybersécurité Administration publique",
    type: "tender",
    content: `Appel d'offres international pour la sécurisation des systèmes d'information de l'administration publique. Budget : 2-4.5 milliards GNF. Prestations : audit de sécurité, déploiement SOC (Security Operations Center), formation équipes internes, veille en cybersécurité 24 mois. Exigences : certification ISO 27001 Lead Auditor, expérience SOC en Afrique de l'Ouest, personnel certifié CISSP/CISM. La loi guinéenne de 2022 sur la protection des données impose l'hébergement local des données sensibles.`,
    keywords: ["cybersécurité", "soc", "sécurité", "audit", "iso 27001", "cissp", "cism", "données", "protection", "administration", "aguipe"],
    sector: "IT / Digital",
    region: "Conakry",
  },
  // --- FAQ ---
  {
    id: "faq-001",
    title: "FAQ — Comment s'inscrire sur la plateforme des marchés publics guinéens ?",
    type: "faq",
    content: `Pour participer aux marchés publics en Guinée, vous devez : 1) Obtenir un Numéro d'Identification Fiscale (NIF) au Centre des Impôts ; 2) Vous inscrire au Registre de Commerce au Tribunal de Commerce ; 3) Obtenir une attestation de régularité CNPS ; 4) Vous inscrire sur le portail national des marchés publics (demarches.gouv.gn) ; 5) Obtenir un certificat de régularité fiscale annuel. Les entreprises étrangères doivent en plus désigner un représentant local et obtenir une autorisation d'exercer du Ministère du Commerce. Délai moyen d'obtention : 2-4 semaines.`,
    keywords: ["inscription", "nif", "registre commerce", "cnps", "portail", "impôt", "entreprise étrangère", "représentant", "autorisation", "démarche"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "faq-002",
    title: "FAQ — Quels sont les délais typiques des procédures d'appels d'offres ?",
    type: "faq",
    content: `Les délais réglementaires en Guinée : Publication au JO : minimum 30 jours (national) / 45 jours (international) avant la date limite ; Ouverture des plis : le jour de la date limite à 10h ; Évaluation technique : 5-15 jours ouvrables ; Évaluation financière : 3-7 jours ouvrables ; Notification de l'attributaire : 5 jours après approbation ; Signature du marché : dans les 30 jours suivant la notification ; Recours : 10 jours après notification pour contester. En pratique, les délais totaux sont de 2-6 mois selon la complexité et le financement.`,
    keywords: ["délai", "procédure", "publication", "ouverture", "évaluation", "notification", "signature", "recours", "calendrier", "durée"],
    sector: undefined,
    region: undefined,
  },
  {
    id: "faq-003",
    title: "FAQ — Comment fonctionne la préférence nationale ?",
    type: "faq",
    content: `La préférence nationale en Guinée accorde un avantage de 15% aux entreprises guinéennes et 10% aux entreprises à capital mixte (guinéen majoritaire) dans l'évaluation des offres financières. Conditions d'éligibilité : registre de commerce guinéen, siège social en Guinée, au moins 51% du capital détenu par des Guinéens pour la préférence pleine, et au moins 30% pour la préférence mixte. S'applique uniquement aux appels d'offres nationaux. Ne s'applique pas aux marchés financés par des bailleurs internationaux qui ont leurs propres règles (Banque Mondiale : pas de préférence nationale).`,
    keywords: ["préférence nationale", "entreprise guinéenne", "capital", "avantage", "évaluation financière", "bailleur", "mixte", "siège social"],
    sector: undefined,
    region: undefined,
  },
];

// ===== TF-IDF Style Scoring Engine =====

/**
 * Tokenize and normalize French text for search
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics for matching
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

/**
 * Calculate TF-IDF-like score between a query and document
 */
function calculateRelevance(query: string, doc: KnowledgeDocument): number {
  const queryTokens = tokenize(query);
  const docTokens = tokenize(doc.content);
  const titleTokens = tokenize(doc.title);
  const keywordTokens = doc.keywords.map((k) => tokenize(k)).flat();

  if (queryTokens.length === 0) return 0;

  let score = 0;

  // Exact keyword matches (highest weight)
  for (const qt of queryTokens) {
    if (doc.keywords.some((kw) => tokenize(kw).includes(qt))) {
      score += 3.0;
    }
  }

  // Title matches (high weight)
  for (const qt of queryTokens) {
    if (titleTokens.includes(qt)) {
      score += 2.0;
    }
  }

  // Content matches (standard weight with TF)
  for (const qt of queryTokens) {
    const tf = docTokens.filter((dt) => dt === qt).length;
    if (tf > 0) {
      score += Math.min(1.0 + tf * 0.3, 3.0);
    }
  }

  // Multi-word phrase matching bonus
  const queryLower = query.toLowerCase();
  if (doc.content.toLowerCase().includes(queryLower.slice(0, 40))) {
    score += 2.0;
  }

  // Sector/region match bonus
  if (doc.sector && queryLower.includes(doc.sector.toLowerCase())) {
    score += 1.5;
  }
  if (doc.region && queryLower.includes(doc.region.toLowerCase())) {
    score += 1.0;
  }

  // Normalize by query length and document length
  const normalizedScore = score / Math.max(queryTokens.length, 1);
  const docLengthPenalty = 1 / (1 + Math.max(docTokens.length - 200, 0) / 500);

  return Math.min(normalizedScore * docLengthPenalty, 1.0);
}

/**
 * Retrieve relevant documents from the knowledge base
 */
function retrieveDocuments(query: string, topK: number = 5): KnowledgeDocument[] {
  const scored = knowledgeBase
    .map((doc) => ({
      doc,
      score: calculateRelevance(query, doc),
    }))
    .filter((s) => s.score > 0.1)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((s) => s.doc);
}

/**
 * Extract a relevant excerpt from a document given a query
 */
function extractExcerpt(content: string, query: string, maxLen: number = 200): string {
  const queryTokens = tokenize(query);
  const sentences = content.split(/[.!?\n]+/).filter((s) => s.trim().length > 20);

  let bestSentence = sentences[0] || content.slice(0, maxLen);
  let bestScore = 0;

  for (const sentence of sentences) {
    const sentTokens = tokenize(sentence);
    const matchCount = queryTokens.filter((qt) =>
      sentTokens.some((st) => st.includes(qt) || qt.includes(st))
    ).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestSentence = sentence.trim();
    }
  }

  if (bestSentence.length > maxLen) {
    return bestSentence.slice(0, maxLen) + "...";
  }
  return bestSentence;
}

// ===== Mode-Specific Prompt Engineering =====

const modeSystemPrompts: Record<ConversationMode, string> = {
  analysis: `Tu es un analyste expert des marchés publics en Guinée. Ton rôle est d'analyser en profondeur les appels d'offres, d'évaluer les opportunités, d'identifier les risques et de fournir des recommandations GO/NO-GO argumentées. Tu dois citer les réglementations applicables et les documents de référence. Structure tes réponses avec des sections claires : Synthèse, Analyse détaillée, Risques, Recommandation.`,
  drafting: `Tu es un expert en rédaction de réponses aux appels d'offres en Guinée. Ton rôle est d'aider à rédiger des documents professionnels : lettres de manifestation d'intérêt, notes de compréhension, offres techniques, argumentaires. Tu dois respecter les formats réglementaires guinéens et inclure les mentions légales requises. Propose toujours des structures et des formulations concrètes.`,
  research: `Tu es un chercheur spécialisé sur les marchés publics guinéens. Ton rôle est de fournir des informations approfondies sur la réglementation, les procédures, les acteurs, les secteurs et les tendances. Tu dois citer tes sources avec précision et distinguer les faits établis des estimations. Fournis des données chiffrées quand c'est possible.`,
  strategy: `Tu es un stratège de soumission expérimenté sur le marché guinéen. Ton rôle est d'élaborer des stratégies gagnantes pour les appels d'offres : positionnement concurrentiel, pricing, partenariats, différenciation. Tu dois prendre en compte le contexte local (relations institutionnelles, préférence nationale, contraintes logistiques) et proposer des plans d'action concrets.`,
};

const modeLabels: Record<ConversationMode, string> = {
  analysis: "Analyse",
  drafting: "Rédaction",
  research: "Recherche",
  strategy: "Stratégie",
};

// ===== Mode-Specific Suggestion Generator =====

function generateSuggestions(mode: ConversationMode, query: string): RAGSuggestion[] {
  const baseSuggestions: Record<ConversationMode, RAGSuggestion[]> = {
    analysis: [
      { id: "s-anl-1", label: "Analyser l'éligibilité", prompt: "Vérifiez les critères d'éligibilité pour cet appel d'offres", icon: "CheckCircle" },
      { id: "s-anl-2", label: "Évaluer les risques", prompt: "Identifiez et évaluez les principaux risques de cet appel d'offres", icon: "AlertTriangle" },
      { id: "s-anl-3", label: "Analyse GO/NO-GO", prompt: "Produisez une synthèse GO/NO-GO pour cet appel d'offres", icon: "Target" },
      { id: "s-anl-4", label: "Comparer les concurrents", prompt: "Analysez le paysage concurrentiel pour cet appel d'offres", icon: "Users" },
    ],
    drafting: [
      { id: "s-drf-1", label: "Lettre de manifestation", prompt: "Aidez-moi à rédiger une lettre de manifestation d'intérêt", icon: "FileText" },
      { id: "s-drf-2", label: "Note de compréhension", prompt: "Rédigez une note de compréhension pour ce cahier des charges", icon: "BookOpen" },
      { id: "s-drf-3", label: "Offre technique", prompt: "Structurez une offre technique pour cet appel d'offres", icon: "Wrench" },
      { id: "s-drf-4", label: "Méthodologie", prompt: "Rédigez un plan méthodologique détaillé", icon: "ListChecks" },
    ],
    research: [
      { id: "s-rsr-1", label: "Réglementation applicable", prompt: "Quelle réglementation s'applique à ce type d'appel d'offres ?", icon: "Scale" },
      { id: "s-rsr-2", label: "Procédures et délais", prompt: "Quelles sont les procédures et délais pour cet appel d'offres ?", icon: "Clock" },
      { id: "s-rsr-3", label: "Acteurs clés", prompt: "Qui sont les acteurs clés du marché dans ce secteur ?", icon: "Users" },
      { id: "s-rsr-4", label: "Tendances du marché", prompt: "Quelles sont les tendances actuelles du marché des appels d'offres en Guinée ?", icon: "TrendingUp" },
    ],
    strategy: [
      { id: "s-str-1", label: "Stratégie de prix", prompt: "Proposez une stratégie de prix pour cet appel d'offres", icon: "DollarSign" },
      { id: "s-str-2", label: "Partenariats", prompt: "Quels partenariats recommandez-vous pour renforcer notre position ?", icon: "Handshake" },
      { id: "s-str-3", label: "Différenciation", prompt: "Comment pouvons-nous nous différencier des concurrents ?", icon: "Sparkles" },
      { id: "s-str-4", label: "Plan d'action", prompt: "Élaborez un plan d'action pour la soumission", icon: "Rocket" },
    ],
  };

  // Filter out suggestions that are too similar to what was just asked
  const queryTokens = tokenize(query);
  return baseSuggestions[mode].filter((s) => {
    const sTokens = tokenize(s.prompt);
    const overlap = sTokens.filter((st) => queryTokens.some((qt) => qt === st)).length;
    return overlap < 2;
  }).slice(0, 3);
}

// ===== Response Generator =====

/**
 * Generate a contextual response based on the query, mode, and retrieved documents.
 * This function constructs a detailed French response simulating RAG behavior.
 */
function generateContextualResponse(
  query: string,
  mode: ConversationMode,
  retrievedDocs: KnowledgeDocument[]
): string {
  const sourcesList = retrievedDocs
    .map((d, i) => `[${i + 1}] ${d.title}`)
    .join(", ");

  const modeLabel = modeLabels[mode];

  // Mode-specific response templates
  if (mode === "analysis") {
    return generateAnalysisResponse(query, retrievedDocs, sourcesList, modeLabel);
  } else if (mode === "drafting") {
    return generateDraftingResponse(query, retrievedDocs, sourcesList, modeLabel);
  } else if (mode === "research") {
    return generateResearchResponse(query, retrievedDocs, sourcesList, modeLabel);
  } else {
    return generateStrategyResponse(query, retrievedDocs, sourcesList, modeLabel);
  }
}

function generateAnalysisResponse(
  query: string,
  docs: KnowledgeDocument[],
  sourcesList: string,
  _modeLabel: string
): string {
  const hasBTP = docs.some((d) => d.sector === "BTP") || query.toLowerCase().includes("btp") || query.toLowerCase().includes("construction") || query.toLowerCase().includes("pont") || query.toLowerCase().includes("route");
  const hasIT = docs.some((d) => d.sector === "IT / Digital") || query.toLowerCase().includes("it") || query.toLowerCase().includes("numérique") || query.toLowerCase().includes("système");

  if (hasBTP) {
    return `## 🔍 Analyse de l'appel d'offres BTP

### Synthèse
L'appel d'offres que vous analysez s'inscrit dans le secteur BTP guinéen, qui représente **35% des marchés publics** dans le pays. Voici mon analyse structurée :

### Évaluation de l'opportunité
- **Secteur** : BTP — secteur dynamique avec de nombreux projets financés par les bailleurs internationaux (Banque Mondiale, BAD)
- **Budget estimé** : Les projets similaires en Guinée ont des budgets allant de 5 à 60 milliards GNF selon l'envergure
- **Concurrence** : Élevée sur Conakry, modérée en régions intérieures — un avantage concurrentiel existe pour les entreprises présentes localement

### Risques identifiés
1. **Technique** : Les études géotechniques sont cruciales, surtout en zone sismique (classe II en Guinée)
2. **Financier** : Prévoir une majoration de **15-25%** pour les projets en zones intérieures (logistique, main d'œuvre)
3. **Calendaire** : La saison des pluies (juin-octobre) peut impacter significativement les délais de travaux
4. **Réglementaire** : Respect obligatoire des normes AFNOR/EUROCODE et du plan qualité

### Recommandation : ⚡ GO CONDITIONNEL
Recommandation de participer sous réserve de :
- Vérification du chiffre d'affaires minimum requis (2x le montant du marché selon le Décret D/2019/PRG/SGG)
- Capacité à fournir la cautionnement provisoire
- Disponibilité des ressources techniques qualifiées

### Sources consultées
${sourcesList}`;
  }

  if (hasIT) {
    return `## 🔍 Analyse de l'appel d'offres IT & Digital

### Synthèse
Le secteur IT/Digital des marchés publics guinéens connaît une croissance de **22% par an**. Cette opportunité mérite une attention particulière.

### Évaluation de l'opportunité
- **Secteur** : IT & Digital — marché en forte croissance porté par la digitalisation de l'administration
- **Acteurs clés** : AGUIPE, SOGUIPAMI, ARTP sont les principaux donneurs d'ordres
- **Avantage** : La préférence nationale s'applique aux marchés IT nationaux < 200M GNF

### Exigences réglementaires clés
1. **Certification** : ISO 27001/27002 pour les projets de cybersécurité
2. **Hébergement** : La loi de 2022 impose l'hébergement local des données sensibles
3. **Sous-traitance** : Limitée à 30% du montant total du marché
4. **Formation** : Obligation de formation du personnel client

### Risques identifiés
1. **Conformité** : Respect de la loi sur la protection des données (2022)
2. **Interopérabilité** : Intégration avec les systèmes existants de l'administration
3. **Sécurité** : Exigences élevées en matière de cybersécurité

### Recommandation : ✅ GO
Le secteur est porteur et correspond à vos compétences. Assurez-vous de :
- Avoir les certifications requises
- Proposer un partenariat local si nécessaire
- Démontrer votre expérience en Afrique de l'Ouest

### Sources consultées
${sourcesList}`;
  }

  // Generic analysis
  return `## 🔍 Analyse détaillée

### Synthèse
Basé sur l'analyse de **${docs.length} documents** de référence, voici mon évaluation :

### Contexte réglementaire
${docs.filter(d => d.type === "regulation").map(d => `- **${d.title}** : Les dispositions pertinentes s'appliquent à votre cas`).join("\n") || "- Le Code des Marchés Publics (2018) et son Décret d'application régissent la procédure"}

### Points clés identifiés
1. **Éligibilité** : Vérifiez que vous remplissez tous les critères de qualification (expérience 5 ans minimum, CA minimum 2x le montant)
2. **Procédure** : Le délai minimum de publication est de 30 jours (national) / 45 jours (international)
3. **Évaluation** : Les offres sont évaluées selon : qualité technique (40-60%), prix (30-50%), délais (10-20%)
4. **Préférence nationale** : Avantage de 15% pour les entreprises guinéennes, 10% pour le capital mixte

### Recommandation
Consultez les documents de référence ci-dessous pour affiner votre analyse et prendre une décision éclairée.

### Sources consultées
${sourcesList}`;
}

function generateDraftingResponse(
  query: string,
  docs: KnowledgeDocument[],
  _sourcesList: string,
  _modeLabel: string
): string {
  const isLettre = query.toLowerCase().includes("lettre") || query.toLowerCase().includes("manifestation");
  const isNote = query.toLowerCase().includes("note") || query.toLowerCase().includes("compréhension");
  const isMethodo = query.toLowerCase().includes("méthodologie") || query.toLowerCase().includes("méthode");

  if (isLettre) {
    return `## 📝 Lettre de manifestation d'intérêt

Voici une structure rédigée selon les standards guinéens :

---

**[EN-TÊTE DE L'ENTREPRISE]**
Raison sociale — NIF : [___] — RC : [___]

**Objet : Manifestation d'intérêt pour l'appel d'offres [Référence AO]**

Madame, Monsieur le Président de la Commission des Marchés,

Par la présente, [Nom de l'entreprise], société [forme juridique] au capital de [montant] GNF, immatriculée au Registre de Commerce sous le numéro [RC], déclare son intérêt pour participer à l'appel d'offres [référence] portant sur [objet du marché].

Notre entreprise dispose des compétences et de l'expérience requises pour répondre à ce marché, comme en témoignent nos références suivantes :

1. **[Projet 1]** — [Description] — [Montant] GNF — [Année] — [Maître d'ouvrage]
2. **[Projet 2]** — [Description] — [Montant] GNF — [Année] — [Maître d'ouvrage]
3. **[Projet 3]** — [Description] — [Montant] GNF — [Année] — [Maître d'ouvrage]

Nos moyens humains et techniques nous permettent de garantir la qualité d'exécution dans les délais requis.

Nous restons à votre disposition pour tout complément d'information.

Fait à Conakry, le [date]

**[Signature et Cachet]**

---

⚠️ **Documents à joindre** : KBIS, certificat de régularité fiscale, attestation CNPS, cautionnement provisoire

### Sources réglementaires
${docs.filter(d => d.type === "regulation" || d.type === "template").map(d => `- ${d.title}`).join("\n")}`;
  }

  if (isNote) {
    return `## 📝 Note de compréhension du besoin

Structure recommandée (pondération 15-25% de l'offre technique) :

### 1. Contexte et enjeux du projet (1-2 pages)
- Présentation du maître d'ouvrage et de son environnement
- Contexte stratégique du projet dans le paysage guinéen
- Enjeux identifiés et objectifs visés

### 2. Analyse des besoins (2-3 pages)
- Besoins fonctionnels identifiés dans le cahier des charges
- Besoins non fonctionnels (performance, sécurité, maintenabilité)
- Contraintes spécifiques au contexte guinéen

### 3. Compréhension des contraintes
- Contraintes réglementaires (Code des Marchés Publics, loi sur les données)
- Contraintes budgétaires et calendaires
- Contraintes techniques et opérationnelles

### 4. Vision et approche proposée (1-2 pages)
- Notre vision du projet
- Approche méthodologique préconisée
- Innovations et valeur ajoutée

### 5. Valeur ajoutée (1 page)
- Ce qui différencie notre compréhension
- Retours d'expérience sur des projets similaires en Guinée

💡 **Conseil** : Montrez que vous comprenez le contexte guinéen spécifique. Mentionnez les visites de terrain si effectuées.

### Sources
${docs.filter(d => d.type === "template" || d.type === "guide").map(d => `- ${d.title}`).join("\n")}`;
  }

  if (isMethodo) {
    return `## 📝 Plan méthodologique

Structure recommandée pour une soumission aux marchés publics guinéens :

### Phase 1 : Lancement et Diagnostic (Mois 1-2)
- Réunion de lancement avec le maître d'ouvrage
- État des lieux et diagnostic approfondi
- Validation des livrables de la phase
- **Jalon** : Rapport de diagnostic validé

### Phase 2 : Conception et Planification (Mois 3-4)
- Élaboration de la solution technique
- Planification détaillée (diagramme de Gantt)
- Définition des indicateurs de performance
- **Jalon** : Dossier de conception approuvé

### Phase 3 : Mise en œuvre (Mois 5-14)
- Déploiement progressif
- Formation des utilisateurs
- Tests et recettes intermédiaires
- **Jalon** : Rapports d'avancement mensuels

### Phase 4 : Recette et Clôture (Mois 15-18)
- Recette finale et correction des anomalies
- Documentation technique et utilisateur
- Transfert de compétences
- **Jalon** : PV de recette définitive

### Gestion des risques
- Comité de pilotage mensuel avec le maître d'ouvrage
- Plan de continuité d'activité
- Mesures d'atténuation spécifiques au contexte guinéen

### Sources
${docs.filter(d => d.type === "template" || d.type === "guide").map(d => `- ${d.title}`).join("\n")}`;
  }

  return `## 📝 Aide à la rédaction

Pour vous aider au mieux, précisez le type de document que vous souhaitez rédiger :

1. **Lettre de manifestation d'intérêt** — Pour exprimer votre intérêt à participer
2. **Note de compréhension** — Élément clé de l'offre technique (15-25%)
3. **Plan méthodologique** — Approche et phasage du projet
4. **Argumentaire technique** — Mise en valeur de votre solution
5. **Matrice de conformité** — Tableau de réponse aux exigences
6. **Analyse des risques** — Identification et mitigation des risques

### Formats réglementaires
- Police : 12pt, interligne 1.5
- Langue : Français uniquement
- Documents à joindre : KBIS, régularité fiscale, attestation CNPS

Quel document souhaitez-vous rédiger ?`;
}

function generateResearchResponse(
  query: string,
  docs: KnowledgeDocument[],
  _sourcesList: string,
  _modeLabel: string
): string {
  const regDocs = docs.filter((d) => d.type === "regulation");
  const guideDocs = docs.filter((d) => d.type === "guide");
  const faqDocs = docs.filter((d) => d.type === "faq");

  return `## 🔬 Résultats de recherche

### Informations trouvées
J'ai analysé **${docs.length} documents** de la base de connaissances. Voici les résultats :

${regDocs.length > 0 ? `### 📜 Cadre réglementaire applicable
${regDocs.map((d) => `**${d.title}**
${extractExcerpt(d.content, query, 250)}

`).join("\n")}` : ""}

${guideDocs.length > 0 ? `### 📋 Guides et bonnes pratiques
${guideDocs.map((d) => `**${d.title}**
${extractExcerpt(d.content, query, 250)}

`).join("\n")}` : ""}

${faqDocs.length > 0 ? `### ❓ Questions fréquentes
${faqDocs.map((d) => `**${d.title}**
${extractExcerpt(d.content, query, 250)}

`).join("\n")}` : ""}

### 📊 Données clés
- **8 régions administratives** en Guinée avec des spécificités propres
- **Seuils de passation** : International > 500M GNF, National 50-500M GNF, Consultation < 50M GNF
- **Préférence nationale** : 15% d'avantage pour les entreprises guinéennes
- **Croissance IT** : +22% par an dans les marchés publics digitaux

### Sources consultées
${docs.map((d, i) => `[${i + 1}] ${d.title} (${d.type})`).join("\n")}`;
}

function generateStrategyResponse(
  query: string,
  docs: KnowledgeDocument[],
  _sourcesList: string,
  _modeLabel: string
): string {
  return `## 🎯 Stratégie de soumission

### Analyse du positionnement
Basé sur l'analyse de **${docs.length} documents** de référence et le contexte guinéen :

### 1. Stratégie de différenciation
- **Connaissance locale** : Mettez en avant votre expérience en Guinée et votre compréhension du contexte institutionnel
- **Partenariats** : Envisagez un partenariat avec une entreprise locale si vous êtes étranger (préférence nationale de 15%)
- **Références** : Sélectionnez 3-5 références les plus pertinentes et récentes en Afrique de l'Ouest

### 2. Stratégie de prix
- **Benchmark** : Le prix doit être compétitif mais pas agressif — les évaluations guinéennes pondèrent la technique à 40-60%
- **Structure** : Proposez un bordereau des prix unitaires détaillé et transparent
- **Contingence** : Intégrez 10-15% de marge pour les aléas (taux de change, inflation)
- **Préférence nationale** : Si éligible, cette marge de 15% sur l'évaluation financière est un atout majeur

### 3. Plan d'action
| Semaine | Action | Responsable |
|---------|--------|-------------|
| S1 | Analyse détaillée du CdC | Chef de projet |
| S2 | Constitution du dossier administratif | Responsable qualité |
| S3 | Rédaction de l'offre technique | Équipe technique |
| S4 | Élaboration de l'offre financière | Direction financière |
| S5 | Relecture et soumission | Direction générale |

### 4. Points de vigilance
- ⚠️ **Délais** : Ne jamais sous-estimer les délais administratifs guinéens
- ⚠️ **Saisonnalité** : La saison des pluies (juin-octobre) impacte les projets BTP
- ⚠️ **Change** : Le taux GNF/USD est volatil — prévoir une clause de révision

### Sources
${docs.map((d) => `- ${d.title}`).join("\n")}`;
}

// ===== Confidence Calculator =====

function calculateConfidence(retrievedDocs: KnowledgeDocument[], query: string): number {
  if (retrievedDocs.length === 0) return 0.2;

  const avgRelevance = retrievedDocs.reduce((sum, doc) => sum + calculateRelevance(query, doc), 0) / retrievedDocs.length;
  const docTypeDiversity = new Set(retrievedDocs.map((d) => d.type)).size;
  const diversityBonus = Math.min(docTypeDiversity * 0.05, 0.15);

  return Math.min(Math.max(avgRelevance * 0.8 + diversityBonus + 0.1, 0.3), 0.98);
}

// ===== Main RAG Query Function =====

/**
 * Process a RAG query and return a structured response
 */
export function processRAGQuery(
  query: string,
  mode: ConversationMode = "analysis",
  _context?: string
): RAGResponse {
  const startTime = Date.now();

  // 1. Retrieve relevant documents
  const retrievedDocs = retrieveDocuments(query, 5);

  // 2. Generate contextual response
  const content = generateContextualResponse(query, mode, retrievedDocs);

  // 3. Format sources
  const sources: RAGSource[] = retrievedDocs.map((doc) => ({
    id: doc.id,
    title: doc.title,
    type: doc.type,
    excerpt: extractExcerpt(doc.content, query),
    relevance: Math.round(calculateRelevance(query, doc) * 100) / 100,
    url: doc.type === "tender" ? `https://tenderflow.gn/tenders/${doc.id}` : undefined,
  }));

  // 4. Calculate confidence
  const confidence = Math.round(calculateConfidence(retrievedDocs, query) * 100) / 100;

  // 5. Generate suggestions
  const suggestions = generateSuggestions(mode, query);

  const processingTime = Date.now() - startTime;

  return {
    content,
    sources,
    confidence,
    suggestions,
    mode,
    metadata: {
      retrievedDocs: retrievedDocs.length,
      processingTime,
      tokensUsed: Math.floor(content.length / 4) + Math.floor(query.length / 4),
    },
  };
}

// ===== Demo Conversation Generator =====

export function getDemoConversation(): RAGConversation {
  return {
    id: "demo-conv-001",
    title: "Analyse AO Pont Kouroussa — BTP",
    mode: "analysis",
    createdAt: new Date("2026-04-15T10:00:00Z"),
    updatedAt: new Date("2026-04-15T10:15:00Z"),
    messages: [
      {
        id: "demo-msg-001",
        role: "assistant",
        content: "Bonjour ! Je suis l'assistant RAG de TenderFlow Guinea. Je peux analyser les appels d'offres, vous aider à rédiger des réponses, effectuer des recherches réglementaires et élaborer des stratégies de soumission.\n\nComment puis-je vous aider aujourd'hui ?",
        timestamp: new Date("2026-04-15T10:00:00Z"),
        confidence: 0.95,
        sources: [],
        suggestions: [
          { id: "s-demo-1", label: "Analyser un AO BTP", prompt: "Analysez l'appel d'offres AO/MTP/2026/0142 pour la construction du pont sur le Niger à Kouroussa", icon: "Target" },
          { id: "s-demo-2", label: "Rédiger une lettre", prompt: "Aidez-moi à rédiger une lettre de manifestation d'intérêt pour un appel d'offres BTP", icon: "FileText" },
          { id: "s-demo-3", label: "Rechercher la réglementation", prompt: "Quelle réglementation s'applique aux appels d'offres internationaux en Guinée ?", icon: "Scale" },
        ],
        mode: "analysis",
      },
      {
        id: "demo-msg-002",
        role: "user",
        content: "Analysez l'appel d'offres AO/MTP/2026/0142 pour la construction du pont sur le Niger à Kouroussa. Est-ce une opportunité pertinente pour nous ?",
        timestamp: new Date("2026-04-15T10:02:00Z"),
      },
      {
        id: "demo-msg-003",
        role: "assistant",
        content: `## 🔍 Analyse de l'appel d'offres BTP

### Synthèse
L'appel d'offres **AO/MTP/2026/0142** pour la construction d'un pont de 320m sur le Niger à Kouroussa est une opportunité majeure du secteur BTP guinéen. Budget estimé : **15-25 milliards GNF**.

### Évaluation de l'opportunité
- **Secteur** : BTP — 35% des marchés publics en Guinée
- **Type** : Appel d'offres international — expérience de 10 ans requise en ouvrages d'art
- **Financement** : Budget national + BAD — sécurité financière assurée
- **Date limite** : 15 juin 2026 — **61 jours restants**

### Risques identifiés
1. **🔴 Critique** : Zone sismique classe II — études géotechniques approfondies obligatoires
2. **🟡 Modéré** : Logistique en zone intérieure — majoration de 15-25% à prévoir
3. **🟡 Modéré** : Saison des pluies (juin-octobre) peut impacter le planning de travaux
4. **🟢 Faible** : CA minimum 30 milliards GNF — vérifiez votre éligibilité

### Recommandation : ⚡ GO CONDITIONNEL
Participation recommandée sous réserve de :
- ✅ Vérification du CA minimum (2x le montant du marché)
- ✅ Disponibilité d'une équipe qualifiée en ouvrages d'art
- ✅ Capacité de cautionnement provisoire

**Score de compatibilité** : 85% | **Probabilité de gain** : 65%

### Sources consultées
[1] Code des Marchés Publics (2018), [2] Guide sectoriel BTP, [3] AO/MTP/2026/0142, [4] Décret d'application`,
        timestamp: new Date("2026-04-15T10:03:00Z"),
        confidence: 0.87,
        sources: [
          { id: "reg-001", title: "Code des Marchés Publics de la République de Guinée (2018)", type: "regulation", excerpt: "Les seuils de passation sont : appel d'offres international au-dessus de 500 millions GNF, appel d'offres national entre 50 et 500 millions GNF...", relevance: 0.92, url: undefined },
          { id: "guide-002", title: "Guide sectoriel BTP — Marchés publics guinéens", type: "guide", excerpt: "Le secteur BTP représente 35% des marchés publics en Guinée. Les principales autorités contractantes sont : le Ministère des Travaux Publics...", relevance: 0.89, url: undefined },
          { id: "ao-001", title: "AO/MTP/2026/0142 — Pont sur le Niger à Kouroussa", type: "tender", excerpt: "Appel d'offres international pour la conception et construction d'un pont routier de 320m sur le fleuve Niger. Budget : 15-25 milliards GNF.", relevance: 0.95, url: "https://tenderflow.gn/tenders/ao-001" },
          { id: "reg-002", title: "Décret d'application du Code des Marchés Publics", type: "regulation", excerpt: "Les critères d'évaluation des offres : qualité technique (40-60%), prix (30-50%), et délais de réalisation (10-20%)...", relevance: 0.78, url: undefined },
        ],
        suggestions: [
          { id: "s-demo-4", label: "Évaluer les risques détaillés", prompt: "Détaillez l'analyse des risques géotechniques et sismiques pour ce projet de pont", icon: "AlertTriangle" },
          { id: "s-demo-5", label: "Rédiger la lettre d'intérêt", prompt: "Rédigez une lettre de manifestation d'intérêt pour l'AO/MTP/2026/0142", icon: "FileText" },
          { id: "s-demo-6", label: "Stratégie de prix", prompt: "Proposez une stratégie de prix pour le pont de Kouroussa", icon: "DollarSign" },
        ],
        mode: "analysis",
      },
    ],
  };
}

// ===== Quick Action Prompts =====

export const quickActionPrompts: {
  icon: string;
  label: string;
  prompt: string;
  mode: ConversationMode;
}[] = [
  { icon: "Target", label: "Analyser un appel d'offres", prompt: "Analysez cet appel d'offres et déterminez s'il est pertinent pour mon entreprise", mode: "analysis" },
  { icon: "FileText", label: "Rédiger une réponse", prompt: "Aidez-moi à rédiger une lettre de manifestation d'intérêt pour un appel d'offres en Guinée", mode: "drafting" },
  { icon: "Sparkles", label: "Stratégie de soumission", prompt: "Quelle stratégie recommandez-vous pour maximiser nos chances de remporter un appel d'offres public en Guinée ?", mode: "strategy" },
  { icon: "AlertTriangle", label: "Évaluer les risques", prompt: "Quels sont les principaux risques à identifier dans un cahier des charges d'appel d'offres en Guinée ?", mode: "analysis" },
  { icon: "Scale", label: "Réglementation", prompt: "Quelle réglementation s'applique aux marchés publics en Guinée ?", mode: "research" },
  { icon: "CheckCircle", label: "Synthèse GO/NO-GO", prompt: "Produisez une synthèse GO/NO-GO pour un appel d'offres que j'analyse", mode: "analysis" },
];

// ===== Conversation Mode Info =====

export const conversationModes: {
  id: ConversationMode;
  label: string;
  description: string;
  icon: string;
  color: string;
}[] = [
  { id: "analysis", label: "Analyse", description: "Analyser les appels d'offres et évaluer les opportunités", icon: "Target", color: "text-emerald-600" },
  { id: "drafting", label: "Rédaction", description: "Rédiger des réponses et documents de soumission", icon: "FileText", color: "text-amber-600" },
  { id: "research", label: "Recherche", description: "Rechercher la réglementation et les bonnes pratiques", icon: "Search", color: "text-blue-600" },
  { id: "strategy", label: "Stratégie", description: "Élaborer des stratégies de soumission gagnantes", icon: "Rocket", color: "text-purple-600" },
];
