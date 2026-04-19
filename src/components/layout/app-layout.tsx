"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  LayoutDashboard,
  Search,
  Users,
  Bot,
  FileCode,
  FolderOpen,
  Bell,
  Settings,
  Shield,
  CreditCard,
  Building2,
  LogOut,
  Moon,
  Sun,
  Menu,
  FileText,
  BarChart3,
  Workflow,
  MoreHorizontal,
  Kanban,
  SearchCheck,
  Heart,
  Calendar,
  GitCompareArrows,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appels d'offres", href: "/tenders", icon: Search },
  { name: "Comparaison", href: "/comparison", icon: GitCompareArrows },
  { name: "Favoris", href: "/favorites", icon: Heart },
  { name: "Calendrier", href: "/calendar", icon: Calendar },
  { name: "Pipeline", href: "/pipeline", icon: Kanban },
  { name: "Recherche", href: "/search", icon: SearchCheck },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Rapports", href: "/reports", icon: FileText },
  { name: "Workflows", href: "/workflows", icon: Workflow },
  { name: "CRM", href: "/crm/accounts", icon: Users },
  { name: "Assistant IA", href: "/ai", icon: Bot },
  { name: "Prompts", href: "/prompts", icon: FileCode },
  { name: "Documents", href: "/documents", icon: FolderOpen },
  { name: "Alertes", href: "/alerts", icon: Bell },
  { name: "Profil entreprise", href: "/company", icon: Building2 },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

const adminNavigation = [
  { name: "Administration", href: "/admin", icon: Shield },
  { name: "Abonnement", href: "/billing", icon: CreditCard },
];

// Mobile bottom nav items (top 5 most used)
const mobileNavItems = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appels d'offres", href: "/tenders", icon: Search },
  { name: "Assistant IA", href: "/ai", icon: Bot },
  { name: "Alertes", href: "/alerts", icon: Bell },
  { name: "Plus", href: "#more", icon: MoreHorizontal },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuthStore();
  const isAdmin = role === "tenant_admin" || role === "super_admin";

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <Separator className="my-3" />
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Administration
            </p>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </ScrollArea>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Using useLayoutEffect to set mounted flag before paint
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const unreadAlerts = 4; // demo value

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-border bg-card">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">TenderFlow</h1>
            <p className="text-[10px] text-muted-foreground">Guinée</p>
          </div>
        </div>

        <SidebarNav />

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                {user?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.full_name || "Utilisateur"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2.5 px-6 border-b border-border">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">TenderFlow</h1>
              <p className="text-[10px] text-muted-foreground">Guinée</p>
            </div>
          </div>
          <SidebarNav onNavigate={() => setMobileOpen(false)} />
          <div className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {user?.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => { logout(); window.location.href = "/login"; }}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div className="lg:pl-64 flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="h-14 lg:h-16 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between px-3 lg:px-6 shrink-0 sticky top-0 z-30">
          {/* Left: Mobile menu + Logo on mobile */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            {/* Mobile logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">TenderFlow</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="text-muted-foreground h-9 w-9"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            )}

            {/* Notifications */}
            <Link href="/alerts">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground h-9 w-9">
                <Bell className="w-4 h-4" />
                {unreadAlerts > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                    {unreadAlerts}
                  </span>
                )}
              </Button>
            </Link>

            {/* Avatar (mobile only, desktop shows in sidebar) */}
            <Avatar className="h-8 w-8 lg:hidden">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {user?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Page content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom">
        <div className="flex items-center justify-around h-14">
          {mobileNavItems.map((item) => {
            // "More" button opens the sidebar
            if (item.href === "#more") {
              return (
                <button
                  key={item.name}
                  onClick={() => setMobileOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 w-full h-full text-muted-foreground hover:text-foreground transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px]">{item.name}</span>
                </button>
              );
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            // Special case: alerts badge
            const isAlerts = item.href === "/alerts";

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors relative",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {isAlerts && unreadAlerts > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3 h-3 bg-destructive rounded-full" />
                  )}
                </div>
                <span className={cn("text-[10px]", isActive && "font-semibold")}>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
