"use client";

import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavoritesStore } from "@/stores/favorites-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  tenderId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function FavoriteButton({
  tenderId,
  size = "md",
  className,
  showLabel = false,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favored = isFavorite(tenderId);

  const iconSize = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const buttonSize = {
    sm: "h-7 w-7" as const,
    md: "h-8 w-8" as const,
    lg: "h-9 w-9" as const,
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative rounded-full transition-colors",
        favored
          ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "text-muted-foreground hover:text-red-400 hover:bg-accent",
        buttonSize[size],
        showLabel && "w-auto gap-1.5 px-2",
        className
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(tenderId);
      }}
      aria-label={favored ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={favored ? "filled" : "outline"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {favored ? (
            <Heart className={cn(iconSize[size], "fill-current")} />
          ) : (
            <Heart className={iconSize[size]} />
          )}
        </motion.div>
      </AnimatePresence>
      {showLabel && (
        <span className="text-xs font-medium">
          {favored ? "Favori" : "Favori"}
        </span>
      )}
    </Button>
  );
}
