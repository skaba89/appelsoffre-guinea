"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Sparkles, FileText, Target,
  MessageSquare, Loader2, Trash2, Copy, Check,
} from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Textarea } from "@/components/ui/textarea";
import { motionVariants, transitions } from "@/lib/design-tokens";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  { icon: Target, label: "Analyser un appel d'offres", prompt: "Comment analyser efficacement un appel d'offres pour déterminer s'il est pertinent pour mon entreprise ?" },
  { icon: FileText, label: "Aide à la rédaction", prompt: "Aide-moi à rédiger une lettre de motivation pour répondre à un appel d'offres dans le secteur BTP en Guinée." },
  { icon: Sparkles, label: "Stratégie de soumission", prompt: "Quelle stratégie recommandes-tu pour maximiser nos chances de remporter un appel d'offres public en Guinée ?" },
  { icon: MessageSquare, label: "Évaluation des risques", prompt: "Quels sont les principaux risques à identifier dans un cahier des charges d'appel d'offres ?" },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant IA de TenderFlow Guinea. Je peux vous aider à analyser les appels d'offres, rédiger des réponses, évaluer les risques et optimiser votre stratégie de soumission. Comment puis-je vous aider aujourd'hui ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Désolé, une erreur s'est produite lors de la génération de la réponse. Veuillez réessayer.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
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
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Conversation réinitialisée. Comment puis-je vous aider ?",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <motion.div
      className="flex flex-col h-[calc(100vh-8rem)]"
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Assistant IA</h1>
            <div className="flex items-center gap-2">
              <GradientBadge variant="success" size="sm" pulse>En ligne</GradientBadge>
              <span className="text-xs text-muted-foreground">Propulsé par IA</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="gap-2 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          Effacer
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar rounded-xl border border-border bg-card/50 p-4 space-y-4 mb-4">
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitions.normal}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                msg.role === "user"
                  ? "bg-primary/10 text-primary"
                  : "bg-gradient-to-br from-primary to-blue-600 text-primary-foreground"
              }`}>
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message bubble */}
              <div className={`group relative max-w-[80%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-foreground border border-border"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                  msg.role === "user" ? "justify-end" : ""
                }`}>
                  <span className="text-[10px] text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {msg.role === "assistant" && (
                    <button
                      onClick={() => copyMessage(msg.id, msg.content)}
                      className="ml-2 p-0.5 rounded hover:bg-muted transition-colors"
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
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-muted/50 border border-border rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Analyse en cours...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts (shown when few messages) */}
      {messages.length <= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4"
        >
          {quickPrompts.map((qp) => (
            <button
              key={qp.label}
              onClick={() => sendMessage(qp.prompt)}
              className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group"
            >
              <qp.icon className="h-4 w-4 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium text-foreground">{qp.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez votre question sur les appels d'offres..."
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
    </motion.div>
  );
}
