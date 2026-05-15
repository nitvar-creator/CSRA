"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "@/components/mother/BigButton";
import QuestionCard from "@/components/mother/QuestionCard";
import BigRadioGroup from "@/components/mother/BigRadioGroup";
import ProgressBar from "@/components/mother/ProgressBar";
import {
  MotherAnswers,
  ROUTE_BY_STEP,
  Status,
  nextStep,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isGuardSatisfied(a: MotherAnswers): boolean {
  return typeof a.name === "string" && typeof a.age === "number";
}

export default function MotherStatusPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [status, setStatus] = useState<Status | "">(() => {
    const a = readDraftAnswers();
    return a.status === "pregnant" || a.status === "delivered" ? a.status : "";
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isGuardSatisfied(answers)) {
      router.push("/mother/start");
    }
  }, [hydrated, answers, router]);

  const steps = visitedSteps(answers);
  const total = steps.length || 11;
  const current = Math.max(1, steps.indexOf("status") + 1) || 2;

  const handleBack = () => {
    const prev = prevStep("status", answers);
    if (prev) router.push(ROUTE_BY_STEP[prev]);
  };

  const handleContinue = () => {
    setError(null);
    if (status !== "pregnant" && status !== "delivered") {
      setError("Please select an option.");
      return;
    }
    const updated: MotherAnswers = { ...answers, status };
    setAnswers(updated);
    saveDraft({ currentStep: "status", answers: updated });
    const next = nextStep("status", updated);
    if (next) router.push(ROUTE_BY_STEP[next]);
  };

  if (!hydrated) return null;
  if (!isGuardSatisfied(answers)) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <div className="mt-8">
        <QuestionCard title="What is your current status?" required>
          <BigRadioGroup
            name="status"
            value={status}
            onChange={(v) => setStatus(v as Status)}
            options={[
              { value: "pregnant", label: "Pregnant", tone: "neutral" },
              { value: "delivered", label: "Delivered", tone: "neutral" },
            ]}
            required
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
          <BigButton
            onClick={handleContinue}
            variant="primary"
            disabled={status === ""}
          >
            Continue
          </BigButton>
        </div>
      </div>
    </div>
  );
}
