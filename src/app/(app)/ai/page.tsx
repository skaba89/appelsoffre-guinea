"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, FileText, Target,
  Loader2, Trash2, Copy, Check, ChevronDown, ChevronUp,
  Search, Rocket, Plus, Upload, X, MessageSquare,
  FileCode, Scale, Clock, BookOpen, Wrench, ListChecks,
  DollarSign, Handshake, CheckCircle, AlertTriangle,
  TrendingUp, ExternalLink, Hash,
} from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motionVariants, transitions } from "@/lib/design-tokens";
import {
  type RAGMessage,
  type RAGSource,
  type RAGSuggestion,
  type ConversationMode,
  type RAGConversation,
  getDemoConversation,
  quickActionPrompts,
  conversationModes,
} from "@/lib/rag-engine";

// ===== Icon mapping helper =====
function getIconByName(name: string, className?: string) {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Target, FileText, Sparkles, AlertTriangle, Search, Rocket,
    Scale, Clock, BookOpen, Wrench, ListChecks, DollarSign,
    Handshake, CheckCircle, TrendingUp, MessageSquare,
  };
  const Icon = iconMap[name] || Sparkles;
  return <Icon className={className || "h-4 w-4"} />;
}

const modeColorMap: Record<ConversationMode, string> = {
  analysis: "text-emerald-600",
  drafting: "text-amber-600",
  research: "text-blue-600",
  strategy: "text-purple-600",
};

const modeBadgeVariant: Record<ConversationMode, "success" | "warning" | "info" | "primary"> = {
  analysis: "success",
  drafting: "warning",
  research: "info",
  strategy: "primary",
};

// ===== Source Card Component =====
function SourceCard({ source, index }: { source: RAGSource; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const typeLabel: Record<string, string> = {
    regulation: "Réglementation",
    guide: "Guide",
    template: "Template",
    tender: "Appel d'offres",
    faq: "FAQ",
  };
  const typeIcon: Record<string, string> = {
    regulation: "Scale",
    guide: "BookOpen",
    template: "FileCode",
    tender: "FileText",
    faq: "MessageSquare",
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border/60 bg-muted/30 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-2 p-2.5 hover:bg-muted/50 transition-colors text-left">
            <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary text-[10px] font-bold shrink-0">
              {index + 1}
            </span>
            {getIconByName(typeIcon[source.type] || "FileText", "h-3.5 w-3.5 text-muted-foreground shrink-0")}
            <span className="text-xs font-medium text-foreground truncate flex-1">{source.title}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <GradientBadge variant={source.relevance > 0.8 ? "success" : source.relevance > 0.5 ? "warning" : "destructive"} size="sm">
                {Math.round(source.relevance * 100)}%
              </GradientBadge>
              {isOpen ? <ChevronUp className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-2.5 pb-2.5 pt-1 border-t border-border/40">
            <div className="flex items-center gap-1.5 mb-1.5">
              <GradientBadge variant={modeBadgeVariant[source.type === "regulation" ? "analysis" : source.type === "tender" ? "strategy" : source.type === "template" ? "drafting" : "research"]} size="sm">
                {typeLabel[source.type] || source.type}
              </GradientBadge>
              {source.url && (
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline">
                  Voir <ExternalLink className="h-2.5 w-2.5" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{source.excerpt}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

// ===== Confidence Bar Component =====
function ConfidenceBar({ confidence }: { confidence: number }) {
  const percentage = Math.round(confidence * 100);
  const colorClass =
    percentage >= 80 ? "bg-emerald-500" : percentage >= 60 ? "bg-amber-500" : "bg-red-500";
  const label =
    percentage >= 80 ? "Élevée" : percentage >= 60 ? "Modérée" : "Faible";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-muted-foreground font-medium">Confiance</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[80px]">
        <motion.div
          className={`h-full rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[10px] font-semibold text-foreground">{percentage}%</span>
      <span className="text-[10px] text-muted-foreground">({label})</span>
    </div>
  );
}

// ===== Typing Indicator Component =====
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
        <Bot className="h-4 w-4 text-primary-foreground" />
      </div>
      <div className="bg-muted/50 border border-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
            />
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </div>
          <span className="text-xs text-muted-foreground ml-1">Analyse en cours...</span>
        </div>
      </div>
    </motion.div>
  );
}

// ===== Message Bubble Component =====
function MessageBubble({
  msg,
  copiedId,
  onCopy,
}: {
  msg: RAGMessage;
  copiedId: string | null;
  onCopy: (id: string, content: string) => void;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={transitions.normal}
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-primary/10 text-primary"
            : "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[85%] ${isUser ? "" : "space-y-2"}`}>
        <div
          className={`group relative rounded-xl px-4 py-3 ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-foreground border border-border"
          }`}
        >
          {/* Mode badge for AI */}
          {!isUser && msg.mode && (
            <div className="flex items-center gap-1.5 mb-2">
              {getIconByName(
                conversationModes.find((m) => m.id === msg.mode)?.icon || "Sparkles",
                `h-3 w-3 ${modeColorMap[msg.mode]}`
              )}
              <span className={`text-[10px] font-semibold ${modeColorMap[msg.mode]}`}>
                {conversationModes.find((m) => m.id === msg.mode)?.label || "Analyse"}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
            {msg.content}
          </div>

          {/* Actions bar */}
          <div
            className={`flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? "justify-end" : ""
            }`}
          >
            <span className="text-[10px] text-muted-foreground">
              {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
            {!isUser && (
              <button
                onClick={() => onCopy(msg.id, msg.content)}
                className="ml-auto p-0.5 rounded hover:bg-muted transition-colors"
              >
                {copiedId === msg.id ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Sources (AI only) */}
        {!isUser && msg.sources && msg.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ delay: 0.3, ...transitions.normal }}
            className="space-y-1.5"
          >
            <div className="flex items-center gap-1.5 px-1">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                Sources ({msg.sources.length})
              </span>
            </div>
            {msg.sources.map((source, i) => (
              <SourceCard key={source.id} source={source} index={i} />
            ))}
          </motion.div>
        )}

        {/* Confidence (AI only) */}
        {!isUser && msg.confidence !== undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-1 pt-1"
          >
            <ConfidenceBar confidence={msg.confidence} />
          </motion.div>
        )}

        {/* Suggestions (AI only) */}
        {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-1.5 pt-1"
          >
            {msg.suggestions.map((s) => (
              <button
                key={s.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border border-border/60 bg-card hover:bg-muted/50 text-foreground transition-colors"
              >
                {getIconByName(s.icon, "h-3 w-3 text-primary")}
                {s.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ===== Conversation History Item =====
function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: RAGConversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      }`}
    >
      {getIconByName(
        conversationModes.find((m) => m.id === conversation.mode)?.icon || "MessageSquare",
        `h-4 w-4 shrink-0 ${isActive ? "text-primary" : modeColorMap[conversation.mode]}`
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{conversation.title}</p>
        <p className="text-[10px] text-muted-foreground">
          {conversation.messages.length} messages
        </p>
      </div>
    </button>
  );
}

// ===== Upload Zone Component =====
function UploadZone({ onClose }: { onClose: () => void }) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
      style={{
        borderColor: isDragOver ? "var(--primary)" : "var(--border)",
        backgroundColor: isDragOver ? "var(--primary)/5" : "transparent",
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">Importer des documents</span>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted transition-colors">
          <X className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </div>
      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
      <p className="text-sm text-muted-foreground mb-1">
        Glissez-déposez vos fichiers ici
      </p>
      <p className="text-xs text-muted-foreground mb-3">
        PDF, DOCX, XLSX — max 10 Mo
      </p>
      <Button variant="outline" size="sm" className="gap-2">
        <Upload className="h-3.5 w-3.5" />
        Parcourir les fichiers
      </Button>
    </motion.div>
  );
}

// ===== Main Page Component =====
export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<RAGConversation[]>(() => {
    const demo = getDemoConversation();
    return [demo];
  });
  const [activeConversationId, setActiveConversationId] = useState<string>("demo-conv-001");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, scrollToBottom]);

  const sendMessage = async (text: string, mode?: ConversationMode) => {
    if (!text.trim() || isLoading) return;

    const currentMode = mode || activeConversation.mode;
    const userMessage: RAGMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [...c.messages, userMessage], mode: currentMode, updatedAt: new Date() }
          : c
      )
    );
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), mode: currentMode }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: RAGMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.content || data.reply || "Désolé, je n'ai pas pu générer une réponse.",
        timestamp: new Date(),
        sources: data.sources || [],
        confidence: data.confidence || 0.5,
        suggestions: data.suggestions || [],
        mode: currentMode,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, assistantMessage], updatedAt: new Date() }
            : c
        )
      );
    } catch {
      const errorMessage: RAGMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer.",
        timestamp: new Date(),
        confidence: 0,
        mode: currentMode,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? { ...c, messages: [...c.messages, errorMessage] }
            : c
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              messages: [
                {
                  id: "welcome-new",
                  role: "assistant" as const,
                  content: "Conversation réinitialisée. Comment puis-je vous aider ?",
                  timestamp: new Date(),
                  confidence: 0.95,
                  sources: [],
                  suggestions: quickActionPrompts.slice(0, 3).map((qa) => ({
                    id: `s-${qa.label}`,
                    label: qa.label,
                    prompt: qa.prompt,
                    icon: qa.icon,
                  })),
                  mode: c.mode,
                },
              ],
              updatedAt: new Date(),
            }
          : c
      )
    );
  };

  const createNewConversation = (mode: ConversationMode = "analysis") => {
    const newId = `conv-${Date.now()}`;
    const modeInfo = conversationModes.find((m) => m.id === mode);
    const newConv: RAGConversation = {
      id: newId,
      title: `Nouvelle ${modeInfo?.label || "Analyse"}`,
      mode,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: `welcome-${newId}`,
          role: "assistant",
          content: `Mode **${modeInfo?.label || "Analyse"}** activé. ${modeInfo?.description || ""}\n\nComment puis-je vous aider ?`,
          timestamp: new Date(),
          confidence: 0.95,
          sources: [],
          suggestions: quickActionPrompts
            .filter((qa) => qa.mode === mode)
            .slice(0, 3)
            .map((qa) => ({ id: `s-${qa.label}`, label: qa.label, prompt: qa.prompt, icon: qa.icon })),
          mode,
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
  };

  const handleModeChange = (mode: ConversationMode) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId ? { ...c, mode, updatedAt: new Date() } : c
      )
    );
  };

  const handleSuggestionClick = (suggestion: RAGSuggestion) => {
    sendMessage(suggestion.prompt);
  };

  const handleQuickActionClick = (action: typeof quickActionPrompts[number]) => {
    sendMessage(action.prompt, action.mode);
  };

  return (
    <motion.div
      className="flex h-[calc(100vh-8rem)] gap-4"
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* ===== Left Sidebar ===== */}
      {showSidebar && (
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={transitions.normal}
          className="w-72 shrink-0 flex flex-col border border-border rounded-xl bg-card overflow-hidden"
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Assistant RAG</h2>
                  <GradientBadge variant="success" size="sm" pulse>En ligne</GradientBadge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground lg:hidden"
                onClick={() => setShowSidebar(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* New Conversation Button */}
            <Button
              onClick={() => createNewConversation(activeConversation.mode)}
              className="w-full gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Nouvelle conversation
            </Button>
          </div>

          {/* Mode Selector */}
          <div className="p-3 border-b border-border">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              Mode actif
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {conversationModes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-center transition-colors ${
                    activeConversation.mode === m.id
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-border/50 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  {getIconByName(m.icon, `h-4 w-4 ${activeConversation.mode === m.id ? "text-primary" : m.color}`)}
                  <span className="text-[10px] font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <ScrollArea className="flex-1">
            <div className="p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
                Historique
              </p>
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === activeConversationId}
                    onClick={() => setActiveConversationId(conv.id)}
                  />
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => setShowUploadZone(!showUploadZone)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-4 w-4" />
              Importer des documents
            </button>
          </div>
        </motion.aside>
      )}

      {/* ===== Main Chat Area ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {!showSidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowSidebar(true)}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-sm font-bold text-foreground">{activeConversation.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <GradientBadge variant={modeBadgeVariant[activeConversation.mode]} size="sm">
                  {conversationModes.find((m) => m.id === activeConversation.mode)?.label}
                </GradientBadge>
                <span className="text-[10px] text-muted-foreground">
                  {activeConversation.messages.length} messages
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => createNewConversation("analysis")}
              className="gap-1.5 text-xs"
            >
              <Target className="h-3.5 w-3.5" />
              Nouvelle analyse
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Effacer
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-4 space-y-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {activeConversation.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                copiedId={copiedId}
                onCopy={copyMessage}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Upload Zone */}
        <AnimatePresence>
          {showUploadZone && (
            <div className="mt-3">
              <UploadZone onClose={() => setShowUploadZone(false)} />
            </div>
          )}
        </AnimatePresence>

        {/* Quick Actions (shown when few messages) */}
        {activeConversation.messages.length <= 2 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Actions rapides
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {quickActionPrompts.map((qa) => (
                <button
                  key={qa.label}
                  onClick={() => handleQuickActionClick(qa)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center group"
                >
                  <div className={`p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors`}>
                    {getIconByName(qa.icon, `h-4 w-4 text-primary`)}
                  </div>
                  <span className="text-[11px] font-medium text-foreground leading-tight">{qa.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggestion chips from last AI message */}
        {activeConversation.messages.length > 2 && !isLoading && (() => {
          const lastAiMsg = [...activeConversation.messages].reverse().find((m) => m.role === "assistant" && m.suggestions && m.suggestions.length > 0);
          if (!lastAiMsg?.suggestions) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-2 mt-3"
            >
              {lastAiMsg.suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestionClick(s)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border/60 bg-card hover:bg-muted/50 text-foreground transition-colors"
                >
                  {getIconByName(s.icon, "h-3.5 w-3.5 text-primary")}
                  {s.label}
                </button>
              ))}
            </motion.div>
          );
        })()}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="flex items-end gap-2 mt-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Posez votre question en mode ${conversationModes.find((m) => m.id === activeConversation.mode)?.label || "Analyse"}...`}
              className="resize-none min-h-[44px] max-h-32 pr-4"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-muted-foreground">
            Propulsé par RAG Engine v2.0 — Base de connaissances : 17 documents guinéens
          </p>
          <div className="flex items-center gap-1.5">
            <Separator orientation="vertical" className="h-3" />
            <GradientBadge variant={modeBadgeVariant[activeConversation.mode]} size="sm">
              {conversationModes.find((m) => m.id === activeConversation.mode)?.label}
            </GradientBadge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
