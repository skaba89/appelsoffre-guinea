"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import {
  LayoutDashboard,
  FileText,
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
  X,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Appels d'offres", href: "/tenders", icon: Search },
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = role === "tenant_admin" || role === "super_admin";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">TenderFlow</h1>
            <p className="text-[10px] text-muted-foreground">Guinée</p>
          </div>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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
              <div className="pt-4 pb-1 px-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Admin
                </p>
              </div>
              {adminNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
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

        {/* User section */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.full_name || "Utilisateur"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                logout();
                window.location.href = "/auth/login";
              }}
              className="text-muted-foreground hover:text-destructive"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6 text-muted-foreground" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link href="/alerts" className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
