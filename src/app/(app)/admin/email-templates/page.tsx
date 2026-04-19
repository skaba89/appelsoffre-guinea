"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Mail,
  Eye,
  Copy,
  Check,
  RefreshCw,
  FileText,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  generateEmail,
  SAMPLE_DATA,
  EMAIL_TEMPLATE_LABELS,
  EMAIL_TEMPLATE_DESCRIPTIONS,
  type EmailTemplateType,
  type NewTenderEmailData,
  type DeadlineReminderEmailData,
  type WeeklyReportEmailData,
  type WelcomeEmailData,
  type CompetitorAlertEmailData,
  type HighScoreEmailData,
} from "@/lib/email-engine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
} from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

type AllEmailData =
  | NewTenderEmailData
  | DeadlineReminderEmailData
  | WeeklyReportEmailData
  | WelcomeEmailData
  | CompetitorAlertEmailData
  | HighScoreEmailData;

// ─── Form Field Configs ─────────────────────────────────────────────────────────

interface FormField {
  key: string;
  label: string;
  type: "text" | "number" | "select";
  options?: { value: string; label: string }[];
}

const FORM_FIELDS: Record<EmailTemplateType, FormField[]> = {
  new_tender: [
    { key: "tenderTitle", label: "Titre de l'AO", type: "text" },
    { key: "tenderReference", label: "Référence", type: "text" },
    { key: "sector", label: "Secteur", type: "text" },
    { key: "region", label: "Région", type: "text" },
    { key: "deadline", label: "Date limite", type: "text" },
    { key: "budget", label: "Budget", type: "text" },
    { key: "score", label: "Score (0-100)", type: "number" },
    { key: "authority", label: "Autorité", type: "text" },
    { key: "dashboardUrl", label: "URL tableau de bord", type: "text" },
  ],
  deadline_reminder: [
    { key: "tenderTitle", label: "Titre de l'AO", type: "text" },
    { key: "tenderReference", label: "Référence", type: "text" },
    { key: "daysLeft", label: "Jours restants", type: "number" },
    { key: "deadline", label: "Date limite", type: "text" },
    { key: "authority", label: "Autorité", type: "text" },
    { key: "budget", label: "Budget", type: "text" },
    { key: "tenderUrl", label: "URL de l'AO", type: "text" },
  ],
  weekly_report: [
    { key: "weekRange", label: "Période", type: "text" },
    { key: "newTendersCount", label: "Nouveaux AO", type: "number" },
    { key: "expiringTendersCount", label: "AO expirant bientôt", type: "number" },
    { key: "averageScore", label: "Score moyen", type: "number" },
    { key: "topSectors", label: "Top secteurs (séparés par ,)", type: "text" },
    { key: "topRegions", label: "Top régions (séparées par ,)", type: "text" },
    { key: "recommendationsCount", label: "Nb recommandations", type: "number" },
    { key: "dashboardUrl", label: "URL tableau de bord", type: "text" },
  ],
  welcome: [
    { key: "userName", label: "Nom de l'utilisateur", type: "text" },
    { key: "companyName", label: "Nom de l'entreprise", type: "text" },
    { key: "dashboardUrl", label: "URL tableau de bord", type: "text" },
  ],
  competitor_alert: [
    { key: "competitorName", label: "Nom du concurrent", type: "text" },
    { key: "tenderTitle", label: "Titre de l'AO", type: "text" },
    { key: "tenderReference", label: "Référence", type: "text" },
    { key: "threatLevel", label: "Niveau de menace", type: "select", options: [
      { value: "low", label: "Faible" },
      { value: "medium", label: "Moyen" },
      { value: "high", label: "Élevé" },
    ] },
    { key: "suggestions", label: "Suggestions (séparées par |)", type: "text" },
    { key: "tenderUrl", label: "URL de l'AO", type: "text" },
  ],
  high_score: [
    { key: "tenderTitle", label: "Titre de l'AO", type: "text" },
    { key: "tenderReference", label: "Référence", type: "text" },
    { key: "score", label: "Score (0-100)", type: "number" },
    { key: "recommendation", label: "Recommandation", type: "text" },
    { key: "keyStrengths", label: "Points forts (séparés par |)", type: "text" },
    { key: "tenderUrl", label: "URL de l'AO", type: "text" },
  ],
};

// ─── Data Conversion Helpers ────────────────────────────────────────────────────

function formStateToData(
  templateType: EmailTemplateType,
  formState: Record<string, string>
): AllEmailData {
  switch (templateType) {
    case "new_tender":
      return {
        tenderTitle: formState.tenderTitle || "",
        tenderReference: formState.tenderReference || "",
        sector: formState.sector || "",
        region: formState.region || "",
        deadline: formState.deadline || "",
        budget: formState.budget || "",
        score: parseInt(formState.score) || 0,
        authority: formState.authority || "",
        dashboardUrl: formState.dashboardUrl || "#",
      } as NewTenderEmailData;
    case "deadline_reminder":
      return {
        tenderTitle: formState.tenderTitle || "",
        tenderReference: formState.tenderReference || "",
        daysLeft: parseInt(formState.daysLeft) || 0,
        deadline: formState.deadline || "",
        authority: formState.authority || "",
        budget: formState.budget || "",
        tenderUrl: formState.tenderUrl || "#",
      } as DeadlineReminderEmailData;
    case "weekly_report":
      return {
        weekRange: formState.weekRange || "",
        newTendersCount: parseInt(formState.newTendersCount) || 0,
        expiringTendersCount: parseInt(formState.expiringTendersCount) || 0,
        averageScore: parseInt(formState.averageScore) || 0,
        topSectors: (formState.topSectors || "").split(",").map((s) => s.trim()).filter(Boolean),
        topRegions: (formState.topRegions || "").split(",").map((s) => s.trim()).filter(Boolean),
        recommendationsCount: parseInt(formState.recommendationsCount) || 0,
        dashboardUrl: formState.dashboardUrl || "#",
      } as WeeklyReportEmailData;
    case "welcome":
      return {
        userName: formState.userName || "",
        companyName: formState.companyName || "",
        dashboardUrl: formState.dashboardUrl || "#",
      } as WelcomeEmailData;
    case "competitor_alert":
      return {
        competitorName: formState.competitorName || "",
        tenderTitle: formState.tenderTitle || "",
        tenderReference: formState.tenderReference || "",
        threatLevel: (formState.threatLevel as "low" | "medium" | "high") || "medium",
        suggestions: (formState.suggestions || "").split("|").map((s) => s.trim()).filter(Boolean),
        tenderUrl: formState.tenderUrl || "#",
      } as CompetitorAlertEmailData;
    case "high_score":
      return {
        tenderTitle: formState.tenderTitle || "",
        tenderReference: formState.tenderReference || "",
        score: parseInt(formState.score) || 0,
        recommendation: formState.recommendation || "",
        keyStrengths: (formState.keyStrengths || "").split("|").map((s) => s.trim()).filter(Boolean),
        tenderUrl: formState.tenderUrl || "#",
      } as HighScoreEmailData;
  }
}

function dataToFormState(
  templateType: EmailTemplateType,
  data: AllEmailData
): Record<string, string> {
  switch (templateType) {
    case "new_tender": {
      const d = data as NewTenderEmailData;
      return {
        tenderTitle: d.tenderTitle,
        tenderReference: d.tenderReference,
        sector: d.sector,
        region: d.region,
        deadline: d.deadline,
        budget: d.budget,
        score: String(d.score),
        authority: d.authority,
        dashboardUrl: d.dashboardUrl,
      };
    }
    case "deadline_reminder": {
      const d = data as DeadlineReminderEmailData;
      return {
        tenderTitle: d.tenderTitle,
        tenderReference: d.tenderReference,
        daysLeft: String(d.daysLeft),
        deadline: d.deadline,
        authority: d.authority,
        budget: d.budget,
        tenderUrl: d.tenderUrl,
      };
    }
    case "weekly_report": {
      const d = data as WeeklyReportEmailData;
      return {
        weekRange: d.weekRange,
        newTendersCount: String(d.newTendersCount),
        expiringTendersCount: String(d.expiringTendersCount),
        averageScore: String(d.averageScore),
        topSectors: d.topSectors.join(", "),
        topRegions: d.topRegions.join(", "),
        recommendationsCount: String(d.recommendationsCount),
        dashboardUrl: d.dashboardUrl,
      };
    }
    case "welcome": {
      const d = data as WelcomeEmailData;
      return {
        userName: d.userName,
        companyName: d.companyName,
        dashboardUrl: d.dashboardUrl,
      };
    }
    case "competitor_alert": {
      const d = data as CompetitorAlertEmailData;
      return {
        competitorName: d.competitorName,
        tenderTitle: d.tenderTitle,
        tenderReference: d.tenderReference,
        threatLevel: d.threatLevel,
        suggestions: d.suggestions.join(" | "),
        tenderUrl: d.tenderUrl,
      };
    }
    case "high_score": {
      const d = data as HighScoreEmailData;
      return {
        tenderTitle: d.tenderTitle,
        tenderReference: d.tenderReference,
        score: String(d.score),
        recommendation: d.recommendation,
        keyStrengths: d.keyStrengths.join(" | "),
        tenderUrl: d.tenderUrl,
      };
    }
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function EmailTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateType>("new_tender");
  const [copied, setCopied] = useState(false);

  // Initialize form state from sample data
  const sample = SAMPLE_DATA[selectedTemplate];
  const [formState, setFormState] = useState<Record<string, string>>(
    dataToFormState(selectedTemplate, sample.data)
  );

  // When template changes, reset form to sample data
  const handleTemplateChange = useCallback((value: string) => {
    const newType = value as EmailTemplateType;
    setSelectedTemplate(newType);
    const newSample = SAMPLE_DATA[newType];
    setFormState(dataToFormState(newType, newSample.data));
  }, []);

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Generate HTML preview
  const generatedHtml = useMemo(() => {
    try {
      const data = formStateToData(selectedTemplate, formState);
      const subject = SAMPLE_DATA[selectedTemplate].subject;
      return generateEmail(selectedTemplate, subject, data);
    } catch {
      return "<p style='color:red;padding:20px;'>Erreur de génération — vérifiez les données du formulaire.</p>";
    }
  }, [selectedTemplate, formState]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopied(true);
      toast.success("HTML copié dans le presse-papiers");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier le HTML");
    }
  }, [generatedHtml]);

  const handleReset = useCallback(() => {
    const sampleData = SAMPLE_DATA[selectedTemplate];
    setFormState(dataToFormState(selectedTemplate, sampleData.data));
    toast.info("Données réinitialisées aux valeurs par défaut");
  }, [selectedTemplate]);

  const fields = FORM_FIELDS[selectedTemplate];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Modèles d&apos;emails
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Prévisualisez et personnalisez les modèles de notification email
            </p>
          </div>
          <Badge variant="secondary" className="w-fit">
            6 modèles disponibles
          </Badge>
        </div>
      </motion.div>

      {/* ── Template Selector ────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.05 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Select
          value={selectedTemplate}
          onValueChange={handleTemplateChange}
        >
          <SelectTrigger className="w-full sm:w-80">
            <Mail className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Sélectionner un modèle" />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(EMAIL_TEMPLATE_LABELS) as [EmailTemplateType, string][]).map(
              ([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={handleReset}>
          <RefreshCw className="w-3.5 h-3.5" />
          Réinitialiser
        </Button>
      </motion.div>

      {/* ── Template Description ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTemplate}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
        >
          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm text-muted-foreground">
            {EMAIL_TEMPLATE_DESCRIPTIONS[selectedTemplate]}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* ── Main Content: Form + Preview ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Form ──────────────────────────────────────────────────── */}
        <motion.div
          variants={motionVariants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.1 }}
        >
          <AnimatedCard variant="outline" hoverLift={false} tapScale={false}>
            <AnimatedCardHeader>
              <h3 className="text-base font-semibold text-foreground">
                Données du modèle
              </h3>
              <p className="text-xs text-muted-foreground">
                Modifiez les valeurs pour prévisualiser le rendu en temps réel
              </p>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="space-y-4">
                {/* Subject field */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Sujet de l&apos;email
                  </Label>
                  <Input
                    value={SAMPLE_DATA[selectedTemplate].subject}
                    readOnly
                    className="bg-muted/50 text-sm"
                  />
                </div>

                <Separator />

                {/* Dynamic fields */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTemplate}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    {fields.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">
                          {field.label}
                        </Label>
                        {field.type === "select" && field.options ? (
                          <Select
                            value={formState[field.key] || ""}
                            onValueChange={(v) =>
                              handleFieldChange(field.key, v)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={field.type === "number" ? "number" : "text"}
                            value={formState[field.key] || ""}
                            onChange={(e) =>
                              handleFieldChange(field.key, e.target.value)
                            }
                            className="text-sm"
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>

        {/* ── Right: Preview ──────────────────────────────────────────────── */}
        <motion.div
          variants={motionVariants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.15 }}
        >
          <AnimatedCard variant="outline" hoverLift={false} tapScale={false}>
            <AnimatedCardHeader>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Aperçu
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleCopyHtml}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Copié !
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copier le HTML
                    </>
                  )}
                </Button>
              </div>
            </AnimatedCardHeader>
            <AnimatedCardContent>
              <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
                {/* Browser-style header */}
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                  </div>
                  <div className="flex-1 bg-background/80 rounded px-3 py-0.5 text-[10px] text-muted-foreground font-mono truncate">
                    email.tenderflow.gn/preview
                  </div>
                </div>
                {/* iframe preview */}
                <iframe
                  srcDoc={generatedHtml}
                  className="w-full h-[500px] border-0 bg-white"
                  title="Aperçu de l'email"
                  sandbox="allow-same-origin"
                />
              </div>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
}
