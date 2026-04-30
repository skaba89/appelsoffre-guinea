/**
 * TenderFlow Guinea — Shared Types & Constants
 *
 * Shared type definitions used across frontend, backend, and services.
 */

// ─── Roles ──────────────────────────────────────────────────
export type UserRole =
  | "super_admin"
  | "tenant_admin"
  | "analyst"
  | "sales"
  | "bid_manager"
  | "viewer";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Administrateur",
  tenant_admin: "Administrateur",
  analyst: "Analyste",
  sales: "Commercial",
  bid_manager: "Répondant AO",
  viewer: "Lecteur",
};

// ─── Tender ─────────────────────────────────────────────────
export type TenderStatus =
  | "new"
  | "qualifying"
  | "qualified"
  | "go"
  | "no_go"
  | "responding"
  | "won"
  | "lost"
  | "expired";

export type TenderType = "public" | "private" | "restricted" | "open";

export type StrategyRecommendation = "go" | "go_conditional" | "no_go";

export interface Tender {
  id: string;
  tenant_id: string;
  reference: string;
  title: string;
  tender_type: TenderType;
  organization: string | null;
  sector: string | null;
  subsector: string | null;
  description: string | null;
  region: string | null;
  publication_date: string | null;
  deadline_date: string | null;
  budget_estimated: number | null;
  currency: string;
  is_public: boolean;
  status: TenderStatus;
  priority_score: number;
  compatibility_score: number;
  feasibility_score: number;
  win_probability: number;
  strategy_recommendation: StrategyRecommendation | null;
  ai_summary: string | null;
  checklist_items: Record<string, any> | null;
  documents?: TenderDocument[];
  scores?: TenderScore[];
  created_at: string;
  updated_at: string;
}

export interface TenderDocument {
  id: string;
  tender_id: string;
  original_filename: string;
  storage_path: string;
  file_size: number;
  mime_type: string;
  is_ingested: boolean;
  created_at: string;
}

export interface TenderScore {
  id: string;
  tender_id: string;
  score_type: string;
  score_value: number;
  weight: number;
  calculated_at: string;
}

// ─── CRM ────────────────────────────────────────────────────
export type CRMAccountType = "buyer" | "company" | "partner" | "competitor";

export interface CRMAccount {
  id: string;
  tenant_id: string;
  name: string;
  type: CRMAccountType;
  sector: string | null;
  website: string | null;
  city: string | null;
  country: string;
  is_public_buyer: boolean;
  source_url: string | null;
  source_label: string | null;
}

export type ContactValidationStatus = "pending" | "verified" | "rejected";

export interface CRMContact {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  professional_email: string | null;
  professional_phone: string | null;
  organization_name: string | null;
  institutional_page: string | null;
  source_url: string | null;
  source_label: string | null;
  date_collected: string | null;
  validation_status: ContactValidationStatus;
}

export type OpportunityStage =
  | "prospecting"
  | "qualification"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface CRMOpportunity {
  id: string;
  tenant_id: string;
  name: string;
  stage: OpportunityStage;
  amount: number | null;
  currency: string;
  probability: number;
  close_date: string | null;
}

// ─── Sectors ────────────────────────────────────────────────
export const SECTORS = [
  "BTP",
  "IT / Digital",
  "Énergie",
  "Mines",
  "Agriculture",
  "Santé",
  "Éducation",
  "Conseil",
  "Fournitures",
  "Logistique",
  "Maintenance",
  "Sécurité",
  "Télécom",
  "Industrie",
  "Finance",
  "Eau / Assainissement",
  "Autres",
] as const;

export type Sector = (typeof SECTORS)[number];

// ─── Regions ────────────────────────────────────────────────
export const REGIONS = [
  "Conakry",
  "Kindia",
  "Boké",
  "Labé",
  "Faranah",
  "Kankan",
  "Nzérékoré",
  "Mamou",
  "National",
] as const;

export type Region = (typeof REGIONS)[number];

// ─── Prompt Types ───────────────────────────────────────────
export const PROMPT_TYPES = [
  "dao_analysis",
  "technical_memo",
  "financial_offer",
  "company_presentation",
  "project_planning",
  "document_list",
  "oral_defense",
  "partner_search",
  "competition_benchmark",
  "professional_email",
] as const;

export type PromptType = (typeof PROMPT_TYPES)[number];

export const PROMPT_TYPE_LABELS: Record<PromptType, string> = {
  dao_analysis: "Analyse du DAO",
  technical_memo: "Mémoire technique",
  financial_offer: "Offre financière",
  company_presentation: "Présentation entreprise",
  project_planning: "Planning projet",
  document_list: "Liste documents",
  oral_defense: "Soutenance orale",
  partner_search: "Recherche partenaires",
  competition_benchmark: "Benchmark concurrence",
  professional_email: "Email professionnel",
};

// ─── Subscription Plans ─────────────────────────────────────
export type PlanType = "free" | "pro" | "business" | "enterprise";

export interface PlanQuotas {
  max_users: number;
  max_tenders: number;
  max_sources: number;
  rag_enabled: boolean;
  export_enabled: boolean;
  crm_enabled: boolean;
  ai_prompts_per_day: number;
}
