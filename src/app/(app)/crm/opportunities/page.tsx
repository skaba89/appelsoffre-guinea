"use client";

import { mockOpportunities } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/tenderflow-utils";
import { Plus, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const STAGES = [
  { key: "prospect", label: "Prospect", color: "border-t-blue-500" },
  { key: "qualification", label: "Qualification", color: "border-t-yellow-500" },
  { key: "proposal", label: "Proposition", color: "border-t-purple-500" },
  { key: "negotiation", label: "Négociation", color: "border-t-orange-500" },
  { key: "won", label: "Gagné", color: "border-t-green-500" },
  { key: "lost", label: "Perdu", color: "border-t-gray-400" },
];

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline des opportunités</h1>
          <p className="text-muted-foreground mt-1">{mockOpportunities.length} opportunités en cours</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Nouvelle opportunité</Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {STAGES.map(stage => {
          const opps = mockOpportunities.filter(o => o.stage === stage.key);
          const totalAmount = opps.reduce((sum, o) => sum + o.amount, 0);
          return (
            <div key={stage.key} className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start">
              <div className={cn("rounded-lg border border-border border-t-4 bg-muted/30", stage.color)}>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                    <Badge variant="secondary" className="text-xs">{opps.length}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{formatCurrency(totalAmount)}</p>
                </div>

                <div className="px-3 pb-3 space-y-2">
                  {opps.map(opp => (
                    <Card key={opp.id} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{opp.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opp.account_name}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-semibold text-foreground">{formatCurrency(opp.amount)}</span>
                              <Badge variant="outline" className="text-[10px]">{(opp.probability * 100).toFixed(0)}%</Badge>
                            </div>
                            {opp.tender_ref && (
                              <Link href={`/tenders/${opp.tender_id}`} className="inline-flex items-center gap-1 mt-2 text-xs text-primary hover:underline">
                                <ExternalLink className="w-3 h-3" /> {opp.tender_ref}
                              </Link>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {opps.length === 0 && (
                    <div className="py-6 text-center">
                      <p className="text-xs text-muted-foreground">Aucune opportunité</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
