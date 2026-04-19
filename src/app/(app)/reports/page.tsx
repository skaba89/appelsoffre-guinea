"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Calendar,
  PieChart,
  TrendingUp,
  MapPin,
  Swords,
  FileStack,
  Download,
  FileSpreadsheet,
  FileJson,
  FileDown,
  Plus,
  Eye,
  Clock,
  Sparkles,
  X,
  Lightbulb,
  Table2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GradientBadge } from "@/components/ui/gradient-badge";
import {
  getReportTemplates,
  generateReport,
  exportReportAsPDF,
  exportReportAsCSV,
  exportReportAsJSON,
  getReportHistory,
  priorityLabels,
  priorityColors,
  categoryLabels,
  categoryColors,
  trendIcons,
  type ReportTemplate,
  type GeneratedReport,
} from "@/lib/reports-engine";
import { motionVariants } from "@/lib/design-tokens";
import { toast } from "sonner";

// ─── Icon mapping ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Calendar,
  PieChart,
  TrendingUp,
  MapPin,
  Swords,
  FileStack,
};

// ─── Tab variants ─────────────────────────────────────────────────────────────

const tabVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  onGenerate,
}: {
  template: ReportTemplate;
  onGenerate: (t: ReportTemplate) => void;
}) {
  const IconComp = ICON_MAP[template.icon] || FileText;

  return (
    <motion.div variants={motionVariants.staggerItem}>
      <Card
        className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group h-full"
        onClick={() => onGenerate(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <IconComp className="w-5 h-5 text-primary" />
            </div>
            <Badge variant="secondary" className={`text-[10px] ${categoryColors[template.category]}`}>
              {categoryLabels[template.category]}
            </Badge>
          </div>
          <CardTitle className="text-base mt-3">{template.name}</CardTitle>
          <CardDescription className="text-xs">{template.description}</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {template.sections.length} sections
            </span>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 group-hover:text-primary transition-colors">
              <Plus className="w-3 h-3" /> Générer
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Report Generation Dialog ────────────────────────────────────────────────

function ReportConfigDialog({
  template,
  open,
  onOpenChange,
  onGenerate,
}: {
  template: ReportTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (templateId: string, params: Record<string, unknown>) => void;
}) {
  const [params, setParams] = useState<Record<string, unknown>>({});

  if (!template) return null;

  const handleGenerate = () => {
    onGenerate(template.id, params);
    onOpenChange(false);
    setParams({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {React.createElement(ICON_MAP[template.icon] || FileText, { className: "w-5 h-5 text-primary" })}
            {template.name}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {template.parameters.map((param) => (
            <div key={param.id} className="space-y-2">
              <Label className="text-sm font-medium">{param.label}{param.required && <span className="text-destructive ml-0.5">*</span>}</Label>

              {param.type === "date_range" && (
                <Select
                  value={(params[param.id] as string) || param.defaultValue || "last_month"}
                  onValueChange={(v) => setParams((p) => ({ ...p, [param.id]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_week">7 derniers jours</SelectItem>
                    <SelectItem value="last_month">30 derniers jours</SelectItem>
                    <SelectItem value="last_3_months">3 derniers mois</SelectItem>
                    <SelectItem value="last_quarter">Dernier trimestre</SelectItem>
                    <SelectItem value="last_6_months">6 derniers mois</SelectItem>
                  </SelectContent>
                </Select>
              )}

              {param.type === "select" && param.options && (
                <Select
                  value={(params[param.id] as string) || param.defaultValue || param.options[0]?.value}
                  onValueChange={(v) => setParams((p) => ({ ...p, [param.id]: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {param.type === "multiselect" && param.options && (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {param.options.map((opt) => {
                    const selected = ((params[param.id] as string[]) || []).includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selected
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            const current = (params[param.id] as string[]) || [];
                            const next = e.target.checked
                              ? [...current, opt.value]
                              : current.filter((v) => v !== opt.value);
                            setParams((p) => ({ ...p, [param.id]: next }));
                          }}
                          className="rounded"
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              )}

              {param.type === "toggle" && (
                <div className="flex items-center gap-3">
                  <Switch
                    checked={((params[param.id] as string) || param.defaultValue || "true") === "true"}
                    onCheckedChange={(v) => setParams((p) => ({ ...p, [param.id]: v ? "true" : "false" }))}
                  />
                  <span className="text-sm text-muted-foreground">Activer</span>
                </div>
              )}
            </div>
          ))}

          {/* Section selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Sections incluses</Label>
            <div className="space-y-1.5">
              {template.sections.map((section) => (
                <div key={section.id} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span className="font-medium text-foreground">{section.title}</span>
                  <span className="text-muted-foreground">— {section.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button className="gap-2" onClick={handleGenerate}>
            <Sparkles className="w-4 h-4" /> Générer le rapport
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Generated Report View ────────────────────────────────────────────────────

function GeneratedReportView({
  report,
  onClose,
}: {
  report: GeneratedReport;
  onClose: () => void;
}) {
  const { data } = report;

  const handleExportPDF = () => {
    const html = exportReportAsPDF(report);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport exporté en PDF (HTML)");
  };

  const handleExportCSV = () => {
    const csv = exportReportAsCSV(report);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport exporté en CSV");
  };

  const handleExportJSON = () => {
    const json = exportReportAsJSON(report);
    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Rapport exporté en JSON");
  };

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      {/* Header with branding */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/[0.02]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xs font-semibold text-primary">TenderFlow Guinea</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{data.title}</h2>
              <p className="text-sm text-muted-foreground">{data.subtitle}</p>
              <p className="text-xs text-muted-foreground">
                Période : {new Date(data.dateRange.from).toLocaleDateString("fr-FR")} — {new Date(data.dateRange.to).toLocaleDateString("fr-FR")}
                {" · "}Généré le {new Date(data.generatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleExportPDF}>
                <FileDown className="w-3.5 h-3.5" /> PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleExportCSV}>
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleExportJSON}>
                <FileJson className="w-3.5 h-3.5" /> JSON
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> Résumé exécutif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">{data.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {data.keyMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="h-full">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
                <p className={`text-xs mt-0.5 ${trendIcons[metric.trend]?.color}`}>
                  {trendIcons[metric.trend]?.icon} {Math.abs(metric.change)}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Data Sections */}
      {data.sections.map((section, idx) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + idx * 0.08 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {section.type === "table" ? (
                  <Table2 className="w-4 h-4 text-primary" />
                ) : (
                  <BarChart3 className="w-4 h-4 text-primary" />
                )}
                {section.title}
              </CardTitle>
              <CardDescription className="text-xs">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {section.type === "table" && section.columns && section.data.length > 0 && (
                <ScrollArea className="max-h-80">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {section.columns.map((col) => (
                          <TableHead key={col.key} className="text-xs whitespace-nowrap">{col.label}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {section.data.map((row, i) => (
                        <TableRow key={i}>
                          {section.columns!.map((col) => (
                            <TableCell key={col.key} className="text-xs">
                              {row[col.key] as string || "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}

              {section.type === "chart" && section.chartData && (
                <div className="space-y-2">
                  {section.chartData.map((item, i) => {
                    const maxVal = Math.max(...section.chartData!.map((d) => d.value));
                    const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">{item.name}</span>
                        <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, delay: i * 0.05 }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 w-20 justify-end">
                          <span className="text-xs font-medium text-foreground">{item.value}</span>
                          {(item.change ?? 0) !== 0 && (
                            <span className={`text-[10px] ${trendIcons[item.change! >= 0 ? "up" : "down"]?.color}`}>
                              {item.change! >= 0 ? "+" : ""}{item.change}%
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> Recommandations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`rounded-lg border p-4 ${priorityColors[rec.priority]}`}
            >
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="text-[10px] shrink-0 mt-0.5">
                  {priorityLabels[rec.priority]}
                </Badge>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{rec.title}</p>
                  <p className="text-xs text-muted-foreground">{rec.description}</p>
                  <p className="text-xs font-medium">
                    <span className="text-muted-foreground">Impact : </span>{rec.impact}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Report History Tab ───────────────────────────────────────────────────────

function ReportHistoryTab() {
  const history = useMemo(() => getReportHistory(), []);

  return (
    <motion.div variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4" /> Historique des rapports
          </CardTitle>
          <CardDescription>Les rapports générés précédemment</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rapport</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden sm:table-cell">Paramètres</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.templateName}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {entry.templateName}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(entry.generatedAt).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                    {Object.entries(entry.parameters).map(([k, v]) => `${k}: ${v}`).join(", ")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                      <Eye className="w-3 h-3" /> Voir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Reports Page ────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = useMemo(() => getReportTemplates(), []);

  const handleTemplateClick = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setConfigDialogOpen(true);
  };

  const handleGenerate = (templateId: string, params: Record<string, unknown>) => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const report = generateReport(templateId, params);
        setGeneratedReport(report);
        setActiveTab("report");
        toast.success("Rapport généré avec succès !");
      } catch {
        toast.error("Erreur lors de la génération du rapport");
      } finally {
        setIsGenerating(false);
      }
    }, 800);
  };

  const handleCloseReport = () => {
    setGeneratedReport(null);
    setActiveTab("templates");
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Rapports
          </h1>
          <p className="text-muted-foreground mt-1">Générez des rapports détaillés pour analyser votre activité</p>
        </div>
        {generatedReport && (
          <GradientBadge variant="primary" size="sm" className="gap-1">
            <Sparkles className="w-3 h-3" /> Rapport généré
          </GradientBadge>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates" className="gap-1.5">
            <FileStack className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Modèles</span>
          </TabsTrigger>
          <TabsTrigger value="report" className="gap-1.5" disabled={!generatedReport}>
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rapport</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Historique</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <AnimatePresence mode="wait">
            {activeTab === "templates" && (
              <TabsContent key="templates" value="templates" forceMount>
                <motion.div
                  variants={motionVariants.staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onGenerate={handleTemplateClick}
                    />
                  ))}
                </motion.div>
              </TabsContent>
            )}

            {activeTab === "report" && generatedReport && (
              <TabsContent key="report" value="report" forceMount>
                <GeneratedReportView report={generatedReport} onClose={handleCloseReport} />
              </TabsContent>
            )}

            {activeTab === "history" && (
              <TabsContent key="history" value="history" forceMount>
                <ReportHistoryTab />
              </TabsContent>
            )}
          </AnimatePresence>
        </div>
      </Tabs>

      {/* Config dialog */}
      <ReportConfigDialog
        template={selectedTemplate}
        open={configDialogOpen}
        onOpenChange={setConfigDialogOpen}
        onGenerate={handleGenerate}
      />

      {/* Generating overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Génération du rapport...</p>
                <p className="text-xs text-muted-foreground mt-1">Analyse des données en cours</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
