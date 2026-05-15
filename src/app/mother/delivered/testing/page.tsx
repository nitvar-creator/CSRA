"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "@/components/mother/BigButton";
import BigRadioGroup from "@/components/mother/BigRadioGroup";
import QuestionCard from "@/components/mother/QuestionCard";
import ProgressBar from "@/components/mother/ProgressBar";
import {
  MotherAnswers,
  SyphilisResult,
  ROUTE_BY_STEP,
  nextStep,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

const STEP = "delivered_testing" as const;

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isGuardSatisfied(a: MotherAnswers): boolean {
  return a.status === "delivered" && typeof a.anc_received === "boolean";
}

export default function MotherDeliveredTestingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [tested, setTested] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.tested_for_syphilis === "boolean"
      ? a.tested_for_syphilis
        ? "yes"
        : "no"
      : "";
  });
  const [result, setResult] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.syphilis_result === "string" ? a.syphilis_result : "";
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
    if (tested !== "yes" && tested !== "no") {
      setError("Please indicate whether you were tested.");
      return;
    }
    if (
      result !== "positive" &&
      result !== "negative" &&
      result !== "dont_know"
    ) {
      setError("Please select the test result.");
      return;
    }
    const updated: MotherAnswers = {
      ...answers,
      tested_for_syphilis: tested === "yes",
      syphilis_result: result as SyphilisResult,
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
        <QuestionCard title="Were you tested for syphilis?" required>
          <BigRadioGroup
            name="tested_for_syphilis"
            value={tested}
            onChange={setTested}
            required
            options={[
              { value: "yes", label: "Yes", tone: "neutral" },
              { value: "no", label: "No", tone: "neutral" },
            ]}
          />
        </QuestionCard>

        <QuestionCard title="What was the result?" required>
          <BigRadioGroup
            name="syphilis_result"
            value={result}
            onChange={setResult}
            required
            columns={3}
            options={[
              { value: "positive", label: "Positive", tone: "positive" },
              { value: "negative", label: "Negative", tone: "negative" },
              { value: "dont_know", label: "Don't know", tone: "neutral" },
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
