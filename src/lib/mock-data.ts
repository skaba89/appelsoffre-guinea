// ─── TenderFlow Guinea — Mock Data ────────────────────────────────────────────

export interface Tender {
  id: string;
  title: string;
  reference: string;
  description: string;
  sector: string;
  region: string;
  status: string;
  tender_type: string;
  deadline_date: string;
  budget_min: number;
  budget_max: number;
  publishing_authority: string;
  source_url: string;
  priority_score: number;
  compatibility_score: number;
  feasibility_score: number;
  win_probability_score: number;
  strategy_recommendation: string;
  created_at: string;
  updated_at: string;
}

export interface CRMAccount {
  id: string;
  name: string;
  sector: string;
  region: string;
  website: string;
  contact_count: number;
  opportunity_count: number;
  created_at: string;
}

export interface CRMContact {
  id: string;
  full_name: string;
  company: string;
  role: string;
  professional_email: string;
  professional_phone: string;
  validation_status: string;
  created_at: string;
}

export interface CRMOpportunity {
  id: string;
  title: string;
  account_id: string;
  account_name: string;
  contact_id: string;
  contact_name: string;
  tender_id: string | null;
  tender_ref: string | null;
  stage: string;
  amount: number;
  probability: number;
  created_at: string;
  expected_close_date: string;
}

export interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  tender_id: string | null;
  created_at: string;
}

export interface GeneratedPrompt {
  id: string;
  tender_id: string;
  tender_ref: string;
  prompt_type: string;
  content: string;
  created_at: string;
}

// ─── Tenders ──────────────────────────────────────────────────────────────────

export const mockTenders: Tender[] = [
  {
    id: "t-001",
    title: "Construction d'un pont sur le fleuve Niger à Kouroussa",
    reference: "AO/MTP/2026/0142",
    description: "Le Ministère des Travaux Publics lance un appel d'offres international pour la conception et la construction d'un pont routier de 320m sur le fleuve Niger, reliant les préfectures de Kouroussa et Kankan. Les travaux incluent les études géotechniques, la conception structurelle, la construction des fondations, des piles, du tablier et des accès routiers. Le maître d'ouvrage exige une expérience minimale de 10 ans dans la construction d'ouvrages d'art de taille similaire.",
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
    created_at: "2026-04-10T08:30:00Z",
    updated_at: "2026-04-12T14:20:00Z",
  },
  {
    id: "t-002",
    title: "Fourniture et installation de panneaux solaires pour 50 centres de santé",
    reference: "AO/DNE/2026/0087",
    description: "La Direction Nationale de l'Énergie recherche un prestataire pour la fourniture, l'installation et la maintenance de systèmes d'énergie solaire dans 50 centres de santé répartis dans les régions de Boké, Kindia et Nzérékoré. Chaque installation devra comprendre des panneaux solaires, des onduleurs, des batteries de stockage et un système de monitoring à distance.",
    sector: "Énergie",
    region: "National",
    status: "new",
    tender_type: "national",
    deadline_date: "2026-05-20",
    budget_min: 5000000000,
    budget_max: 8000000000,
    publishing_authority: "Direction Nationale de l'Énergie",
    source_url: "https://dne.gouv.gn/ao/0087",
    priority_score: 0.88,
    compatibility_score: 0.72,
    feasibility_score: 0.82,
    win_probability_score: 0.55,
    strategy_recommendation: "go_conditional",
    created_at: "2026-04-11T10:15:00Z",
    updated_at: "2026-04-11T10:15:00Z",
  },
  {
    id: "t-003",
    title: "Système d'information intégré pour la gestion des ressources minières",
    reference: "AO/SOGUIPAMI/2026/0023",
    description: "SOGUIPAMI lance un appel d'offres pour la conception, le développement et le déploiement d'un système d'information intégré pour la gestion des titres miniers, le suivi des redevances et la cartographie minière. La solution doit inclure un portail web, une application mobile, un SIG (Système d'Information Géographique) et un module de reporting avancé.",
    sector: "IT / Digital",
    region: "Conakry",
    status: "qualifying",
    tender_type: "international",
    deadline_date: "2026-05-10",
    budget_min: 3000000000,
    budget_max: 6000000000,
    publishing_authority: "SOGUIPAMI",
    source_url: "https://soguipami.gouv.gn/ao/023",
    priority_score: 0.95,
    compatibility_score: 0.90,
    feasibility_score: 0.88,
    win_probability_score: 0.72,
    strategy_recommendation: "go",
    created_at: "2026-04-09T14:00:00Z",
    updated_at: "2026-04-13T09:30:00Z",
  },
  {
    id: "t-004",
    title: "Réhabilitation du réseau d'adduction d'eau de Conakry — Phase 2",
    reference: "AO/SEG/2026/0198",
    description: "La Société des Eaux de Guinée (SEG) lance la phase 2 du projet de réhabilitation du réseau d'adduction d'eau de Conakry. Les travaux portent sur le remplacement de 45km de canalisations vétustes, la rénovation de 3 stations de pompage et l'installation de compteurs intelligents dans les communes de Kaloum et Dixinn.",
    sector: "Eau / Assainissement",
    region: "Conakry",
    status: "go",
    tender_type: "international",
    deadline_date: "2026-07-01",
    budget_min: 20000000000,
    budget_max: 35000000000,
    publishing_authority: "Société des Eaux de Guinée",
    source_url: "https://seg.gouv.gn/appels-offres/198",
    priority_score: 0.85,
    compatibility_score: 0.60,
    feasibility_score: 0.55,
    win_probability_score: 0.35,
    strategy_recommendation: "go_conditional",
    created_at: "2026-04-08T09:45:00Z",
    updated_at: "2026-04-14T11:00:00Z",
  },
  {
    id: "t-005",
    title: "Équipement informatique et connectivité pour 200 écoles primaires",
    reference: "AO/MEPU/2026/0156",
    description: "Le Ministère de l'Éducation Primaire lance un appel d'offres pour l'équipement informatique de 200 écoles primaires dans les 8 régions administratives. Chaque école recevra 10 ordinateurs portables, une connexion satellite, un vidéo-projecteur et du contenu éducatif numérique en français et dans les langues locales.",
    sector: "Éducation",
    region: "National",
    status: "new",
    tender_type: "national",
    deadline_date: "2026-05-30",
    budget_min: 4000000000,
    budget_max: 7000000000,
    publishing_authority: "Ministère de l'Éducation",
    source_url: "https://education.gouv.gn/ao/156",
    priority_score: 0.78,
    compatibility_score: 0.65,
    feasibility_score: 0.80,
    win_probability_score: 0.48,
    strategy_recommendation: "go_conditional",
    created_at: "2026-04-12T07:20:00Z",
    updated_at: "2026-04-12T07:20:00Z",
  },
  {
    id: "t-006",
    title: "Services de conseil en restructuration organisationnelle — ONGUI",
    reference: "AO/ONGUI/2026/0012",
    description: "L'Office National de Gestion Urbaine invite des cabinets de conseil à soumettre des propositions pour une mission de restructuration organisationnelle incluant un audit organisationnel, une refonte des processus métier, un plan de formation et un accompagnement au changement sur 18 mois.",
    sector: "Conseil",
    region: "Conakry",
    status: "responding",
    tender_type: "national",
    deadline_date: "2026-04-25",
    budget_min: 500000000,
    budget_max: 1200000000,
    publishing_authority: "Office National de Gestion Urbaine",
    source_url: "https://ongui.gouv.gn/ao/012",
    priority_score: 0.82,
    compatibility_score: 0.88,
    feasibility_score: 0.92,
    win_probability_score: 0.75,
    strategy_recommendation: "go",
    created_at: "2026-04-05T16:30:00Z",
    updated_at: "2026-04-15T08:45:00Z",
  },
  {
    id: "t-007",
    title: "Construction de la route Boké-Kamsar — 85km bitumé",
    reference: "AO/MTP/2026/0201",
    description: "Projet de construction d'une route bitumée de 85km reliant Boké à Kamsar, incluant 3 ouvrages d'art, la signalisation horizontale et verticale, et les aménagements de drainage. Financement Banque Mondiale. Le projet nécessite une expérience avérée dans les grands travaux routiers en Afrique de l'Ouest.",
    sector: "BTP",
    region: "Boké",
    status: "new",
    tender_type: "international",
    deadline_date: "2026-06-30",
    budget_min: 40000000000,
    budget_max: 60000000000,
    publishing_authority: "Ministère des Travaux Publics",
    source_url: "https://mpw.gouv.gn/appels-offres/0201",
    priority_score: 0.70,
    compatibility_score: 0.40,
    feasibility_score: 0.35,
    win_probability_score: 0.20,
    strategy_recommendation: "no_go",
    created_at: "2026-04-13T11:00:00Z",
    updated_at: "2026-04-13T11:00:00Z",
  },
  {
    id: "t-008",
    title: "Mise en place d'un système de télécommunication 4G pour zones rurales",
    reference: "AO/ARTP/2026/0045",
    description: "L'Autorité de Régulation des Télécommunications lance un appel d'offres pour le déploiement d'un réseau 4G couvrant 150 localités rurales dans les régions de Labé, Faranah et Mamou. Le projet inclut l'installation de 80 stations de base, le raccordement en fibre optique et la mise en service du réseau.",
    sector: "Télécom",
    region: "National",
    status: "qualifying",
    tender_type: "international",
    deadline_date: "2026-05-25",
    budget_min: 12000000000,
    budget_max: 18000000000,
    publishing_authority: "Autorité de Régulation des Télécommunications",
    source_url: "https://artp.gouv.gn/ao/045",
    priority_score: 0.86,
    compatibility_score: 0.50,
    feasibility_score: 0.62,
    win_probability_score: 0.38,
    strategy_recommendation: "go_conditional",
    created_at: "2026-04-10T15:30:00Z",
    updated_at: "2026-04-14T10:15:00Z",
  },
  {
    id: "t-009",
    title: "Fourniture de matériels et réactifs de laboratoire — CHU de Conakry",
    reference: "AO/MS/2026/0078",
    description: "Le Centre Hospitalier Universitaire de Conakry recherche un fournisseur pour la livraison de matériels de laboratoire, réactifs et consommables pour une durée de 2 ans. Le marché inclut l'installation, la formation du personnel technique et la maintenance des équipements fournis.",
    sector: "Santé",
    region: "Conakry",
    status: "go",
    tender_type: "national",
    deadline_date: "2026-05-05",
    budget_min: 1500000000,
    budget_max: 3000000000,
    publishing_authority: "Ministère de la Santé",
    source_url: "https://ms.gouv.gn/ao/078",
    priority_score: 0.75,
    compatibility_score: 0.55,
    feasibility_score: 0.70,
    win_probability_score: 0.45,
    strategy_recommendation: "go_conditional",
    created_at: "2026-04-07T08:00:00Z",
    updated_at: "2026-04-11T13:30:00Z",
  },
  {
    id: "t-010",
    title: "Audit et certification des comptes — Exercice 2025-2026",
    reference: "AO/MF/2026/0034",
    description: "Le Ministère des Finances lance un appel d'offres pour l'audit et la certification des comptes de 15 établissements publics pour l'exercice 2025-2026. Les missions incluent l'audit financier, le contrôle de conformité et l'émission de rapports de certification selon les normes ISA.",
    sector: "Finance",
    region: "Conakry",
    status: "qualified",
    tender_type: "national",
    deadline_date: "2026-04-28",
    budget_min: 800000000,
    budget_max: 1500000000,
    publishing_authority: "Ministère des Finances",
    source_url: "https://mf.gouv.gn/ao/034",
    priority_score: 0.80,
    compatibility_score: 0.82,
    feasibility_score: 0.90,
    win_probability_score: 0.68,
    strategy_recommendation: "go",
    created_at: "2026-04-04T12:00:00Z",
    updated_at: "2026-04-15T16:00:00Z",
  },
  {
    id: "t-011",
    title: "Programme d'appui à la filière rizicole en Guinée Forestière",
    reference: "AO/MA/2026/0067",
    description: "Le Ministère de l'Agriculture, avec le financement du FIDA, lance un programme d'appui à la filière rizicole dans la région de Nzérékoré. Le projet couvre 5000 hectares d'aménagements hydro-agricoles, la distribution de semences améliorées, la formation de 3000 producteurs et la mise en place de 20 unités de transformation.",
    sector: "Agriculture",
    region: "Nzérékoré",
    status: "new",
    tender_type: "international",
    deadline_date: "2026-06-20",
    budget_min: 8000000000,
    budget_max: 12000000000,
    publishing_authority: "Ministère de l'Agriculture",
    source_url: "https://agriculture.gouv.gn/ao/067",
    priority_score: 0.72,
    compatibility_score: 0.35,
    feasibility_score: 0.42,
    win_probability_score: 0.25,
    strategy_recommendation: "no_go",
    created_at: "2026-04-14T09:00:00Z",
    updated_at: "2026-04-14T09:00:00Z",
  },
  {
    id: "t-012",
    title: "Sécurisation informatique et cybersécurité — Administration publique",
    reference: "AO/AGUIPE/2026/0019",
    description: "L'Agence Guinéenne de l'Informatique et des Procédures Électroniques lance un marché pour la sécurisation des systèmes d'information de l'administration publique. Le prestataire devra réaliser un audit de sécurité, déployer une solution SOC (Security Operations Center), former les équipes internes et assurer la veille en cybersécurité pour 24 mois.",
    sector: "IT / Digital",
    region: "Conakry",
    status: "qualifying",
    tender_type: "international",
    deadline_date: "2026-05-15",
    budget_min: 2000000000,
    budget_max: 4500000000,
    publishing_authority: "AGUIPE",
    source_url: "https://aguipe.gouv.gn/ao/019",
    priority_score: 0.91,
    compatibility_score: 0.78,
    feasibility_score: 0.85,
    win_probability_score: 0.60,
    strategy_recommendation: "go",
    created_at: "2026-04-06T14:45:00Z",
    updated_at: "2026-04-13T17:00:00Z",
  },
  {
    id: "t-013",
    title: "Maintenance préventive des équipements miniers — Compagnie des Bauxites",
    reference: "AO/CBD/2026/0056",
    description: "La Compagnie des Bauxites de Kindia recherche un prestataire spécialisé pour la maintenance préventive et corrective de ses équipements miniers lourds (bulldozers, pelles hydrauliques, chargeuses, camions-bennes). Contrat de 3 ans renouvelable avec engagement de disponibilité minimale de 85% du parc machines.",
    sector: "Mines",
    region: "Kindia",
    status: "expired",
    tender_type: "national",
    deadline_date: "2026-03-31",
    budget_min: 5000000000,
    budget_max: 8000000000,
    publishing_authority: "Compagnie des Bauxites de Kindia",
    source_url: "https://cbk.gouv.gn/ao/056",
    priority_score: 0.45,
    compatibility_score: 0.30,
    feasibility_score: 0.40,
    win_probability_score: 0.15,
    strategy_recommendation: "no_go",
    created_at: "2026-02-15T10:00:00Z",
    updated_at: "2026-04-01T08:00:00Z",
  },
  {
    id: "t-014",
    title: "Système de gestion de la maintenance industrielle — SIGG",
    reference: "AO/SIGG/2026/0031",
    description: "La Société Interprofessionnelle du Gaz de Guinée souhaite mettre en place un système GMAO (Gestion de Maintenance Assistée par Ordinateur) intégré couvrant la planification, le suivi des interventions, la gestion des stocks pièces de rechange et l'analyse des coûts de maintenance.",
    sector: "Industrie",
    region: "Conakry",
    status: "won",
    tender_type: "national",
    deadline_date: "2026-03-15",
    budget_min: 600000000,
    budget_max: 1000000000,
    priority_score: 0.88,
    compatibility_score: 0.92,
    feasibility_score: 0.95,
    win_probability_score: 0.82,
    strategy_recommendation: "go",
    publishing_authority: "Société Interprofessionnelle du Gaz de Guinée",
    source_url: "https://sigg.gouv.gn/ao/031",
    created_at: "2026-02-01T08:30:00Z",
    updated_at: "2026-03-16T14:00:00Z",
  },
  {
    id: "t-015",
    title: "Service de gardiennage et sécurité — Bâtiments publics de Kankan",
    reference: "AO/SGG/2026/0089",
    description: "Le Secrétariat Général du Gouvernement lance un appel d'offres pour le service de gardiennage et de sécurité de 25 bâtiments publics dans la région de Kankan. Le marché prévoit 120 agents de sécurité, un système de vidéosurveillance et un centre de supervision opérationnel 24h/24.",
    sector: "Sécurité",
    region: "Kankan",
    status: "new",
    tender_type: "national",
    deadline_date: "2026-05-12",
    budget_min: 2000000000,
    budget_max: 3500000000,
    publishing_authority: "Secrétariat Général du Gouvernement",
    source_url: "https://sgg.gouv.gn/ao/089",
    priority_score: 0.55,
    compatibility_score: 0.20,
    feasibility_score: 0.30,
    win_probability_score: 0.12,
    strategy_recommendation: "no_go",
    created_at: "2026-04-15T06:30:00Z",
    updated_at: "2026-04-15T06:30:00Z",
  },
];

// ─── CRM Accounts ─────────────────────────────────────────────────────────────

export const mockAccounts: CRMAccount[] = [
  { id: "a-001", name: "Ministère des Travaux Publics", sector: "BTP", region: "Conakry", website: "https://mpw.gouv.gn", contact_count: 3, opportunity_count: 2, created_at: "2026-01-15T10:00:00Z" },
  { id: "a-002", name: "Direction Nationale de l'Énergie", sector: "Énergie", region: "Conakry", website: "https://dne.gouv.gn", contact_count: 2, opportunity_count: 1, created_at: "2026-02-01T09:00:00Z" },
  { id: "a-003", name: "SOGUIPAMI", sector: "Mines", region: "Conakry", website: "https://soguipami.gouv.gn", contact_count: 2, opportunity_count: 1, created_at: "2026-01-20T14:00:00Z" },
  { id: "a-004", name: "Société des Eaux de Guinée", sector: "Eau / Assainissement", region: "Conakry", website: "https://seg.gouv.gn", contact_count: 1, opportunity_count: 1, created_at: "2026-03-05T08:30:00Z" },
  { id: "a-005", name: "Ministère de l'Éducation", sector: "Éducation", region: "Conakry", website: "https://education.gouv.gn", contact_count: 2, opportunity_count: 1, created_at: "2026-02-10T11:00:00Z" },
  { id: "a-006", name: "AGUIPE", sector: "IT / Digital", region: "Conakry", website: "https://aguipe.gouv.gn", contact_count: 2, opportunity_count: 2, created_at: "2026-01-25T16:00:00Z" },
  { id: "a-007", name: "Compagnie des Bauxites de Kindia", sector: "Mines", region: "Kindia", website: "https://cbk.gouv.gn", contact_count: 1, opportunity_count: 0, created_at: "2026-03-15T10:30:00Z" },
  { id: "a-008", name: "Ministère de la Santé", sector: "Santé", region: "Conakry", website: "https://ms.gouv.gn", contact_count: 1, opportunity_count: 1, created_at: "2026-02-20T09:15:00Z" },
];

// ─── CRM Contacts (Professional only) ────────────────────────────────────────

export const mockContacts: CRMContact[] = [
  { id: "c-001", full_name: "Abdoulaye Soumah", company: "Ministère des Travaux Publics", role: "Directeur des Marchés Publics", professional_email: "a.soumah@mpw.gouv.gn", professional_phone: "+224 622 00 11 22", validation_status: "validated", created_at: "2026-01-15T10:00:00Z" },
  { id: "c-002", full_name: "Fatoumata Binta Bah", company: "Direction Nationale de l'Énergie", role: "Chef de Service Achats", professional_email: "fb.bah@dne.gouv.gn", professional_phone: "+224 622 00 33 44", validation_status: "validated", created_at: "2026-02-01T09:00:00Z" },
  { id: "c-003", full_name: "Ibrahima Keita", company: "SOGUIPAMI", role: "Responsable Informatique", professional_email: "i.keita@soguipami.gouv.gn", professional_phone: "+224 622 00 55 66", validation_status: "validated", created_at: "2026-01-20T14:00:00Z" },
  { id: "c-004", full_name: "Mariama Condé", company: "Société des Eaux de Guinée", role: "Directrice Générale Adjointe", professional_email: "m.conde@seg.gouv.gn", professional_phone: "+224 622 00 77 88", validation_status: "pending", created_at: "2026-03-05T08:30:00Z" },
  { id: "c-005", full_name: "Moussa Camara", company: "Ministère de l'Éducation", role: "Secrétaire Général", professional_email: "m.camara@education.gouv.gn", professional_phone: "+224 622 00 99 00", validation_status: "validated", created_at: "2026-02-10T11:00:00Z" },
  { id: "c-006", full_name: "Aissatou Diallo", company: "AGUIPE", role: "Directrice Technique", professional_email: "a.diallo@aguipe.gouv.gn", professional_phone: "+224 622 11 22 33", validation_status: "validated", created_at: "2026-01-25T16:00:00Z" },
  { id: "c-007", full_name: "Oumar Sylla", company: "Ministère des Travaux Publics", role: "Ingénieur en Chef", professional_email: "o.sylla@mpw.gouv.gn", professional_phone: "+224 622 11 44 55", validation_status: "validated", created_at: "2026-01-15T10:00:00Z" },
  { id: "c-008", full_name: "Kadiatou Touré", company: "AGUIPE", role: "Chef de Projet Cybersécurité", professional_email: "k.toure@aguipe.gouv.gn", professional_phone: "+224 622 11 66 77", validation_status: "pending", created_at: "2026-01-25T16:00:00Z" },
  { id: "c-009", full_name: "Lamine Fofana", company: "Ministère de l'Éducation", role: "Directeur des Technologies Éducatives", professional_email: "l.fofana@education.gouv.gn", professional_phone: "+224 622 11 88 99", validation_status: "validated", created_at: "2026-02-10T11:00:00Z" },
  { id: "c-010", full_name: "Aminata Sow", company: "Direction Nationale de l'Énergie", role: "Ingénieure Énergie Solaire", professional_email: "a.sow@dne.gouv.gn", professional_phone: "+224 622 22 00 11", validation_status: "validated", created_at: "2026-02-01T09:00:00Z" },
  { id: "c-011", full_name: "Boubacar Barry", company: "Compagnie des Bauxites de Kindia", role: "Responsable Achats", professional_email: "b.barry@cbk.gouv.gn", professional_phone: "+224 622 22 33 44", validation_status: "validated", created_at: "2026-03-15T10:30:00Z" },
  { id: "c-012", full_name: "Hawa Dioubaté", company: "Ministère de la Santé", role: "Pharmacienne Chef", professional_email: "h.dioubate@ms.gouv.gn", professional_phone: "+224 622 22 55 66", validation_status: "validated", created_at: "2026-02-20T09:15:00Z" },
];

// ─── CRM Opportunities ────────────────────────────────────────────────────────

export const mockOpportunities: CRMOpportunity[] = [
  { id: "o-001", title: "Construction pont Kouroussa", account_id: "a-001", account_name: "Ministère des Travaux Publics", contact_id: "c-001", contact_name: "Abdoulaye Soumah", tender_id: "t-001", tender_ref: "AO/MTP/2026/0142", stage: "proposal", amount: 20000000000, probability: 0.65, created_at: "2026-04-10T08:30:00Z", expected_close_date: "2026-06-15" },
  { id: "o-002", title: "Panneaux solaires centres de santé", account_id: "a-002", account_name: "Direction Nationale de l'Énergie", contact_id: "c-002", contact_name: "Fatoumata Binta Bah", tender_id: "t-002", tender_ref: "AO/DNE/2026/0087", stage: "qualification", amount: 6500000000, probability: 0.55, created_at: "2026-04-11T10:15:00Z", expected_close_date: "2026-05-20" },
  { id: "o-003", title: "SIG ressources minières", account_id: "a-003", account_name: "SOGUIPAMI", contact_id: "c-003", contact_name: "Ibrahima Keita", tender_id: "t-003", tender_ref: "AO/SOGUIPAMI/2026/0023", stage: "negotiation", amount: 4500000000, probability: 0.72, created_at: "2026-04-09T14:00:00Z", expected_close_date: "2026-05-10" },
  { id: "o-004", title: "Réseau eau Conakry Phase 2", account_id: "a-004", account_name: "Société des Eaux de Guinée", contact_id: "c-004", contact_name: "Mariama Condé", tender_id: "t-004", tender_ref: "AO/SEG/2026/0198", stage: "prospect", amount: 27500000000, probability: 0.35, created_at: "2026-04-08T09:45:00Z", expected_close_date: "2026-07-01" },
  { id: "o-005", title: "Cybersécurité Administration", account_id: "a-006", account_name: "AGUIPE", contact_id: "c-006", contact_name: "Aissatou Diallo", tender_id: "t-012", tender_ref: "AO/AGUIPE/2026/0019", stage: "proposal", amount: 3250000000, probability: 0.60, created_at: "2026-04-06T14:45:00Z", expected_close_date: "2026-05-15" },
  { id: "o-006", title: "GMAO SIGG", account_id: "a-003", account_name: "SOGUIPAMI", contact_id: "c-003", contact_name: "Ibrahima Keita", tender_id: "t-014", tender_ref: "AO/SIGG/2026/0031", stage: "won", amount: 800000000, probability: 1.0, created_at: "2026-02-01T08:30:00Z", expected_close_date: "2026-03-15" },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: Alert[] = [
  { id: "al-001", type: "deadline", title: "Échéance proche : Audit comptable MF", message: "L'appel d'offres AO/MF/2026/0034 expire dans 10 jours.", is_read: false, tender_id: "t-010", created_at: "2026-04-15T06:00:00Z" },
  { id: "al-002", type: "new_tender", title: "Nouvel AO : Sécurité bâtiments Kankan", message: "Un nouvel appel d'offres a été publié dans le secteur Sécurité.", is_read: false, tender_id: "t-015", created_at: "2026-04-15T06:30:00Z" },
  { id: "al-003", type: "score", title: "Score élevé : SIG ressources minières", message: "L'AO SOGUIPAMI a un score de compatibilité de 90%.", is_read: true, tender_id: "t-003", created_at: "2026-04-13T10:00:00Z" },
  { id: "al-004", type: "deadline", title: "Échéance proche : Conseil ONGUI", message: "L'appel d'offres ONGUI expire dans 7 jours.", is_read: false, tender_id: "t-006", created_at: "2026-04-14T08:00:00Z" },
  { id: "al-005", type: "system", title: "Nouvelle source ajoutée", message: "La source 'Journal Officiel de la République' a été ajoutée.", is_read: true, tender_id: null, created_at: "2026-04-12T14:00:00Z" },
  { id: "al-006", type: "match", title: "Correspondance élevée : Cybersécurité AGUIPE", message: "Cet AO correspond à 78% à votre profil entreprise.", is_read: false, tender_id: "t-012", created_at: "2026-04-14T16:00:00Z" },
  { id: "al-007", type: "deadline", title: "Échéance : Matériels CHU Conakry", message: "L'appel d'offres du CHU expire dans 17 jours.", is_read: true, tender_id: "t-009", created_at: "2026-04-10T09:00:00Z" },
  { id: "al-008", type: "new_tender", title: "Nouvel AO : Énergie solaire", message: "Un nouvel appel d'offres a été publié par la DNE.", is_read: true, tender_id: "t-002", created_at: "2026-04-11T10:30:00Z" },
  { id: "al-009", type: "system", title: "Rapport hebdomadaire disponible", message: "Le rapport de la semaine 15 est prêt.", is_read: false, tender_id: null, created_at: "2026-04-15T07:00:00Z" },
  { id: "al-010", type: "match", title: "Correspondance : IT SOGUIPAMI", message: "L'AO SOGUIPAMI correspond à 90% à votre profil.", is_read: true, tender_id: "t-003", created_at: "2026-04-09T15:00:00Z" },
];

// ─── Generated Prompts ───────────────────────────────────────────────────────

export const PROMPT_TYPES = [
  "analyse_opportunite",
  "lettre_manifestation",
  "note_comprehension",
  "strategie_reponse",
  "plan_methodologique",
  "matrice_conformite",
  "argumentaire_technique",
  "planification_ressources",
  "analyse_risques",
  "synthese_go_nogo",
];

export const PROMPT_TYPE_LABELS: Record<string, string> = {
  analyse_opportunite: "Analyse d'opportunité",
  lettre_manifestation: "Lettre de manifestation",
  note_comprehension: "Note de compréhension",
  strategie_reponse: "Stratégie de réponse",
  plan_methodologique: "Plan méthodologique",
  matrice_conformite: "Matrice de conformité",
  argumentaire_technique: "Argumentaire technique",
  planification_ressources: "Planification des ressources",
  analyse_risques: "Analyse des risques",
  synthese_go_nogo: "Synthèse GO/NO-GO",
};

export const mockPrompts: GeneratedPrompt[] = [
  { id: "p-001", tender_id: "t-003", tender_ref: "AO/SOGUIPAMI/2026/0023", prompt_type: "analyse_opportunite", content: "Analysez l'opportunité de répondre à l'appel d'offres SOGUIPAMI pour un système d'information intégré de gestion des ressources minières. Évaluez l'adéquation avec nos compétences en développement de SI, notre expérience dans le secteur minier guinéen, et notre capacité à livrer dans les délais. Identifiez les forces et faiblesses de notre positionnement.", created_at: "2026-04-09T15:00:00Z" },
  { id: "p-002", tender_id: "t-003", tender_ref: "AO/SOGUIPAMI/2026/0023", prompt_type: "strategie_reponse", content: "Élaborez une stratégie de réponse pour l'AO SOGUIPAMI en mettant en avant notre expertise en SIG, notre connaissance du contexte réglementaire minier guinéen, et nos partenariats techniques. Proposez un angle de différenciation par rapport aux concurrents internationaux.", created_at: "2026-04-09T15:01:00Z" },
  { id: "p-003", tender_id: "t-001", tender_ref: "AO/MTP/2026/0142", prompt_type: "analyse_risques", content: "Identifiez et évaluez les risques techniques, financiers et opérationnels liés à la construction du pont sur le Niger à Kouroussa. Incluez les risques géotechniques, logistiques, météorologiques et réglementaires spécifiques au contexte guinéen.", created_at: "2026-04-10T09:00:00Z" },
  { id: "p-004", tender_id: "t-006", tender_ref: "AO/ONGUI/2026/0012", prompt_type: "plan_methodologique", content: "Rédigez un plan méthodologique pour la mission de restructuration organisationnelle de l'ONGUI. Décrivez l'approche en 4 phases : diagnostic, conception, mise en œuvre, suivi. Intégrez les bonnes pratiques de conduite du changement adaptées au contexte administratif guinéen.", created_at: "2026-04-05T17:00:00Z" },
  { id: "p-005", tender_id: "t-012", tender_ref: "AO/AGUIPE/2026/0019", prompt_type: "synthese_go_nogo", content: "Produisez une synthèse GO/NO-GO pour l'appel d'offres cybersécurité AGUIPE. Analysez les critères d'éligibilité, notre correspondance technique, les ressources nécessaires, le niveau de concurrence attendu et la rentabilité potentielle du marché.", created_at: "2026-04-06T16:00:00Z" },
  { id: "p-006", tender_id: "t-010", tender_ref: "AO/MF/2026/0034", prompt_type: "lettre_manifestation", content: "Rédigez une lettre de manifestation d'intérêt pour l'audit des comptes des établissements publics, en soulignant notre certification, nos références en audit public et notre connaissance du cadre budgétaire guinéen.", created_at: "2026-04-04T13:00:00Z" },
  { id: "p-007", tender_id: "t-002", tender_ref: "AO/DNE/2026/0087", prompt_type: "argumentaire_technique", content: "Développez un argumentaire technique pour la fourniture et l'installation de panneaux solaires dans les centres de santé. Mettez en avant la robustesse des équipements en climat tropical, le monitoring à distance, la formation du personnel local et la garantie de performance.", created_at: "2026-04-11T11:00:00Z" },
  { id: "p-008", tender_id: "t-001", tender_ref: "AO/MTP/2026/0142", prompt_type: "planification_ressources", content: "Planifiez les ressources humaines et matérielles nécessaires pour la construction du pont de Kouroussa. Estimez les effectifs par spécialité, les équipements lourds requis, la logistique d'approvisionnement et le calendrier prévisionnel des travaux.", created_at: "2026-04-10T09:01:00Z" },
];

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export const mockDashboardStats = {
  total_tenders: 15,
  new_today: 3,
  deadline_soon: 4,
  avg_priority_score: 0.79,
  by_strategy: {
    go: 4,
    go_conditional: 5,
    no_go: 3,
    none: 3,
  },
  by_status: {
    new: 4,
    qualifying: 2,
    qualified: 2,
    go: 2,
    responding: 1,
    expired: 1,
    won: 1,
    lost: 0,
  },
  by_sector: {
    "BTP": 2,
    "IT / Digital": 2,
    "Énergie": 1,
    "Mines": 1,
    "Agriculture": 1,
    "Santé": 1,
    "Éducation": 1,
    "Conseil": 1,
    "Finance": 1,
    "Eau / Assainissement": 1,
    "Télécom": 1,
    "Sécurité": 1,
    "Industrie": 1,
  },
  monthly_trend: [
    { month: "Nov", tenders: 8, won: 1 },
    { month: "Déc", tenders: 12, won: 2 },
    { month: "Jan", tenders: 15, won: 1 },
    { month: "Fév", tenders: 10, won: 2 },
    { month: "Mar", tenders: 18, won: 3 },
    { month: "Avr", tenders: 15, won: 1 },
  ],
};

export const mockPipelineStats = {
  total_contacts: 12,
  total_accounts: 8,
  pipeline: {
    prospect: { count: 1, total_amount: 27500000000 },
    qualification: { count: 1, total_amount: 6500000000 },
    proposal: { count: 2, total_amount: 23250000000 },
    negotiation: { count: 1, total_amount: 4500000000 },
    won: { count: 1, total_amount: 800000000 },
    lost: { count: 0, total_amount: 0 },
  },
};
