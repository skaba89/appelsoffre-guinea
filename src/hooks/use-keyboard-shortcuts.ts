"use client";

import { useEffect, useCallback, useRef, useState } from "react";

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Unique identifier */
  id: string;
  /** Key combination (e.g., "mod+k", "escape") */
  keys: string;
  /** Description shown in the shortcuts dialog */
  description: string;
  /** Category for grouping */
  category: "navigation" | "actions" | "general";
  /** Handler function */
  handler: () => void;
  /** Whether the shortcut is currently active */
  enabled?: boolean;
}

interface UseKeyboardShortcutsReturn {
  /** Register a new keyboard shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Unregister a keyboard shortcut by id */
  unregisterShortcut: (id: string) => void;
  /** List of all registered shortcuts */
  shortcuts: KeyboardShortcut[];
}

// Global shortcuts store (shared across hook instances)
const shortcutsRef = new Map<string, KeyboardShortcut>();
const listenersRef = new Set<() => void>();

function notifyListeners() {
  listenersRef.forEach((listener) => listener());
}

/**
 * Parse a key combination string into its components.
 * Examples:
 *   "mod+k" → { mod: true, key: "k" }
 *   "escape" → { mod: false, key: "Escape" }
 *   "ctrl+shift+p" → { ctrl: true, shift: true, key: "p" }
 */
function parseKeys(keys: string): { mod: boolean; ctrl: boolean; shift: boolean; alt: boolean; key: string } {
  const parts = keys.toLowerCase().split("+");
  const result = {
    mod: false,
    ctrl: false,
    shift: false,
    alt: false,
    key: "",
  };

  for (const part of parts) {
    switch (part) {
      case "mod":
        result.mod = true;
        break;
      case "ctrl":
        result.ctrl = true;
        break;
      case "shift":
        result.shift = true;
        break;
      case "alt":
        result.alt = true;
        break;
      case "escape":
        result.key = "Escape";
        break;
      case "enter":
        result.key = "Enter";
        break;
      case "tab":
        result.key = "Tab";
        break;
      case "/":
        result.key = "/";
        break;
      default:
        result.key = part;
    }
  }

  return result;
}

/**
 * Check if a keyboard event matches a shortcut definition.
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const parsed = parseKeys(shortcut.keys);
  const isMod = event.metaKey || event.ctrlKey;

  if (parsed.mod && !isMod) return false;
  if (parsed.ctrl && !event.ctrlKey) return false;
  if (parsed.shift && !event.shiftKey) return false;
  if (parsed.alt && !event.altKey) return false;

  // Key comparison
  const eventKey = event.key;
  if (parsed.key === eventKey) return true;
  if (parsed.key === eventKey.toLowerCase()) return true;

  return false;
}

/**
 * useKeyboardShortcuts — Global keyboard shortcuts hook.
 * 
 * Built-in shortcuts:
 *   - Cmd/Ctrl+K → Open search
 *   - Cmd/Ctrl+N → New tender search
 *   - Cmd/Ctrl+E → Export
 *   - Cmd/Ctrl+/ → Show keyboard shortcuts help
 *   - Escape → Close dialogs/modals
 * 
 * Returns:
 *   - registerShortcut: Add a new shortcut
 *   - unregisterShortcut: Remove a shortcut by id
 *   - shortcuts: Current list of all shortcuts
 */
export function useKeyboardShortcuts(): UseKeyboardShortcutsReturn {
  const [, forceUpdate] = useState(0);
  const registeredIds = useRef<Set<string>>(new Set());

  // Subscribe to changes
  useEffect(() => {
    const listener = () => forceUpdate((n) => n + 1);
    listenersRef.add(listener);
    return () => {
      listenersRef.delete(listener);
    };
  }, []);

  // Register default shortcuts on mount
  useEffect(() => {
    const defaults: KeyboardShortcut[] = [
      {
        id: "search",
        keys: "mod+k",
        description: "Ouvrir la recherche",
        category: "navigation",
        handler: () => {
          // Focus search if available
          const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Recherch"]');
          if (searchInput) {
            searchInput.focus();
          }
        },
      },
      {
        id: "new-tender",
        keys: "mod+n",
        description: "Nouvelle recherche d'appels d'offres",
        category: "actions",
        handler: () => {
          window.location.href = "/tenders";
        },
      },
      {
        id: "export",
        keys: "mod+e",
        description: "Exporter les données",
        category: "actions",
        handler: () => {
          // Trigger export button if visible
          const exportBtn = document.querySelector<HTMLButtonElement>('[data-export-trigger]');
          if (exportBtn) {
            exportBtn.click();
          }
        },
      },
      {
        id: "shortcuts-help",
        keys: "mod+/",
        description: "Afficher les raccourcis clavier",
        category: "general",
        handler: () => {
          // Dispatch custom event for the dialog to listen to
          window.dispatchEvent(new CustomEvent("toggle-keyboard-shortcuts"));
        },
      },
      {
        id: "escape",
        keys: "escape",
        description: "Fermer les dialogues et modales",
        category: "general",
        handler: () => {
          // Close any open dialog/sheet/modal
          const escapeTarget = document.querySelector<HTMLElement>('[data-state="open"] [data-radix-collection-item], [data-state="open"]');
          if (escapeTarget) {
            const closeBtn = document.querySelector<HTMLButtonElement>('[data-state="open"] button[aria-label="Fermer"], [data-state="open"] button[data-dismiss]');
            if (closeBtn) {
              closeBtn.click();
            }
          }
          // Dispatch custom event for other components
          window.dispatchEvent(new CustomEvent("keyboard-escape"));
        },
      },
    ];

    defaults.forEach((shortcut) => {
      if (!shortcutsRef.has(shortcut.id)) {
        shortcutsRef.set(shortcut.id, shortcut);
        registeredIds.current.add(shortcut.id);
      }
    });

    notifyListeners();

    return () => {
      // Only remove shortcuts that were registered by this instance
      registeredIds.current.forEach((id) => {
        shortcutsRef.delete(id);
      });
      registeredIds.current.clear();
      notifyListeners();
    };
  }, []);

  // Global keydown listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const target = event.target as HTMLElement;
      const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

      for (const shortcut of shortcutsRef.values()) {
        if (shortcut.enabled === false) continue;

        // Allow Escape even in input fields
        if (isInputField && shortcut.keys !== "escape") continue;

        if (matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    shortcutsRef.set(shortcut.id, shortcut);
    registeredIds.current.add(shortcut.id);
    notifyListeners();
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    shortcutsRef.delete(id);
    registeredIds.current.delete(id);
    notifyListeners();
  }, []);

  return {
    registerShortcut,
    unregisterShortcut,
    shortcuts: Array.from(shortcutsRef.values()),
  };
}

/**
 * Shortcut key display helper.
 * Returns a formatted string for display (e.g., "⌘K", "Ctrl+/", "Esc")
 */
export function formatShortcutKey(keys: string): string {
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const modSymbol = isMac ? "⌘" : "Ctrl+";

  return keys
    .replace("mod+", modSymbol)
    .replace("ctrl+", "Ctrl+")
    .replace("shift+", isMac ? "⇧" : "Shift+")
    .replace("alt+", isMac ? "⌥" : "Alt+")
    .replace("escape", "Esc")
    .replace("enter", "↵")
    .replace("tab", "⇥")
    .toUpperCase();
}

/**
 * Category labels (French)
 */
export const shortcutCategoryLabels: Record<string, string> = {
  navigation: "Navigation",
  actions: "Actions",
  general: "Général",
};
