"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Play,
  X,
  ArrowRight,
  Globe,
  FileText,
  Brain,
  FilePen,
  BarChart3,
  Bell,
  Webhook,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  getAPIGroups,
  searchEndpoints,
  getEndpointById,
  getEndpointCount,
  getGroupCount,
  METHOD_COLORS,
  type APIEndpoint,
  type APIGroup,
  type HTTPMethod,
} from "@/lib/api-docs-engine";

// ─── Icon map ───────────────────────────────────────────────────────────────────

const GROUP_ICONS: Record<string, React.ElementType> = {
  Général: Globe,
  "Appels d'offres": FileText,
  Recherche: Search,
  "Intelligence artificielle": Brain,
  Documents: FilePen,
  Analytique: BarChart3,
  Notifications: Bell,
  Webhooks: Webhook,
};

// ─── Syntax Highlighter ─────────────────────────────────────────────────────────

function SyntaxBlock({ code, language = "json" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [code]);

  const highlighted = useMemo(() => {
    if (language !== "json") return code;
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"([^"]*)"(\s*:)/g, '<span class="text-purple-600 dark:text-purple-400">"$1"</span>$2')
      .replace(/:\s*"([^"]*)"/g, ': <span class="text-emerald-600 dark:text-emerald-400">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-amber-600 dark:text-amber-400">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="text-blue-600 dark:text-blue-400">$1</span>');
  }, [code, language]);

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-t-lg border-b border-border">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copié" : "Copier"}
        </button>
      </div>
      <pre className="bg-slate-50 dark:bg-slate-900 rounded-b-lg p-4 overflow-x-auto text-xs font-mono leading-relaxed border border-border border-t-0">
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

// ─── Method Badge ───────────────────────────────────────────────────────────────

function MethodBadge({ method }: { method: HTTPMethod }) {
  const config = METHOD_COLORS[method];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

// ─── Status Code Badge ──────────────────────────────────────────────────────────

function StatusCodeBadge({ code }: { code: number }) {
  const colorClass =
    code >= 200 && code < 300
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
      : code >= 400 && code < 500
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
        : code >= 500
          ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${colorClass}`}>
      {code}
    </span>
  );
}

// ─── Try It Panel ───────────────────────────────────────────────────────────────

function TryItPanel({ endpoint, onClose }: { endpoint: APIEndpoint; onClose: () => void }) {
  const [baseUrl] = useState("https://tenderflow.gn");
  const [requestBody, setRequestBody] = useState(endpoint.requestExample || "{}");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const fullPath = endpoint.path.replace(/{[^}]+}/g, "example-id");

  const handleSend = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${baseUrl}${fullPath}`;
      const options: RequestInit = {
        method: endpoint.method,
        headers: { "Content-Type": "application/json" },
      };
      if (endpoint.method !== "GET" && requestBody) {
        options.body = requestBody;
      }
      // Simulated response for demo
      await new Promise((r) => setTimeout(r, 800));
      setResponse(endpoint.responseExample);
      setStatus(200);
    } catch {
      setResponse(JSON.stringify({ error: "Erreur de connexion" }, null, 2));
      setStatus(500);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, fullPath, endpoint]);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="border border-border rounded-lg overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <Play className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Testeur de requête</span>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* URL bar */}
        <div className="flex items-center gap-2">
          <MethodBadge method={endpoint.method} />
          <div className="flex-1 px-3 py-2 bg-background border border-border rounded-md font-mono text-xs text-foreground">
            {fullPath}
          </div>
          <Button size="sm" onClick={handleSend} disabled={loading} className="gap-1.5">
            {loading ? (
              <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-3 h-3" />
            )}
            {loading ? "Envoi..." : "Envoyer"}
          </Button>
        </div>

        {/* Request body (for POST/PUT/PATCH) */}
        {endpoint.method !== "GET" && endpoint.method !== "DELETE" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Corps de la requête (JSON)</Label>
            <Textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="font-mono text-xs min-h-[120px] bg-slate-50 dark:bg-slate-900"
            />
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Réponse</span>
              {status && <StatusCodeBadge code={status} />}
            </div>
            <SyntaxBlock code={response} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Endpoint Detail ────────────────────────────────────────────────────────────

function EndpointDetail({ endpoint }: { endpoint: APIEndpoint }) {
  const [showTryIt, setShowTryIt] = useState(false);
  const [expandedExample, setExpandedExample] = useState<string | null>(null);

  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      transition={transitions.normal}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <MethodBadge method={endpoint.method} />
            <code className="text-sm font-mono text-foreground font-medium">{endpoint.path}</code>
          </div>
          <h3 className="text-lg font-semibold text-foreground">{endpoint.summary}</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setShowTryIt(!showTryIt)}
        >
          <Play className="w-3.5 h-3.5" />
          {showTryIt ? "Masquer le testeur" : "Essayer"}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{endpoint.description}</p>

      {endpoint.deprecated && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg">
          <Badge variant="outline" className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 text-[10px]">
            Déprécié
          </Badge>
          <span className="text-xs text-amber-700 dark:text-amber-400">Cet endpoint sera supprimé dans une future version</span>
        </div>
      )}

      {/* Try It Panel */}
      <AnimatePresence>
        {showTryIt && <TryItPanel endpoint={endpoint} onClose={() => setShowTryIt(false)} />}
      </AnimatePresence>

      {/* Parameters */}
      {endpoint.parameters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Paramètres</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nom</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Type</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Emplacement</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Requis</th>
                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoint.parameters.map((param) => (
                    <tr key={param.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-2.5">
                        <code className="font-mono text-primary text-[11px]">{param.name}</code>
                        {param.default && (
                          <span className="ml-1.5 text-[10px] text-muted-foreground">= {param.default}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary" className="text-[9px] font-mono px-1.5 py-0">
                          {param.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{param.in || "query"}</td>
                      <td className="px-4 py-2.5">
                        {param.required ? (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-red-600 border-red-300 dark:text-red-400 dark:border-red-800">
                            Requis
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">Optionnel</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-foreground max-w-xs">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Example */}
      {endpoint.requestExample && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Exemple de requête</h4>
          <SyntaxBlock code={endpoint.requestExample} />
        </div>
      )}

      {/* Response Example */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Exemple de réponse</h4>
        <SyntaxBlock code={endpoint.responseExample} />
      </div>

      {/* Status Codes */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Codes de statut</h4>
        <div className="grid gap-2">
          {endpoint.statusCodes.map((sc) => (
            <div key={sc.code} className="flex items-start gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/30 transition-colors">
              <StatusCodeBadge code={sc.code} />
              <span className="text-xs text-foreground leading-relaxed">{sc.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Examples */}
      {endpoint.examples.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Exemples</h4>
          <div className="space-y-2">
            {endpoint.examples.map((example, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedExample(expandedExample === example.label ? null : example.label)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{example.label}</span>
                  </div>
                  {expandedExample === example.label ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence>
                  {expandedExample === example.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-3 border-t border-border">
                        {example.request && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Requête</span>
                            <SyntaxBlock code={example.request} language="text" />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Réponse</span>
                          <SyntaxBlock code={example.response} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function APIDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const groups = useMemo(() => getAPIGroups(), []);
  const filteredEndpoints = useMemo(() => searchEndpoints(searchQuery), [searchQuery]);
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    return groups
      .map((group) => ({
        ...group,
        endpoints: group.endpoints.filter((ep) =>
          filteredEndpoints.some((fe) => fe.id === ep.id)
        ),
      }))
      .filter((group) => group.endpoints.length > 0);
  }, [groups, filteredEndpoints, searchQuery]);

  const selectedEndpoint = useMemo(
    () => (selectedEndpointId ? getEndpointById(selectedEndpointId) : null),
    [selectedEndpointId]
  );

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
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Documentation API</h1>
              <p className="text-sm text-muted-foreground">
                Référence complète de l&apos;API TenderFlow Guinea
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">v1.0</Badge>
            <Badge variant="outline" className="text-xs">
              {getEndpointCount()} endpoints · {getGroupCount()} groupes
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.05 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un endpoint, un paramètre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-xs text-muted-foreground mt-1.5">
            {filteredEndpoints.length} résultat{filteredEndpoints.length !== 1 ? "s" : ""} pour &laquo; {searchQuery} &raquo;
          </p>
        )}
      </motion.div>

      {/* ── Main Content: Sidebar + Detail ──────────────────────────────────── */}
      <div className="flex gap-6">
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <motion.div
          variants={motionVariants.fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ ...transitions.normal, delay: 0.1 }}
          className={`${sidebarOpen ? "w-64 shrink-0" : "w-0 shrink-0"} hidden lg:block transition-all duration-300`}
        >
          {sidebarOpen && (
            <ScrollArea className="h-[calc(100vh-280px)] sticky top-4">
              <div className="space-y-4 pr-4">
                {filteredGroups.map((group) => {
                  const IconComponent = GROUP_ICONS[group.name] || Globe;
                  return (
                    <div key={group.id}>
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`w-3.5 h-3.5 ${group.color}`} />
                        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                          {group.name}
                        </span>
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 ml-auto">
                          {group.endpoints.length}
                        </Badge>
                      </div>
                      <div className="space-y-0.5 ml-1">
                        {group.endpoints.map((ep) => (
                          <button
                            key={ep.id}
                            onClick={() => setSelectedEndpointId(ep.id)}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-colors ${
                              selectedEndpointId === ep.id
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            }`}
                          >
                            <MethodBadge method={ep.method} />
                            <span className="text-[11px] truncate">{ep.path}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </motion.div>

        {/* ── Detail Panel ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {selectedEndpoint ? (
            <EndpointDetail endpoint={selectedEndpoint} />
          ) : (
            <motion.div
              variants={motionVariants.fadeInScale}
              initial="hidden"
              animate="visible"
              transition={transitions.normal}
            >
              {/* Welcome / Overview */}
              <Card className="border-dashed">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Documentation API TenderFlow
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Sélectionnez un endpoint dans le panneau latéral pour voir ses détails,
                    paramètres, exemples et testeur de requête.
                  </p>

                  <Separator className="my-6" />

                  {/* Quick Overview Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                    {filteredGroups.map((group) => {
                      const IconComponent = GROUP_ICONS[group.name] || Globe;
                      return (
                        <button
                          key={group.id}
                          onClick={() => {
                            if (group.endpoints[0]) {
                              setSelectedEndpointId(group.endpoints[0].id);
                            }
                          }}
                          className="p-3 rounded-lg border border-border hover:bg-muted/30 hover:border-primary/30 transition-all text-center"
                        >
                          <IconComponent className={`w-5 h-5 mx-auto mb-1.5 ${group.color}`} />
                          <p className="text-xs font-medium text-foreground">{group.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {group.endpoints.length} endpoint{group.endpoints.length !== 1 ? "s" : ""}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Authentication note */}
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg text-left max-w-lg mx-auto">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      🔐 Authentification
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                      La plupart des endpoints nécessitent une authentification via header
                      <code className="mx-1 px-1.5 py-0.5 bg-background rounded text-[10px] font-mono border border-border">
                        Authorization: Bearer &lt;token&gt;
                      </code>
                      Sauf les endpoints publics (GET /api, GET /api/tenders).
                    </p>
                  </div>

                  {/* Base URL */}
                  <div className="p-4 bg-muted/50 rounded-lg text-left max-w-lg mx-auto">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      🌐 URL de base
                    </h4>
                    <code className="block mt-1.5 px-3 py-2 bg-background rounded text-xs font-mono border border-border">
                      https://tenderflow.gn/api
                    </code>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
