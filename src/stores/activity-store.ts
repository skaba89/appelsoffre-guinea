"use client";

import { create } from "zustand";

// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — Activity Store
// Zustand store for managing tender activity timeline data
// ═══════════════════════════════════════════════════════════════════════════════

export type ActivityType = "creation" | "update" | "alert" | "deadline" | "score" | "win" | "loss" | "note";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  tenderId?: string;
  tenderRef?: string;
  icon?: string;
}

interface ActivityFilter {
  type?: ActivityType;
  tenderId?: string;
}

interface ActivityState {
  activities: ActivityEntry[];
  addActivity: (entry: Omit<ActivityEntry, "id">) => void;
  getActivities: (filter?: ActivityFilter) => ActivityEntry[];
  getFilteredActivities: () => ActivityEntry[];
}

const MOCK_ACTIVITIES: ActivityEntry[] = [
  { id: "act-001", type: "creation", title: "Nouvel appel d'offres détecté", description: "Construction d'un pont sur le fleuve Niger à Kouroussa — AO/MTP/2026/0142", timestamp: "2026-04-15T14:30:00Z", actor: "Système de veille", tenderId: "t-001", tenderRef: "AO/MTP/2026/0142" },
  { id: "act-002", type: "score", title: "Scoring IA complété", description: "SIG ressources minières — Score : 95/100 — Recommandation GO", timestamp: "2026-04-15T12:15:00Z", actor: "Moteur IA", tenderId: "t-003", tenderRef: "AO/SOGUIPAMI/2026/0023" },
  { id: "act-003", type: "deadline", title: "Échéance dans 3 jours", description: "Conseil en restructuration ONGUI — Date limite : 25 Avril 2026", timestamp: "2026-04-15T09:00:00Z", actor: "Système d'alertes", tenderId: "t-006", tenderRef: "AO/ONGUI/2026/0012" },
  { id: "act-004", type: "update", title: "Statut mis à jour", description: "Panneaux solaires centres de santé — Passé en « En analyse »", timestamp: "2026-04-14T16:45:00Z", actor: "Aminata Diallo", tenderId: "t-002", tenderRef: "AO/DNE/2026/0087" },
  { id: "act-005", type: "win", title: "Marché remporté !", description: "Système GMAO SIGG — Contrat signé de 800M GNF", timestamp: "2026-04-14T11:30:00Z", actor: "Direction Commerciale", tenderId: "t-014", tenderRef: "AO/SIGG/2026/0031" },
  { id: "act-006", type: "alert", title: "Concurrent détecté", description: "Consortium Sinohydro intéressé par Boké-Kamsar (85km)", timestamp: "2026-04-14T08:20:00Z", actor: "Veille concurrentielle", tenderId: "t-007", tenderRef: "AO/MTP/2026/0201" },
  { id: "act-007", type: "creation", title: "Nouvel appel d'offres détecté", description: "Cybersécurité Administration publique — AGUIPE", timestamp: "2026-04-13T15:10:00Z", actor: "Système de veille", tenderId: "t-012", tenderRef: "AO/AGUIPE/2026/0019" },
  { id: "act-008", type: "score", title: "Scoring IA complété", description: "Cybersécurité AGUIPE — Score : 91/100 — Recommandation GO", timestamp: "2026-04-13T15:30:00Z", actor: "Moteur IA", tenderId: "t-012", tenderRef: "AO/AGUIPE/2026/0019" },
  { id: "act-009", type: "deadline", title: "Échéance dans 5 jours", description: "Matériels et réactifs CHU Conakry — Date limite : 05 Mai 2026", timestamp: "2026-04-13T10:00:00Z", actor: "Système d'alertes", tenderId: "t-009", tenderRef: "AO/MS/2026/0078" },
  { id: "act-010", type: "update", title: "Document ajouté", description: "Cahier des charges importé pour Construction route Boké-Kamsar", timestamp: "2026-04-13T09:45:00Z", actor: "Oumar Sylla", tenderId: "t-007", tenderRef: "AO/MTP/2026/0201" },
  { id: "act-011", type: "creation", title: "Nouvel appel d'offres détecté", description: "Service de gardiennage bâtiments publics de Kankan", timestamp: "2026-04-12T14:30:00Z", actor: "Système de veille", tenderId: "t-015", tenderRef: "AO/SGG/2026/0089" },
  { id: "act-012", type: "loss", title: "Marché perdu", description: "Maintenance équipements miniers CBD — Offre non retenue", timestamp: "2026-04-12T10:00:00Z", actor: "Direction Commerciale", tenderId: "t-013", tenderRef: "AO/CBD/2026/0056" },
  { id: "act-013", type: "note", title: "Note interne ajoutée", description: "Partenariat recommandé avec SOGUIPAMI pour le projet SIG", timestamp: "2026-04-11T16:20:00Z", actor: "Ibrahima Keita", tenderId: "t-003", tenderRef: "AO/SOGUIPAMI/2026/0023" },
  { id: "act-014", type: "score", title: "Score mis à jour", description: "Réseau eau Conakry Phase 2 — Score ajusté : 85 → 60 (concurrent identifié)", timestamp: "2026-04-11T14:00:00Z", actor: "Moteur IA", tenderId: "t-004", tenderRef: "AO/SEG/2026/0198" },
  { id: "act-015", type: "creation", title: "Nouvel appel d'offres détecté", description: "Réseau 4G zones rurales — ARTP", timestamp: "2026-04-10T15:30:00Z", actor: "Système de veille", tenderId: "t-008", tenderRef: "AO/ARTP/2026/0045" },
  { id: "act-016", type: "alert", title: "Correspondance élevée", description: "Cybersécurité AGUIPE correspond à 78% à votre profil entreprise", timestamp: "2026-04-10T10:00:00Z", actor: "Moteur de matching", tenderId: "t-012", tenderRef: "AO/AGUIPE/2026/0019" },
  { id: "act-017", type: "deadline", title: "Échéance dans 10 jours", description: "Audit comptable MF — Date limite : 28 Avril 2026", timestamp: "2026-04-09T09:00:00Z", actor: "Système d'alertes", tenderId: "t-010", tenderRef: "AO/MF/2026/0034" },
  { id: "act-018", type: "update", title: "Soumission envoyée", description: "SIG ressources minières SOGUIPAMI — Dossier complet soumis", timestamp: "2026-04-08T17:30:00Z", actor: "Aissatou Diallo", tenderId: "t-003", tenderRef: "AO/SOGUIPAMI/2026/0023" },
  { id: "act-019", type: "score", title: "Scoring IA complété", description: "Pont Kouroussa — Score : 92/100 — GO avec confiance élevée", timestamp: "2026-04-08T10:00:00Z", actor: "Moteur IA", tenderId: "t-001", tenderRef: "AO/MTP/2026/0142" },
  { id: "act-020", type: "creation", title: "Nouvel appel d'offres détecté", description: "Équipement informatique 200 écoles primaires — MEPU", timestamp: "2026-04-07T12:00:00Z", actor: "Système de veille", tenderId: "t-005", tenderRef: "AO/MEPU/2026/0156" },
  { id: "act-021", type: "alert", title: "Nouvelle source ajoutée", description: "Source « Journal Officiel de la République » ajoutée au système", timestamp: "2026-04-06T14:00:00Z", actor: "Administrateur" },
  { id: "act-022", type: "update", title: "Rapport hebdomadaire généré", description: "Semaine 14 : 8 nouveaux AO, 2 soumissions, 1 contrat remporté", timestamp: "2026-04-05T08:00:00Z", actor: "Système" },
  { id: "act-023", type: "note", title: "Stratégie définie", description: "Stratégie de réponse pour l'AO AGUIPE — Positionnement cybersécurité", timestamp: "2026-04-04T11:00:00Z", actor: "Kadiatou Touré", tenderId: "t-012", tenderRef: "AO/AGUIPE/2026/0019" },
  { id: "act-024", type: "creation", title: "Nouvel appel d'offres détecté", description: "Audit comptable établissements publics — Ministère des Finances", timestamp: "2026-04-04T12:00:00Z", actor: "Système de veille", tenderId: "t-010", tenderRef: "AO/MF/2026/0034" },
  { id: "act-025", type: "win", title: "Pré-qualification acceptée", description: "SIG ressources minières — Dossier de pré-qualification retenu", timestamp: "2026-04-03T15:30:00Z", actor: "SOGUIPAMI", tenderId: "t-003", tenderRef: "AO/SOGUIPAMI/2026/0023" },
  { id: "act-026", type: "deadline", title: "Échéance passée", description: "Maintenance équipements CBD — AO expiré le 31 Mars", timestamp: "2026-04-01T09:00:00Z", actor: "Système d'alertes", tenderId: "t-013", tenderRef: "AO/CBD/2026/0056" },
  { id: "act-027", type: "score", title: "Score recalculé", description: "Équipement informatique 200 écoles — Score : 78/100 — GO conditionnel", timestamp: "2026-03-30T10:00:00Z", actor: "Moteur IA", tenderId: "t-005", tenderRef: "AO/MEPU/2026/0156" },
  { id: "act-028", type: "update", title: "Équipe assignée", description: "Equipe BTP assignée au projet pont Kouroussa", timestamp: "2026-03-28T14:00:00Z", actor: "Direction Opérationnelle", tenderId: "t-001", tenderRef: "AO/MTP/2026/0142" },
  { id: "act-029", type: "creation", title: "Nouvel appel d'offres détecté", description: "Conseil en restructuration ONGUI — Budget 500M-1.2Md GNF", timestamp: "2026-03-25T11:00:00Z", actor: "Système de veille", tenderId: "t-006", tenderRef: "AO/ONGUI/2026/0012" },
  { id: "act-030", type: "alert", title: "Rapport mensuel disponible", description: "Mars 2026 : 18 AO détectés, 3 contrats remportés, taux de réussite 68%", timestamp: "2026-03-24T08:00:00Z", actor: "Système" },
  { id: "act-031", type: "score", title: "Scoring IA complété", description: "Audit MF — Score : 80/100 — Recommandation GO", timestamp: "2026-03-22T16:00:00Z", actor: "Moteur IA", tenderId: "t-010", tenderRef: "AO/MF/2026/0034" },
  { id: "act-032", type: "update", title: "Contact ajouté", description: "Boubacar Barry (CBD Kindia) ajouté au réseau CRM", timestamp: "2026-03-20T10:30:00Z", actor: "Equipe CRM" },
];

export const ACTIVITY_TYPE_CONFIG: Record<ActivityType, { color: string; bgColor: string; label: string }> = {
  creation: { color: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20", label: "Création" },
  update: { color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", label: "Mise à jour" },
  alert: { color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20", label: "Alerte" },
  deadline: { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10 border-red-500/20", label: "Échéance" },
  score: { color: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10 border-purple-500/20", label: "Score IA" },
  win: { color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20", label: "Victoire" },
  loss: { color: "text-red-600 dark:text-red-400", bgColor: "bg-red-500/10 border-red-500/20", label: "Perte" },
  note: { color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20", label: "Note" },
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: MOCK_ACTIVITIES,

  addActivity: (entry) =>
    set((s) => ({
      activities: [
        { ...entry, id: `act-${Date.now()}` },
        ...s.activities,
      ],
    })),

  getActivities: (filter?: ActivityFilter) => {
    let result = get().activities;
    if (filter?.type) {
      result = result.filter((a) => a.type === filter.type);
    }
    if (filter?.tenderId) {
      result = result.filter((a) => a.tenderId === filter.tenderId);
    }
    return result;
  },

  getFilteredActivities: () => {
    return get().activities;
  },
}));
