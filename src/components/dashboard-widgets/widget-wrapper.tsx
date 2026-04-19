"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, X, ChevronUp, ChevronDown } from "lucide-react";
import { useDashboardStore, WIDGET_TYPES, type WidgetLayout } from "@/stores/dashboard-store";

interface WidgetWrapperProps {
  widget: WidgetLayout;
  isCustomizing: boolean;
  index: number;
  totalVisible: number;
  children: React.ReactNode;
}

export function WidgetWrapper({ widget, isCustomizing, index, totalVisible, children }: WidgetWrapperProps) {
  const config = WIDGET_TYPES[widget.type];
  const { removeWidget, moveWidget } = useDashboardStore();

  const sizeClass =
    widget.size === "lg"
      ? "col-span-1 md:col-span-2 lg:col-span-2"
      : widget.size === "md"
        ? "col-span-1"
        : "col-span-1";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`${sizeClass} relative group/widget`}
    >
      {/* Customization overlay controls */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-card border border-border rounded-lg px-2 py-1 shadow-md"
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground cursor-grab" />
            <span className="text-[10px] font-semibold text-foreground max-w-[120px] truncate">
              {config?.label || widget.type}
            </span>
            {/* Move up/down buttons */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => moveWidget(index, index - 1)}
                disabled={index === 0}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Déplacer vers le haut"
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                onClick={() => moveWidget(index, index + 1)}
                disabled={index === totalVisible - 1}
                className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Déplacer vers le bas"
              >
                <ChevronDown className="h-3 w-3" />
              </button>
            </div>
            {/* Remove button */}
            <button
              onClick={() => removeWidget(widget.id)}
              className="ml-1 p-0.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
              title="Masquer ce widget"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Widget content */}
      <div className={isCustomizing ? "ring-2 ring-primary/20 ring-offset-2 ring-offset-background rounded-xl transition-all" : ""}>
        {children}
      </div>
    </motion.div>
  );
}
