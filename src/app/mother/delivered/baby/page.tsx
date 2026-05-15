"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "@/components/mother/BigButton";
import BigRadioGroup from "@/components/mother/BigRadioGroup";
import QuestionCard from "@/components/mother/QuestionCard";
import ProgressBar from "@/components/mother/ProgressBar";
import {
  MotherAnswers,
  ROUTE_BY_STEP,
  nextStep,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

const STEP = "delivered_baby" as const;

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isGuardSatisfied(a: MotherAnswers): boolean {
  return a.status === "delivered";
}

export default function MotherDeliveredBabyPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [babyName, setBabyName] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.baby_name === "string" ? a.baby_name : "";
  });
  const [deliveryYear, setDeliveryYear] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.delivery_year === "number" ? String(a.delivery_year) : "";
  });
  const [deliveryPlace, setDeliveryPlace] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.delivery_place === "string" ? a.delivery_place : "";
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isGuardSatisfied(answers)) {
      router.replace("/mother/start");
    }
  }, [hydrated, answers, router]);

  const handleContinue = () => {
    setError(null);
    const trimmedName = babyName.trim();
    const year = Number(deliveryYear);
    if (!trimmedName) {
      setError("Please enter the baby's name.");
      return;
    }
    if (!Number.isFinite(year) || year < 1950 || year > 2100) {
      setError("Please enter a valid delivery year between 1950 and 2100.");
      return;
    }
    if (!deliveryPlace) {
      setError("Please select where the baby was delivered.");
      return;
    }
    const updated: MotherAnswers = {
      ...answers,
      baby_name: trimmedName,
      delivery_year: year,
      delivery_place: deliveryPlace,
    };
    setAnswers(updated);
    saveDraft({ currentStep: STEP, answers: updated });
    const next = nextStep(STEP, updated);
    if (next) router.push(ROUTE_BY_STEP[next]);
  };

  const handleBack = () => {
    const prev = prevStep(STEP, answers);
    if (prev) router.push(ROUTE_BY_STEP[prev]);
  };

  const steps = visitedSteps(answers);
  const current = steps.indexOf(STEP) + 1;
  const total = steps.length || 1;

  if (!hydrated) return null;
  if (!isGuardSatisfied(answers)) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <div className="mt-8 space-y-6">
        <QuestionCard title="What is the baby's name?" required>
          <input
            type="text"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
            placeholder="Enter the baby's name"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors text-lg"
          />
        </QuestionCard>

        <QuestionCard title="What year was the baby delivered?" required>
          <input
            type="number"
            inputMode="numeric"
            min={1950}
            max={2100}
            value={deliveryYear}
            onChange={(e) => setDeliveryYear(e.target.value)}
            placeholder="e.g. 2024"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors text-lg"
          />
        </QuestionCard>

        <QuestionCard title="Where was the baby delivered?" required>
          <BigRadioGroup
            name="delivery_place"
            value={deliveryPlace}
            onChange={setDeliveryPlace}
            required
            options={[
              { value: "Hospital", label: "Hospital", tone: "neutral" },
              { value: "Health Centre", label: "Health Centre", tone: "neutral" },
              { value: "Home", label: "Home", tone: "neutral" },
              { value: "Other", label: "Other", tone: "neutral" },
            ]}
          />
        </QuestionCard>
      </div>

      {error ? (
        <p className="mt-6 text-base font-semibold text-rose-600">{error}</p>
      ) : null}

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1">
          <BigButton onClick={handleBack} variant="secondary">
            Back
          </BigButton>
        </div>
        <div className="flex-1">
          <BigButton onClick={handleContinue} variant="primary">
            Continue
          </BigButton>
        </div>
      </div>
    </div>
  );
}
