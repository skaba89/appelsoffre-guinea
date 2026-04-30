import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════════════════════════════════════════════
// TenderFlow Guinea — Next.js Middleware
// Security, rate limiting, CORS, bot protection, auth guard, request logging
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Rate Limiting ──────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

const RATE_LIMITS = {
  default: { maxRequests: 100, windowMs: 60_000 },       // 100/min
  api: { maxRequests: 30, windowMs: 60_000 },             // 30/min
  auth: { maxRequests: 5, windowMs: 60_000 },             // 5/min
} as const;

function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith("/api/auth") || pathname === "/login" || pathname === "/register") {
    return RATE_LIMITS.auth;
  }
  if (pathname.startsWith("/api/")) {
    return RATE_LIMITS.api;
  }
  return RATE_LIMITS.default;
}

function checkRateLimit(ip: string, pathname: string): { allowed: boolean; retryAfter?: number } {
  const config = getRateLimitConfig(pathname);
  const key = `${ip}:${config.maxRequests}:${config.windowMs}`;
  const now = Date.now();

  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

// ─── Security Headers ───────────────────────────────────────────────────────────

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "X-XSS-Protection": "1; mode=block",
};

// ─── Bot Protection ─────────────────────────────────────────────────────────────

const BLOCKED_USER_AGENTS = [
  "sqlmap", "nikto", "masscan", "nmap", "dirbuster",
  "gobuster", "wfuzz", "burpsuite", "zap", "acunetix",
  "nessus", "openvas", "w3af", "skipfish", "arachni",
];

const SUSPICIOUS_PATTERNS = [
  /\.\.\//,           // ../
  /\.\.\\/,           // ..\
  /etc\/passwd/i,
  /wp-admin/i,
  /phpMyAdmin/i,
  /phpmyadmin/i,
  /wp-login/i,
  /\.env/i,
  /union\s+select/i,
  /or\s+1\s*=\s*1/i,
  /drop\s+table/i,
  /<script/i,
  /javascript:/i,
  /onerror\s*=/i,
  /onload\s*=/i,
];

function isBot(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return BLOCKED_USER_AGENTS.some((bot) => lowerUA.includes(bot));
}

function hasSuspiciousPattern(url: string): boolean {
  return SUSPICIOUS_PATTERNS.some((pattern) => pattern.test(url));
}

// ─── Auth Route Protection ──────────────────────────────────────────────────────

const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard", "/tenders", "/analytics", "/billing",
  "/workflows", "/documents", "/search", "/prompts",
  "/pipeline", "/crm", "/company", "/alerts", "/ai",
  "/admin", "/settings", "/favorites", "/calendar",
  "/onboarding", "/comparison",
];

const PUBLIC_ROUTES = ["/", "/login", "/register"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/");
}

function isAuthenticated(request: NextRequest): boolean {
  const authCookie = request.cookies.get("tenderflow-auth")?.value;
  const authHeader = request.headers.get("Authorization");
  return !!(authCookie || authHeader);
}

// ─── Request Logging ────────────────────────────────────────────────────────────

function logRequest(
  method: string,
  pathname: string,
  status: number,
  duration: number,
  ip: string,
  suspicious: boolean
) {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    const statusColor =
      status >= 500 ? "\x1b[31m" :
      status >= 400 ? "\x1b[33m" :
      status >= 300 ? "\x1b[36m" :
      "\x1b[32m";

    console.log(
      `\x1b[90m${new Date().toISOString()}\x1b[0m ` +
      `${method} ${pathname} ` +
      `${statusColor}${status}\x1b[0m ` +
      `\x1b[90m${duration}ms\x1b[0m ` +
      `\x1b[90m${ip}\x1b[0m`
    );
  }

  if (suspicious) {
    console.warn(
      `[SECURITY] Requête suspecte détectée: ${method} ${pathname} ` +
      `IP: ${ip} Status: ${status}`
    );
  }
}

// ─── Main Middleware ─────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const { pathname, origin } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  let suspicious = false;

  // ── Bot Protection ──────────────────────────────────────────────────────
  if (isBot(userAgent)) {
    logRequest(request.method, pathname, 403, Date.now() - startTime, ip, true);
    return new NextResponse("Accès refusé", { status: 403 });
  }

  // ── Suspicious Pattern Detection ────────────────────────────────────────
  if (hasSuspiciousPattern(pathname + request.nextUrl.search)) {
    suspicious = true;
    logRequest(request.method, pathname, 403, Date.now() - startTime, ip, true);
    return new NextResponse("Requête bloquée", { status: 403 });
  }

  // ── Rate Limiting ───────────────────────────────────────────────────────
  const rateResult = checkRateLimit(ip, pathname);
  if (!rateResult.allowed) {
    logRequest(request.method, pathname, 429, Date.now() - startTime, ip, suspicious);
    return new NextResponse("Trop de requêtes. Veuillez réessayer plus tard.", {
      status: 429,
      headers: {
        "Retry-After": String(rateResult.retryAfter || 60),
        ...SECURITY_HEADERS,
      },
    });
  }

  // ── CORS Protection for API Routes ──────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    const requestOrigin = request.headers.get("origin");
    // Only allow same-origin requests for API routes
    if (requestOrigin && requestOrigin !== origin) {
      logRequest(request.method, pathname, 403, Date.now() - startTime, ip, suspicious);
      return new NextResponse("Origine non autorisée", { status: 403 });
    }
  }

  // ── Auth Route Protection ───────────────────────────────────────────────
  // NOTE: The app uses client-side auth (Zustand + localStorage).
  // The middleware logs unauthenticated access to protected routes but does NOT
  // redirect, since the (app)/layout.tsx already handles auth with an inline login form.
  // This avoids redirect loops in iframe/SSR contexts where localStorage is inaccessible.
  if (isProtectedRoute(pathname) && !isPublicRoute(pathname) && !isAuthenticated(request)) {
    // For API routes, return 401
    if (pathname.startsWith("/api/")) {
      logRequest(request.method, pathname, 401, Date.now() - startTime, ip, suspicious);
      return NextResponse.json(
        { error: "Non authentifié", message: "Veuillez vous connecter pour accéder à cette ressource." },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }
    // For page routes, log but don't redirect — client-side auth guard handles it
    suspicious = false; // Not suspicious, just unauthenticated
  }

  // ── Continue Request ────────────────────────────────────────────────────
  const response = NextResponse.next();

  // Add security headers to all responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");
  }

  logRequest(request.method, pathname, 200, Date.now() - startTime, ip, suspicious);
  return response;
}

// ─── Matcher Configuration ──────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|logo\\.svg|robots\\.txt).*)",
  ],
};
