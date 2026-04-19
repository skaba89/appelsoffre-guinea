"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface OnboardingProfile {
  companyName: string;
  businessSector: string;
  region: string;
  companySize: string;
}

export interface OnboardingPreferences {
  sectorsOfInterest: string[];
  regionsOfInterest: string[];
  budgetRange: string;
  notificationFrequency: string;
}

interface OnboardingState {
  currentStep: number;
  isComplete: boolean;
  isSkipped: boolean;
  profile: OnboardingProfile;
  preferences: OnboardingPreferences;
  _hasHydrated: boolean;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setProfile: (profile: Partial<OnboardingProfile>) => void;
  setPreferences: (prefs: Partial<OnboardingPreferences>) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  setHasHydrated: (v: boolean) => void;
}

function safeLocalStorage(): Storage | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const testKey = "__tf_ob_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    return undefined;
  }
}

const defaultProfile: OnboardingProfile = {
  companyName: "",
  businessSector: "",
  region: "",
  companySize: "",
};

const defaultPreferences: OnboardingPreferences = {
  sectorsOfInterest: [],
  regionsOfInterest: [],
  budgetRange: "medium",
  notificationFrequency: "quotidien",
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      isComplete: false,
      isSkipped: false,
      profile: { ...defaultProfile },
      preferences: { ...defaultPreferences },
      _hasHydrated: false,

      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, 3) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      setProfile: (profile) =>
        set((s) => ({ profile: { ...s.profile, ...profile } })),

      setPreferences: (prefs) =>
        set((s) => ({ preferences: { ...s.preferences, ...prefs } })),

      completeOnboarding: () => set({ isComplete: true, currentStep: 3 }),
      skipOnboarding: () => set({ isSkipped: true, isComplete: true, currentStep: 3 }),
      resetOnboarding: () =>
        set({
          currentStep: 0,
          isComplete: false,
          isSkipped: false,
          profile: { ...defaultProfile },
          preferences: { ...defaultPreferences },
        }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "tenderflow-onboarding",
      partialize: (state) => ({
        currentStep: state.currentStep,
        isComplete: state.isComplete,
        isSkipped: state.isSkipped,
        profile: state.profile,
        preferences: state.preferences,
      }),
      storage: createJSONStorage(() => safeLocalStorage() ?? {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
