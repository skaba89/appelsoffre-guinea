"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { SECTORS, REGIONS } from "@/lib/tenderflow-utils";
import { motionVariants, transitions } from "@/lib/design-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Rocket,
  Building2,
  SlidersHorizontal,
  PartyPopper,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  MapPin,
  Briefcase,
  Check,
  X,
} from "lucide-react";

const COMPANY_SIZES = [
  { value: "tpe", label: "TPE", description: "Moins de 10 employés" },
  { value: "pme", label: "PME", description: "10 à 250 employés" },
  { value: "eti", label: "ETI", description: "250 à 5 000 employés" },
  { value: "grande", label: "Grande entreprise", description: "Plus de 5 000 employés" },
];

const BUDGET_RANGES = [
  { value: "small", label: "< 2 Mrd GNF" },
  { value: "medium", label: "2 — 10 Mrd GNF" },
  { value: "large", label: "10 — 30 Mrd GNF" },
  { value: "very_large", label: "> 30 Mrd GNF" },
];

const NOTIFICATION_FREQUENCIES = [
  { value: "temps_reel", label: "Temps réel", icon: "⚡" },
  { value: "quotidien", label: "Quotidien", icon: "📧" },
  { value: "hebdomadaire", label: "Hebdomadaire", icon: "📅" },
  { value: "desactive", label: "Désactivé", icon: "🔇" },
];

const STEPS = [
  { title: "Bienvenue", icon: Rocket },
  { title: "Votre profil", icon: Building2 },
  { title: "Vos préférences", icon: SlidersHorizontal },
  { title: "Terminé !", icon: PartyPopper },
];

export default function OnboardingPage() {
  const router = useRouter();
  const {
    currentStep,
    isComplete,
    profile,
    preferences,
    setStep,
    nextStep,
    prevStep,
    setProfile,
    setPreferences,
    completeOnboarding,
    skipOnboarding,
  } = useOnboardingStore();

  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isComplete && mounted) {
      router.push("/dashboard");
    }
  }, [isComplete, mounted, router]);

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return (
          profile.companyName.trim() !== "" &&
          profile.businessSector !== "" &&
          profile.region !== "" &&
          profile.companySize !== ""
        );
      case 2:
        return (
          preferences.sectorsOfInterest.length > 0 &&
          preferences.regionsOfInterest.length > 0
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    completeOnboarding();
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold text-foreground">TenderFlow</span>
            </div>
            <span className="text-xs text-muted-foreground">
              Étape {currentStep + 1} sur {STEPS.length}
            </span>
          </div>
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className="flex-1 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    idx <= currentStep
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted))",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <StepWelcome
                key="step-0"
                onNext={nextStep}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 1 && (
              <StepProfile
                key="step-1"
                profile={profile}
                setProfile={setProfile}
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 2 && (
              <StepPreferences
                key="step-2"
                preferences={preferences}
                setPreferences={setPreferences}
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={handleSkip}
              />
            )}
            {currentStep === 3 && (
              <StepComplete
                key="step-3"
                profile={profile}
                preferences={preferences}
                onComplete={handleComplete}
                onPrev={prevStep}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer with skip link */}
      <div className="border-t border-border bg-card/50 py-3 text-center">
        {currentStep < 3 && (
          <button
            onClick={handleSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
          >
            Passer l&apos;intégration
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 1: Welcome ──────────────────────────────────────────────────────────

function StepWelcome({
  onNext,
  onSkip,
}: {
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -40 }}
      transition={transitions.normal}
      className="text-center space-y-8"
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="mx-auto"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto shadow-lg">
          <FileText className="w-10 h-10 text-primary-foreground" />
        </div>
      </motion.div>

      {/* Title */}
      <div className="space-y-3">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold text-foreground"
        >
          Bienvenue sur{" "}
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TenderFlow
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-base max-w-md mx-auto"
        >
          Votre plateforme intelligente de veille des appels d&apos;offres en
          République de Guinée. Trouvez, analysez et répondez aux opportunités
          qui correspondent à votre entreprise.
        </motion.p>
      </div>

      {/* Feature highlights */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-4 max-w-sm mx-auto"
      >
        {[
          { icon: Sparkles, label: "IA de scoring" },
          { icon: MapPin, label: "8 régions" },
          { icon: Briefcase, label: "16 secteurs" },
        ].map((feat) => (
          <div key={feat.label} className="flex flex-col items-center gap-1.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <feat.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">{feat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-3"
      >
        <Button
          size="lg"
          className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base"
          onClick={onNext}
        >
          Commencer
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onSkip}
        >
          Passer
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Step 2: Profile ──────────────────────────────────────────────────────────

function StepProfile({
  profile,
  setProfile,
  onNext,
  onPrev,
  onSkip,
}: {
  profile: { companyName: string; businessSector: string; region: string; companySize: string };
  setProfile: (p: Partial<{ companyName: string; businessSector: string; region: string; companySize: string }>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const isValid =
    profile.companyName.trim() !== "" &&
    profile.businessSector !== "" &&
    profile.region !== "" &&
    profile.companySize !== "";

  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -40 }}
      transition={transitions.normal}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Votre profil</h2>
        <p className="text-sm text-muted-foreground">
          Parlez-nous de votre entreprise pour personnaliser votre expérience
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6 space-y-5">
          {/* Company name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Nom de l&apos;entreprise</Label>
            <Input
              id="companyName"
              placeholder="Ex: Société Guinéenne de Construction"
              value={profile.companyName}
              onChange={(e) => setProfile({ companyName: e.target.value })}
            />
          </div>

          {/* Business sector */}
          <div className="space-y-2">
            <Label>Secteur d&apos;activité</Label>
            <Select
              value={profile.businessSector}
              onValueChange={(v) => setProfile({ businessSector: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre secteur" />
              </SelectTrigger>
              <SelectContent>
                {SECTORS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region */}
          <div className="space-y-2">
            <Label>Région</Label>
            <Select
              value={profile.region}
              onValueChange={(v) => setProfile({ region: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre région" />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Company size */}
          <div className="space-y-2">
            <Label>Taille de l&apos;entreprise</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMPANY_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => setProfile({ companySize: size.value })}
                  className={`flex flex-col items-start gap-0.5 p-3 rounded-lg border transition-all text-left ${
                    profile.companySize === size.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <span className="text-sm font-semibold">{size.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {size.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onPrev} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onSkip}
          >
            Passer
          </Button>
          <Button
            size="sm"
            className="gap-1"
            onClick={onNext}
            disabled={!isValid}
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 3: Preferences ──────────────────────────────────────────────────────

function StepPreferences({
  preferences,
  setPreferences,
  onNext,
  onPrev,
  onSkip,
}: {
  preferences: {
    sectorsOfInterest: string[];
    regionsOfInterest: string[];
    budgetRange: string;
    notificationFrequency: string;
  };
  setPreferences: (p: Partial<{
    sectorsOfInterest: string[];
    regionsOfInterest: string[];
    budgetRange: string;
    notificationFrequency: string;
  }>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const toggleSector = (sector: string) => {
    const current = preferences.sectorsOfInterest;
    if (current.includes(sector)) {
      setPreferences({
        sectorsOfInterest: current.filter((s) => s !== sector),
      });
    } else {
      setPreferences({
        sectorsOfInterest: [...current, sector],
      });
    }
  };

  const toggleRegion = (region: string) => {
    const current = preferences.regionsOfInterest;
    if (current.includes(region)) {
      setPreferences({
        regionsOfInterest: current.filter((r) => r !== region),
      });
    } else {
      setPreferences({
        regionsOfInterest: [...current, region],
      });
    }
  };

  const isValid =
    preferences.sectorsOfInterest.length > 0 &&
    preferences.regionsOfInterest.length > 0;

  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -40 }}
      transition={transitions.normal}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
          <SlidersHorizontal className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Vos préférences</h2>
        <p className="text-sm text-muted-foreground">
          Configurez vos alertes et centres d&apos;intérêt
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="pt-6 space-y-6">
          {/* Sectors of interest */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Secteurs d&apos;intérêt
              <span className="text-muted-foreground font-normal ml-1">
                ({preferences.sectorsOfInterest.length} sélectionné{preferences.sectorsOfInterest.length !== 1 ? "s" : ""})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((sector) => {
                const selected = preferences.sectorsOfInterest.includes(sector);
                return (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => toggleSector(sector)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {sector}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Regions of interest */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Régions d&apos;intérêt
              <span className="text-muted-foreground font-normal ml-1">
                ({preferences.regionsOfInterest.length} sélectionnée{preferences.regionsOfInterest.length !== 1 ? "s" : ""})
              </span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((region) => {
                const selected = preferences.regionsOfInterest.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    onClick={() => toggleRegion(region)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3" />}
                    {region}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget range */}
          <div className="space-y-2">
            <Label>Tranche de budget préférée</Label>
            <Select
              value={preferences.budgetRange}
              onValueChange={(v) => setPreferences({ budgetRange: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une tranche" />
              </SelectTrigger>
              <SelectContent>
                {BUDGET_RANGES.map((br) => (
                  <SelectItem key={br.value} value={br.value}>
                    {br.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification frequency */}
          <div className="space-y-2">
            <Label>Fréquence des notifications</Label>
            <div className="grid grid-cols-2 gap-2">
              {NOTIFICATION_FREQUENCIES.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() =>
                    setPreferences({ notificationFrequency: freq.value })
                  }
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    preferences.notificationFrequency === freq.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/30 bg-card"
                  }`}
                >
                  <span className="text-base">{freq.icon}</span>
                  <span className="text-sm font-medium">{freq.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onPrev} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={onSkip}
          >
            Passer
          </Button>
          <Button
            size="sm"
            className="gap-1"
            onClick={onNext}
            disabled={!isValid}
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Step 4: Complete ─────────────────────────────────────────────────────────

function StepComplete({
  profile,
  preferences,
  onComplete,
  onPrev,
}: {
  profile: { companyName: string; businessSector: string; region: string; companySize: string };
  preferences: {
    sectorsOfInterest: string[];
    regionsOfInterest: string[];
    budgetRange: string;
    notificationFrequency: string;
  };
  onComplete: () => void;
  onPrev: () => void;
}) {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const budgetLabel = BUDGET_RANGES.find((b) => b.value === preferences.budgetRange)?.label ?? "—";
  const freqLabel = NOTIFICATION_FREQUENCIES.find((f) => f.value === preferences.notificationFrequency)?.label ?? "—";
  const sizeLabel = COMPANY_SIZES.find((s) => s.value === profile.companySize)?.label ?? "—";

  return (
    <motion.div
      variants={motionVariants.fadeInUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: -40 }}
      transition={transitions.normal}
      className="space-y-6"
    >
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 400),
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: typeof window !== "undefined" ? window.innerHeight + 20 : 800,
                rotate: Math.random() * 720 - 360,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeIn",
              }}
              className="absolute w-2 h-2 rounded-sm"
              style={{
                backgroundColor: [
                  "hsl(var(--primary))",
                  "#f59e0b",
                  "#10b981",
                  "#ef4444",
                  "#8b5cf6",
                  "#ec4899",
                ][i % 6],
              }}
            />
          ))}
        </div>
      )}

      {/* Success animation */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
            delay: 0.2,
          }}
          className="mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground">Terminé !</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Votre profil est configuré. Voici un résumé de vos préférences.
          </p>
        </motion.div>
      </div>

      {/* Summary card */}
      <Card className="border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Entreprise
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Nom</span>
                <p className="font-medium text-foreground mt-0.5">{profile.companyName || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Taille</span>
                <p className="font-medium text-foreground mt-0.5">{sizeLabel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Secteur</span>
                <p className="font-medium text-foreground mt-0.5">{profile.businessSector || "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Région</span>
                <p className="font-medium text-foreground mt-0.5">{profile.region || "—"}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              Préférences
            </h3>
            <div>
              <span className="text-xs text-muted-foreground">Secteurs d&apos;intérêt</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.sectorsOfInterest.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Régions d&apos;intérêt</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {preferences.regionsOfInterest.map((r) => (
                  <Badge key={r} variant="secondary" className="text-[10px]">
                    {r}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Budget</span>
                <p className="font-medium text-foreground mt-0.5">{budgetLabel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Notifications</span>
                <p className="font-medium text-foreground mt-0.5">{freqLabel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onPrev} className="gap-1">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </Button>
        <Button
          size="lg"
          className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          onClick={onComplete}
        >
          Accéder au tableau de bord
          <Rocket className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
