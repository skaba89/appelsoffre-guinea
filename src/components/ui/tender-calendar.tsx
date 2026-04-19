"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  date: string; // ISO date string YYYY-MM-DD
  tenderId: string;
  tenderTitle: string;
  tenderRef: string;
  sector: string;
  urgency: "critical" | "warning" | "moderate" | "safe";
  daysLeft: number;
}

interface TenderCalendarProps {
  /** Current viewed year */
  year: number;
  /** Current viewed month (0-indexed) */
  month: number;
  /** Calendar events */
  events: CalendarEvent[];
  /** Called when month changes */
  onMonthChange: (year: number, month: number) => void;
  /** Called when a date is clicked */
  onDateClick?: (date: string, events: CalendarEvent[]) => void;
  /** Called when an event is clicked */
  onEventClick?: (event: CalendarEvent) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const DAY_NAMES = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, 1 = Monday, etc.
  const day = new Date(year, month, 1).getDay();
  // Convert to Monday-based (0 = Monday, 6 = Sunday)
  return day === 0 ? 6 : day - 1;
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "critical":
      return "bg-red-500";
    case "warning":
      return "bg-orange-400";
    case "moderate":
      return "bg-yellow-400";
    case "safe":
      return "bg-emerald-400";
    default:
      return "bg-muted-foreground";
  }
}

function urgencyDotBorder(urgency: string): string {
  switch (urgency) {
    case "critical":
      return "border-red-200 dark:border-red-900/40";
    case "warning":
      return "border-orange-200 dark:border-orange-900/40";
    case "moderate":
      return "border-yellow-200 dark:border-yellow-900/40";
    case "safe":
      return "border-emerald-200 dark:border-emerald-900/40";
    default:
      return "border-border";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TenderCalendar({
  year,
  month,
  events,
  onMonthChange,
  onDateClick,
  onEventClick,
}: TenderCalendarProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Group events by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const existing = map.get(event.date) || [];
      existing.push(event);
      map.set(event.date, existing);
    });
    return map;
  }, [events]);

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(year - 1, 11);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(year + 1, 0);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const handleToday = () => {
    onMonthChange(today.getFullYear(), today.getMonth());
  };

  // Build calendar grid
  const cells: (number | null)[] = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  // Day cells
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  // Fill remaining cells to complete the week
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs">
            Aujourd&apos;hui
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Day names header */}
        <div className="grid grid-cols-7 bg-muted/50">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[80px] sm:min-h-[100px] border-b border-r border-border bg-muted/20 last:border-r-0"
                />
              );
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayEvents = eventsByDate.get(dateStr) || [];
            const isToday = dateStr === todayStr;
            const isWeekend = idx % 7 >= 5;

            return (
              <motion.div
                key={dateStr}
                className={cn(
                  "min-h-[80px] sm:min-h-[100px] border-b border-r border-border p-1.5 sm:p-2 transition-colors last:border-r-0",
                  isToday && "bg-primary/5",
                  isWeekend && "bg-muted/10",
                  dayEvents.length > 0 && "cursor-pointer hover:bg-accent/30"
                )}
                onClick={() => {
                  if (dayEvents.length > 0 && onDateClick) {
                    onDateClick(dateStr, dayEvents);
                  }
                }}
                whileHover={dayEvents.length > 0 ? { scale: 1.01 } : undefined}
                transition={{ duration: 0.15 }}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      "text-xs font-medium inline-flex items-center justify-center",
                      isToday
                        ? "w-6 h-6 rounded-full bg-primary text-primary-foreground"
                        : "text-foreground"
                    )}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event, eIdx) => (
                      <button
                        key={eIdx}
                        type="button"
                        className="w-full text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div
                          className={cn(
                            "flex items-center gap-1 px-1 py-0.5 rounded text-[9px] sm:text-[10px] font-medium border truncate",
                            urgencyDotBorder(event.urgency)
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              urgencyColor(event.urgency)
                            )}
                          />
                          <span className="truncate text-foreground/80">
                            {event.tenderRef}
                          </span>
                        </div>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-muted-foreground pl-1">
                        +{dayEvents.length - 3} autres
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Urgence :</span>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>≤ 3 jours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
          <span>≤ 7 jours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span>≤ 14 jours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>&gt; 14 jours</span>
        </div>
      </div>
    </div>
  );
}
