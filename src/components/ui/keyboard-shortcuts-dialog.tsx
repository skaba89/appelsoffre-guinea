"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  useKeyboardShortcuts,
  formatShortcutKey,
  shortcutCategoryLabels,
} from "@/hooks/use-keyboard-shortcuts";

/**
 * KeyboardShortcutsDialog — Dialog showing all keyboard shortcuts.
 * 
 * Triggered by Cmd/Ctrl+/ or programmatically.
 * Organized by category with key combinations and descriptions.
 */
export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const { shortcuts } = useKeyboardShortcuts();

  // Listen for custom toggle event from the keyboard hook
  useEffect(() => {
    function handleToggle() {
      setOpen((prev) => !prev);
    }
    window.addEventListener("toggle-keyboard-shortcuts", handleToggle);
    return () => window.removeEventListener("toggle-keyboard-shortcuts", handleToggle);
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, typeof shortcuts> = {};
    shortcuts.forEach((shortcut) => {
      const cat = shortcut.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(shortcut);
    });
    return groups;
  }, [shortcuts]);

  const categoryOrder = ["navigation", "actions", "general"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Raccourcis clavier
          </DialogTitle>
          <DialogDescription>
            Utilisez ces raccourcis pour naviguer plus rapidement dans TenderFlow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {categoryOrder.map((category) => {
            const groupShortcuts = groupedShortcuts[category];
            if (!groupShortcuts || groupShortcuts.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  {shortcutCategoryLabels[category] || category}
                </h3>
                <div className="space-y-1.5">
                  {groupShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.id}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {formatShortcutKey(shortcut.keys).split("+").map((part, i, arr) => (
                          <React.Fragment key={i}>
                            <kbd className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 text-[11px] font-mono font-medium rounded border border-border bg-muted text-muted-foreground shadow-sm">
                              {part}
                            </kbd>
                            {i < arr.length - 1 && (
                              <span className="text-[10px] text-muted-foreground">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mt-3" />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] text-muted-foreground">
            ⌘ = Cmd (Mac) / Ctrl (Windows)
          </p>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
