"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronUp, ChevronDown, RotateCcw, Plus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useDashboardStore, WIDGET_TYPES } from "@/stores/dashboard-store";

interface CustomizationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CustomizationPanel({ open, onClose }: CustomizationPanelProps) {
  const { widgets, toggleWidget, moveWidget, resetToDefault, addWidget, setCustomizing } = useDashboardStore();

  const visibleWidgets = widgets
    .filter((w) => w.visible)
    .sort((a, b) => a.order - b.order);

  const hiddenTypes = Object.keys(WIDGET_TYPES).filter(
    (type) => !widgets.some((w) => w.type === type && w.visible)
  );

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) { onClose(); } }}>
      <SheetContent side="right" className="w-80 sm:w-96 p-0">
        <SheetHeader className="p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            Personnaliser le tableau de bord
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            Réorganisez et activez les widgets selon vos besoins
          </p>
        </SheetHeader>

        <Separator />

        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
          {/* Active widgets — reorderable with up/down buttons */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Widgets actifs ({visibleWidgets.length})
            </h4>
            <AnimatePresence>
              {visibleWidgets.map((widget, idx) => {
                const config = WIDGET_TYPES[widget.type];
                if (!config) return null;
                return (
                  <motion.div
                    key={widget.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card mb-2 group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{config.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{config.description}</p>
                    </div>
                    {/* Move up/down buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveWidget(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Monter"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => moveWidget(idx, idx + 1)}
                        disabled={idx === visibleWidgets.length - 1}
                        className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Descendre"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => toggleWidget(widget.id)}
                      className="shrink-0"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add widget section */}
          {hiddenTypes.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Ajouter un widget
                </h4>
                <div className="space-y-2">
                  {hiddenTypes.map((type) => {
                    const config = WIDGET_TYPES[type];
                    if (!config) return null;
                    return (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addWidget(type)}
                        className="flex items-center gap-3 w-full p-3 rounded-lg border border-dashed border-border hover:border-primary/40 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{config.label}</p>
                          <p className="text-[11px] text-muted-foreground">{config.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Reset button */}
          <Separator />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              resetToDefault();
              setCustomizing(false);
              onClose();
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Réinitialiser par défaut
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
