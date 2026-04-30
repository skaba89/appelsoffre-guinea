"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useNotificationStore,
  notificationTypeConfig,
  priorityConfig,
  formatRelativeTime,
  type NotificationType,
} from "@/lib/notification-engine";
import { cn } from "@/lib/utils";
import {
  Bell, Clock, FileText, Target, Zap, Shield, CheckCheck,
  AlertTriangle, TrendingUp, Trophy, Trash2, Filter,
  Volume2, VolumeX, Play, Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedCard, AnimatedCardContent } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Progress } from "@/components/ui/progress";
import { motionVariants } from "@/lib/design-tokens";

const typeIcons: Record<string, React.ElementType> = {
  deadline: Clock,
  new_tender: FileText,
  score: Target,
  match: TrendingUp,
  system: Shield,
  win: Trophy,
  competitor: AlertTriangle,
};

const typeFilters = [
  { value: "all", label: "Toutes" },
  { value: "unread", label: "Non lues" },
  { value: "critical", label: "Critiques" },
  { value: "new_tender", label: "Nouveaux AO" },
  { value: "deadline", label: "Échéances" },
  { value: "competitor", label: "Concurrents" },
] as const;

export default function AlertsPage() {
  const {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    removeNotification,
    clearAll,
    startSimulation,
    stopSimulation,
  } = useNotificationStore();

  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [simulationActive, setSimulationActive] = useState(false);

  // Toggle simulation
  const toggleSimulation = () => {
    if (simulationActive) {
      stopSimulation();
      setSimulationActive(false);
    } else {
      startSimulation();
      setSimulationActive(true);
    }
  };

  // Filter notifications
  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return !n.isRead;
    if (activeFilter === "critical") return n.priority === "critical";
    return n.type === activeFilter;
  });

  // Stats
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    critical: notifications.filter((n) => n.priority === "critical" && !n.isRead).length,
    today: notifications.filter((n) => {
      const diff = Date.now() - new Date(n.createdAt).getTime();
      return diff < 24 * 60 * 60 * 1000;
    }).length,
  };

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Centre de notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}` : "Toutes les notifications sont lues"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={simulationActive ? "destructive" : "outline"}
            size="sm"
            className="gap-2"
            onClick={toggleSimulation}
          >
            {simulationActive ? (
              <><Pause className="w-3.5 h-3.5" /> Pause simu</>
            ) : (
              <><Play className="w-3.5 h-3.5" /> Simu temps réel</>
            )}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={markAllRead}>
            <CheckCheck className="w-3.5 h-3.5" /> Tout lire
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={clearAll}>
            <Trash2 className="w-3.5 h-3.5" /> Vider
          </Button>
        </div>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={motionVariants.staggerItem} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Bell, color: "text-primary bg-primary/10" },
          { label: "Non lues", value: stats.unread, icon: VolumeX, color: "text-orange-500 bg-orange-500/10" },
          { label: "Critiques", value: stats.critical, icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
          { label: "Aujourd'hui", value: stats.today, icon: Clock, color: "text-blue-500 bg-blue-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-3 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", stat.color)}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={motionVariants.staggerItem} className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {typeFilters.map((filter) => {
          const isActive = activeFilter === filter.value;
          return (
            <Button
              key={filter.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setActiveFilter(filter.value)}
            >
              {filter.label}
              {filter.value === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 text-[10px] bg-primary-foreground/20 px-1.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
          );
        })}
      </motion.div>

      {/* Notification List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((notification, index) => {
            const config = notificationTypeConfig(notification.type);
            const pConfig = priorityConfig(notification.priority);
            const Icon = typeIcons[notification.type] || Shield;

            return (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <AnimatedCard
                  hoverLift={false}
                  className={cn(
                    "cursor-pointer transition-all",
                    !notification.isRead && "border-l-4 border-l-primary bg-primary/[0.02]"
                  )}
                  onClick={() => markRead(notification.id)}
                >
                  <AnimatedCardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", config.bgLight, config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={cn(
                            "text-sm font-medium",
                            !notification.isRead ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <Badge variant="secondary" className={cn("text-[10px] h-5", config.bgLight, config.color)}>
                            {config.label}
                          </Badge>
                          {!notification.isRead && notification.priority === "critical" && (
                            <GradientBadge variant="destructive" size="sm">Critique</GradientBadge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{notification.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">{formatRelativeTime(notification.createdAt)}</span>
                          <Badge variant="outline" className={cn("text-[9px] h-4", pConfig.color)}>
                            {pConfig.label}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aucune notification</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {activeFilter !== "all" ? "Aucune notification pour ce filtre" : "Vous êtes à jour !"}
            </p>
            {simulationActive && (
              <p className="text-xs text-primary mt-2">De nouvelles notifications arrivent en temps réel...</p>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
