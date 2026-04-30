"use client";

import { motion } from "framer-motion";
import { Search, Download, Heart, GitCompare } from "lucide-react";
import { AnimatedCard, AnimatedCardContent } from "@/components/ui/animated-card";
import { useRouter } from "next/navigation";

interface QuickActionsWidgetProps {
  isCustomizing?: boolean;
}

const quickActions = [
  {
    icon: Search,
    title: "Nouvelle recherche",
    desc: "Rechercher des appels d'offres",
    color: "bg-blue-500/10 text-blue-600",
    href: "/tenders",
  },
  {
    icon: Download,
    title: "Export rapport",
    desc: "Télécharger un rapport PDF",
    color: "bg-emerald-500/10 text-emerald-600",
    href: "/analytics",
  },
  {
    icon: Heart,
    title: "Voir favoris",
    desc: "Appels d'offres sauvegardés",
    color: "bg-rose-500/10 text-rose-600",
    href: "/favorites",
  },
  {
    icon: GitCompare,
    title: "Comparer les AO",
    desc: "Comparer les appels d'offres",
    color: "bg-purple-500/10 text-purple-600",
    href: "/comparison",
  },
];

export function QuickActionsWidget({ isCustomizing }: QuickActionsWidgetProps) {
  const router = useRouter();

  return (
    <AnimatedCard hoverLift={false} className={isCustomizing ? "ring-2 ring-primary/30 ring-offset-2 ring-offset-background" : ""}>
      <AnimatedCardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(action.href)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors text-left group"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} shrink-0 group-hover:scale-105 transition-transform`}>
                <action.icon className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">{action.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </AnimatedCardContent>
    </AnimatedCard>
  );
}
