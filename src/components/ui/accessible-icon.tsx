"use client";

import React from "react";

/**
 * AccessibleIcon — Wrapper for icons with accessible labels.
 * 
 * - Takes a `label` prop for screen readers
 * - Adds `aria-hidden="true"` to decorative icons
 * - Adds `role="img"` and `aria-label` to meaningful icons
 * 
 * Usage:
 *   <AccessibleIcon label="Rechercher">  → meaningful icon with aria-label
 *   <AccessibleIcon>                     → decorative icon with aria-hidden
 */
export function AccessibleIcon({
  children,
  label,
  className,
}: {
  children: React.ReactNode;
  /** If provided, icon is meaningful and gets aria-label. If omitted, icon is decorative. */
  label?: string;
  className?: string;
}) {
  if (label) {
    return (
      <span role="img" aria-label={label} className={className}>
        {children}
      </span>
    );
  }

  return (
    <span aria-hidden="true" className={className}>
      {children}
    </span>
  );
}
