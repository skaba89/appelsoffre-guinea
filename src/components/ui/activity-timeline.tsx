"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, FileCheck, AlertTriangle, Clock,
  Trophy, XCircle, StickyNote, ArrowRight,
} from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import { useActivityStore, ACTIVITY_TYPE_CONFIG, type ActivityEntry, type ActivityType } from "@/stores/activity-store";

interface ActivityTimelineProps {
  activities: ActivityEntry[];
  maxVisible?: number;
}

const TYPE_ICONS: Record<ActivityType, React.ElementType> = {
  creation: Plus,
  update: ArrowRight,
  alert: AlertTriangle,
  deadline: Clock,
  score: Search,
  win: Trophy,
  loss: XCircle,
  note: StickyNote,
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function ActivityTimeline({ activities, maxVisible = 10 }: ActivityTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(maxVisible);
  const { addActivity } = useActivityStore();

  const visibleActivities = activities.slice(0, visibleCount);
  const hasMore = activities.length > visibleCount;

  return (
    <AnimatedCard hoverLift={false}>
      <AnimatedCardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Activité récente</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{activities.length} événements</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
            Tout voir <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </AnimatedCardHeader>
      <AnimatedCardContent className="pt-0">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          <div className="space-y-1">
            <AnimatePresence>
              {visibleActivities.map((activity, i) => {
                const config = ACTIVITY_TYPE_CONFIG[activity.type];
                const Icon = TYPE_ICONS[activity.type] || FileCheck;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="relative flex gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors group"
                  >
                    {/* Icon circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${config.bgColor} z-10 bg-card`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{activity.description}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${config.bgColor} ${config.color}`}>
                          {config.label}
                        </span>
                        {activity.tenderRef && (
                          <span className="text-[10px] text-muted-foreground">{activity.tenderRef}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">— {activity.actor}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1"
              onClick={() => setVisibleCount((c) => c + 10)}
            >
              Voir plus <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
