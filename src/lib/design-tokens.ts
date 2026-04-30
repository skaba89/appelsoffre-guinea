/**
 * TenderFlow Premium Design Tokens
 * 
 * Centralized design tokens for consistent theming across the application.
 * These tokens feed into CSS variables, component props, and chart configurations.
 */

// ===== Spacing Scale =====
export const spacing = {
  0: "0px",
  0.5: "2px",
  1: "4px",
  1.5: "6px",
  2: "8px",
  2.5: "10px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
} as const;

// ===== Animation Durations =====
export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
  deliberate: 1000,
} as const;

// ===== Easing Functions =====
export const easing = {
  premium: [0.4, 0, 0.2, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  out: [0, 0, 0.2, 1] as const,
  inOut: [0.4, 0, 0.6, 1] as const,
} as const;

// ===== Gradient Definitions =====
export const gradients = {
  /** Primary blue gradient — professional and refined */
  primary: {
    from: "oklch(0.424 0.199 265.638)",
    via: "oklch(0.546 0.245 262.881)",
    to: "oklch(0.488 0.243 264.376)",
    css: "linear-gradient(135deg, oklch(0.424 0.199 265.638), oklch(0.546 0.245 262.881))",
    className: "from-primary via-primary/90 to-primary/80",
  },
  /** Subtle surface gradient for backgrounds */
  surface: {
    from: "oklch(0.985 0 0)",
    via: "oklch(0.97 0 0)",
    to: "oklch(0.985 0 0)",
    css: "linear-gradient(180deg, oklch(0.985 0 0), oklch(0.97 0 0))",
    className: "from-background via-muted to-background",
  },
  /** Success/positive gradient */
  success: {
    from: "oklch(0.596 0.145 163.225)",
    to: "oklch(0.696 0.17 162.48)",
    css: "linear-gradient(135deg, oklch(0.596 0.145 163.225), oklch(0.696 0.17 162.48))",
    className: "from-success to-emerald-400",
  },
  /** Warning/caution gradient */
  warning: {
    from: "oklch(0.769 0.188 70.08)",
    to: "oklch(0.828 0.189 84.429)",
    css: "linear-gradient(135deg, oklch(0.769 0.188 70.08), oklch(0.828 0.189 84.429))",
    className: "from-warning to-amber-400",
  },
  /** Destructive/error gradient */
  destructive: {
    from: "oklch(0.577 0.245 27.325)",
    to: "oklch(0.704 0.191 22.216)",
    css: "linear-gradient(135deg, oklch(0.577 0.245 27.325), oklch(0.704 0.191 22.216))",
    className: "from-destructive to-red-400",
  },
  /** Badge accent gradient — subtle animated */
  badge: {
    from: "oklch(0.424 0.199 265.638)",
    to: "oklch(0.398 0.07 227.392)",
    css: "linear-gradient(135deg, oklch(0.424 0.199 265.638), oklch(0.398 0.07 227.392))",
    className: "from-primary to-blue-700",
  },
} as const;

// ===== Shadow Levels =====
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 6px -1px rgb(0 0 0 / 0.02)",
  md: "0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 12px -2px rgb(0 0 0 / 0.04)",
  lg: "0 4px 8px -2px rgb(0 0 0 / 0.05), 0 12px 24px -4px rgb(0 0 0 / 0.06)",
  xl: "0 8px 16px -4px rgb(0 0 0 / 0.06), 0 24px 48px -8px rgb(0 0 0 / 0.08)",
  glow: "0 0 20px oklch(0.424 0.199 265.638 / 0.15)",
  inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.04)",
} as const;

// ===== Chart Color Palettes =====
export const chartColors = {
  /** Main chart palette — matches CSS --chart-1 through --chart-5 */
  primary: [
    "oklch(0.646 0.222 41.116)",   // chart-1 warm orange
    "oklch(0.6 0.118 184.704)",    // chart-2 teal
    "oklch(0.398 0.07 227.392)",   // chart-3 steel blue
    "oklch(0.828 0.189 84.429)",   // chart-4 yellow
    "oklch(0.769 0.188 70.08)",    // chart-5 gold
  ],
  /** Blue monochrome palette for single-metric charts */
  blue: [
    "oklch(0.35 0.15 265)",
    "oklch(0.42 0.19 265)",
    "oklch(0.50 0.22 263)",
    "oklch(0.58 0.24 262)",
    "oklch(0.66 0.20 263)",
  ],
  /** Status palette — semantic colors for KPIs */
  status: {
    positive: "oklch(0.596 0.145 163.225)",
    neutral: "oklch(0.556 0 0)",
    negative: "oklch(0.577 0.245 27.325)",
    warning: "oklch(0.769 0.188 70.08)",
    info: "oklch(0.546 0.245 262.881)",
  },
} as const;

// ===== Border Radius =====
export const radius = {
  sm: "calc(0.625rem - 4px)",
  md: "calc(0.625rem - 2px)",
  lg: "0.625rem",
  xl: "calc(0.625rem + 4px)",
  full: "9999px",
} as const;

// ===== Z-Index Scale =====
export const zIndex = {
  base: 0,
  dropdown: 50,
  sticky: 100,
  overlay: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
} as const;

// ===== Framer Motion Variants =====
export const motionVariants = {
  /** Fade in from below */
  fadeInUp: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  },
  /** Fade in with scale */
  fadeInScale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
  /** Slide in from left */
  slideInLeft: {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0 },
  },
  /** Slide in from right */
  slideInRight: {
    hidden: { opacity: 0, x: 16 },
    visible: { opacity: 1, x: 0 },
  },
  /** Staggered children container */
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  },
  /** Staggered children item */
  staggerItem: {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
  },
} as const;

// ===== Default Transition Configs =====
export const transitions = {
  fast: {
    duration: duration.fast / 1000,
    ease: easing.premium as unknown as number[],
  },
  normal: {
    duration: duration.normal / 1000,
    ease: easing.premium as unknown as number[],
  },
  slow: {
    duration: duration.slow / 1000,
    ease: easing.premium as unknown as number[],
  },
  spring: {
    duration: duration.normal / 1000,
    ease: easing.spring as unknown as number[],
  },
} as const;

// ===== Typography Scale =====
export const typography = {
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
