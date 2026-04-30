"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { mockTenders } from "@/lib/mock-data";
import { cn, formatDate, daysUntil, formatCurrency, statusColor, statusLabel } from "@/lib/tenderflow-utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import { motion, AnimatePresence } from "framer-motion";
import { TenderCalendar, type CalendarEvent } from "@/components/ui/tender-calendar";
import { FavoriteButton } from "@/components/ui/favorite-button";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader } from "@/components/ui/animated-card";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar as CalendarIcon,
  AlertTriangle,
  Clock,
  TrendingUp,
  X,
  MapPin,
  Building2,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";

function getUrgency(daysLeft: number): CalendarEvent["urgency"] {
  if (daysLeft < 0) return "safe"; // expired, not urgent anymore
  if (daysLeft <= 3) return "critical";
  if (daysLeft <= 7) return "warning";
  if (daysLeft <= 14) return "moderate";
  return "safe";
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  // Generate calendar events from mock tenders
  const calendarEvents = useMemo(() => {
    return mockTenders
      .filter((t) => t.deadline_date)
      .map((t) => {
        const daysLeft = daysUntil(t.deadline_date) ?? 0;
        return {
          date: t.deadline_date,
          tenderId: t.id,
          tenderTitle: t.title,
          tenderRef: t.reference,
          sector: t.sector,
          urgency: getUrgency(daysLeft),
          daysLeft,
        } as CalendarEvent;
      });
  }, []);

  // Stats
  const currentMonthEvents = useMemo(() => {
    return calendarEvents.filter((e) => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  }, [calendarEvents, year, month]);

  const thisWeekUrgent = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + 7);
    return calendarEvents.filter(
      (e) =>
        e.daysLeft >= 0 &&
        e.daysLeft <= 7 &&
        new Date(e.date) <= weekEnd
    );
  }, [calendarEvents]);

  const urgentCount = useMemo(() => {
    return calendarEvents.filter((e) => e.daysLeft >= 0 && e.daysLeft <= 3).length;
  }, [calendarEvents]);

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    setSelectedDate(null);
    setShowSidePanel(false);
  };

  const handleDateClick = (date: string, events: CalendarEvent[]) => {
    setSelectedDate(date);
    setSelectedEvents(events);
    setShowSidePanel(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    const dateEvents = calendarEvents.filter((e) => e.date === event.date);
    setSelectedEvents(dateEvents);
    setShowSidePanel(true);
  };

  const closeSidePanel = () => {
    setShowSidePanel(false);
    setSelectedDate(null);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={transitions.normal}
      >
        <h1 className="text-2xl font-bold text-foreground">Calendrier</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visualisez les dates limites des appels d&apos;offres
        </p>
      </motion.div>

      {/* Mini stats */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.05 }}
        className="grid grid-cols-3 gap-3"
      >
        <AnimatedCard variant="outline" hoverLift={false} tapScale={false} className="py-3">
          <AnimatedCardContent className="py-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarIcon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{currentMonthEvents.length}</p>
              <p className="text-[10px] text-muted-foreground">AO ce mois</p>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard variant="outline" hoverLift={false} tapScale={false} className="py-3">
          <AnimatedCardContent className="py-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{thisWeekUrgent.length}</p>
              <p className="text-[10px] text-muted-foreground">Échéances cette semaine</p>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>

        <AnimatedCard variant="outline" hoverLift={false} tapScale={false} className="py-3">
          <AnimatedCardContent className="py-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{urgentCount}</p>
              <p className="text-[10px] text-muted-foreground">Appels urgents</p>
            </div>
          </AnimatedCardContent>
        </AnimatedCard>
      </motion.div>

      {/* Calendar + Side panel */}
      <motion.div
        variants={motionVariants.fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ ...transitions.normal, delay: 0.1 }}
        className="flex gap-4"
      >
        {/* Calendar (takes remaining space) */}
        <div className={cn("flex-1 min-w-0", showSidePanel && "hidden lg:block")}>
          <TenderCalendar
            year={year}
            month={month}
            events={calendarEvents}
            onMonthChange={handleMonthChange}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>

        {/* Side panel (events for selected date) */}
        <AnimatePresence>
          {showSidePanel && selectedDate && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full lg:w-80 shrink-0"
            >
              <AnimatedCard variant="outline" hoverLift={false} tapScale={false} className="py-0 h-full">
                <AnimatedCardHeader className="pt-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {formatDate(selectedDate)}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {selectedEvents.length} appel{selectedEvents.length !== 1 ? "s" : ""} d&apos;offres
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={closeSidePanel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </AnimatedCardHeader>
                <AnimatedCardContent className="pb-4">
                  <Separator className="mb-3" />
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedEvents.map((event) => {
                      const tender = mockTenders.find((t) => t.id === event.tenderId);
                      return (
                        <div key={event.tenderId}>
                          <Link
                            href={`/tenders/${event.tenderId}`}
                            className="block group"
                          >
                            <div className="flex items-start gap-2">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                  event.urgency === "critical" && "bg-red-500",
                                  event.urgency === "warning" && "bg-orange-400",
                                  event.urgency === "moderate" && "bg-yellow-400",
                                  event.urgency === "safe" && "bg-emerald-400"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                                  {event.tenderTitle}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  {event.tenderRef}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-[9px] h-4">
                                    {event.sector}
                                  </Badge>
                                  {event.daysLeft >= 0 ? (
                                    <span
                                      className={cn(
                                        "text-[10px] font-semibold",
                                        event.urgency === "critical" && "text-red-600 dark:text-red-400",
                                        event.urgency === "warning" && "text-orange-600 dark:text-orange-400",
                                        event.urgency === "moderate" && "text-yellow-600 dark:text-yellow-400",
                                        event.urgency === "safe" && "text-emerald-600 dark:text-emerald-400"
                                      )}
                                    >
                                      {event.daysLeft}j restant{event.daysLeft !== 1 ? "s" : ""}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-muted-foreground">Expiré</span>
                                  )}
                                </div>
                                {tender && (
                                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                    <span className="flex items-center gap-0.5">
                                      <MapPin className="w-2.5 h-2.5" />
                                      {tender.region}
                                    </span>
                                    <span className="flex items-center gap-0.5">
                                      <Target className="w-2.5 h-2.5" />
                                      {formatCurrency(tender.budget_max)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0 flex items-center gap-1">
                                <FavoriteButton tenderId={event.tenderId} size="sm" />
                                <ChevronRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </Link>
                          <Separator className="mt-3" />
                        </div>
                      );
                    })}
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile: Agenda/List view below calendar when no side panel */}
      <div className="lg:hidden">
        <h3 className="text-sm font-semibold text-foreground mb-2">
          Échéances à venir
        </h3>
        <div className="space-y-2">
          {calendarEvents
            .filter((e) => e.daysLeft >= 0)
            .sort((a, b) => a.daysLeft - b.daysLeft)
            .slice(0, 10)
            .map((event) => {
              const tender = mockTenders.find((t) => t.id === event.tenderId);
              return (
                <Link key={event.tenderId} href={`/tenders/${event.tenderId}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        event.urgency === "critical" && "bg-red-500",
                        event.urgency === "warning" && "bg-orange-400",
                        event.urgency === "moderate" && "bg-yellow-400",
                        event.urgency === "safe" && "bg-emerald-400"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {event.tenderTitle}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {event.tenderRef} · {formatDate(event.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-semibold shrink-0",
                        event.urgency === "critical" && "text-red-600",
                        event.urgency === "warning" && "text-orange-600",
                        event.urgency === "moderate" && "text-yellow-600",
                        event.urgency === "safe" && "text-emerald-600"
                      )}
                    >
                      {event.daysLeft}j
                    </span>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
