"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Bell, Download, Settings2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { Button } from "@/components/ui/button";
import { GradientBadge } from "@/components/ui/gradient-badge";
import { motionVariants } from "@/lib/design-tokens";

// Widget components
import { StatsOverviewWidget } from "@/components/dashboard-widgets/stats-overview-widget";
import { RecentTendersWidget } from "@/components/dashboard-widgets/recent-tenders-widget";
import { GuineaMapWidget } from "@/components/dashboard-widgets/guinea-map-widget";
import { ScoreDistributionWidget } from "@/components/dashboard-widgets/score-distribution-widget";
import { SectorChartWidget } from "@/components/dashboard-widgets/sector-chart-widget";
import { DeadlineAlertsWidget } from "@/components/dashboard-widgets/deadline-alerts-widget";
import { QuickActionsWidget } from "@/components/dashboard-widgets/quick-actions-widget";
import { WidgetWrapper } from "@/components/dashboard-widgets/widget-wrapper";
import { CustomizationPanel } from "@/components/dashboard-widgets/customization-panel";

// Activity timeline
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { useActivityStore } from "@/stores/activity-store";

function renderWidget(type: string, isCustomizing: boolean) {
  switch (type) {
    case "StatsOverview":
      return <StatsOverviewWidget isCustomizing={isCustomizing} />;
    case "RecentTenders":
      return <RecentTendersWidget isCustomizing={isCustomizing} />;
    case "GuineaMap":
      return <GuineaMapWidget isCustomizing={isCustomizing} />;
    case "ScoreDistribution":
      return <ScoreDistributionWidget isCustomizing={isCustomizing} />;
    case "SectorChart":
      return <SectorChartWidget isCustomizing={isCustomizing} />;
    case "DeadlineAlerts":
      return <DeadlineAlertsWidget isCustomizing={isCustomizing} />;
    case "QuickActions":
      return <QuickActionsWidget isCustomizing={isCustomizing} />;
    default:
      return null;
  }
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { isCustomizing, setCustomizing, getVisibleWidgets } = useDashboardStore();
  const { getFilteredActivities } = useActivityStore();
  const [panelOpen, setPanelOpen] = useState(false);

  const firstName = user?.full_name?.split(" ")[0] || "Utilisateur";
  const today = useMemo(() => {
    return new Date().toLocaleDateString("fr-FR", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
  }, []);

  const visibleWidgets = getVisibleWidgets();
  const recentActivities = getFilteredActivities().slice(0, 10);

  return (
    <motion.div
      className="space-y-6"
      variants={motionVariants.staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ===== Hero Section ===== */}
      <motion.div variants={motionVariants.staggerItem} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Nouveau scan
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Bell className="h-4 w-4" />
            Alertes
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button
            variant={isCustomizing ? "default" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => {
              if (isCustomizing) {
                setCustomizing(false);
              } else {
                setCustomizing(true);
                setPanelOpen(true);
              }
            }}
          >
            <Settings2 className="h-4 w-4" />
            Personnaliser
          </Button>
          {isCustomizing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <GradientBadge variant="primary" size="sm" animated>
                Mode édition
              </GradientBadge>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* ===== Widget Grid — Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {visibleWidgets.map((widget, index) => (
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              isCustomizing={isCustomizing}
              index={index}
              totalVisible={visibleWidgets.length}
            >
              {renderWidget(widget.type, isCustomizing)}
            </WidgetWrapper>
          ))}
        </AnimatePresence>
      </div>

      {/* ===== Activity Timeline Section ===== */}
      <motion.div variants={motionVariants.staggerItem}>
        <ActivityTimeline activities={recentActivities} maxVisible={10} />
      </motion.div>

      {/* ===== Customization Panel ===== */}
      <CustomizationPanel
        open={panelOpen}
        onClose={() => {
          setPanelOpen(false);
          setCustomizing(false);
        }}
      />

      {/* Click-away to exit customization */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[-1]"
          onClick={() => {
            setCustomizing(false);
            setPanelOpen(false);
          }}
        />
      )}
    </motion.div>
  );
}
