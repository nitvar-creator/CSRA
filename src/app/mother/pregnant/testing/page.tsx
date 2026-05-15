"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import BigButton from "@/components/mother/BigButton";
import BigRadioGroup from "@/components/mother/BigRadioGroup";
import ProgressBar from "@/components/mother/ProgressBar";
import QuestionCard from "@/components/mother/QuestionCard";
import {
  MotherAnswers,
  ROUTE_BY_STEP,
  SyphilisResult,
  nextStep,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

const THIS_STEP = "pregnant_testing" as const;

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isGuardSatisfied(a: MotherAnswers): boolean {
  return (
    typeof a.name === "string" &&
    typeof a.age === "number" &&
    a.status === "pregnant" &&
    typeof a.months_pregnant === "number" &&
    typeof a.anc_received === "boolean" &&
    typeof a.doctor_name === "string"
  );
}

export default function PregnantTestingPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [testedPregnancy, setTestedPregnancy] = useState<"" | "yes" | "no">(() => {
    const a = readDraftAnswers();
    return typeof a.tested_during_pregnancy === "boolean"
      ? a.tested_during_pregnancy
        ? "yes"
        : "no"
      : "";
  });
  const [testedSyphilis, setTestedSyphilis] = useState<"" | "yes" | "no">(() => {
    const a = readDraftAnswers();
    return typeof a.tested_for_syphilis === "boolean"
      ? a.tested_for_syphilis
        ? "yes"
        : "no"
      : "";
  });
  const [result, setResult] = useState<"" | SyphilisResult>(() => {
    const a = readDraftAnswers();
    return a.syphilis_result ?? "";
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isGuardSatisfied(answers)) {
      router.push("/mother/start");
    }
  }, [hydrated, answers, router]);

  if (!hydrated) return null;
  if (!isGuardSatisfied(answers)) return null;

  const steps = visitedSteps(answers);
  const current = steps.indexOf(THIS_STEP) + 1;
  const total = steps.length;
  const back = prevStep(THIS_STEP, answers);

  const handleContinue = () => {
    if (testedPregnancy !== "yes" && testedPregnancy !== "no") {
      setError("Please answer whether you were tested during pregnancy.");
      return;
    }
    if (testedSyphilis !== "yes" && testedSyphilis !== "no") {
      setError("Please answer whether you were tested for syphilis.");
      return;
    }
    if (
      result !== "positive" &&
      result !== "negative" &&
      result !== "dont_know"
    ) {
      setError("Please select your syphilis test result.");
      return;
    }
    setError(null);
    const updated: MotherAnswers = {
      ...answers,
      tested_during_pregnancy: testedPregnancy === "yes",
      tested_for_syphilis: testedSyphilis === "yes",
      syphilis_result: result,
    };
    setAnswers(updated);
    saveDraft({ currentStep: THIS_STEP, answers: updated });
    const next = nextStep(THIS_STEP, updated);
    if (next) router.push(ROUTE_BY_STEP[next]);
  };

  const handleBack = () => {
    if (back) router.push(ROUTE_BY_STEP[back]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <div className="flex flex-col gap-6 mt-8">
        <QuestionCard
          title="Were you tested during pregnancy?"
          required
        >
          <BigRadioGroup
            name="tested_during_pregnancy"
            value={testedPregnancy}
            onChange={(v) => setTestedPregnancy(v as "yes" | "no")}
            options={[
              { value: "yes", label: "Yes", tone: "neutral" },
              { value: "no", label: "No", tone: "neutral" },
            ]}
            required
          />
        </QuestionCard>

        <QuestionCard
          title="Were you tested specifically for syphilis?"
          required
        >
          <BigRadioGroup
            name="tested_for_syphilis"
            value={testedSyphilis}
            onChange={(v) => setTestedSyphilis(v as "yes" | "no")}
            options={[
              { value: "yes", label: "Yes", tone: "neutral" },
              { value: "no", label: "No", tone: "neutral" },
            ]}
            required
          />
        </QuestionCard>

        <QuestionCard
          title="What was your syphilis test result?"
          required
        >
          <BigRadioGroup
            name="syphilis_result"
            value={result}
            onChange={(v) => setResult(v as SyphilisResult)}
            options={[
              { value: "positive", label: "Positive", tone: "positive" },
              { value: "negative", label: "Negative", tone: "negative" },
              { value: "dont_know", label: "I don't know", tone: "neutral" },
            ]}
            columns={3}
            required
          />
        </QuestionCard>
      </div>

      {error ? (
        <p className="text-red-600 font-semibold mt-6" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        {back ? (
          <div className="flex-1">
            <BigButton variant="secondary" onClick={handleBack}>
              Back
            </BigButton>
          </div>
        ) : null}
        <div className="flex-1">
          <BigButton variant="primary" onClick={handleContinue}>
            Continue
          </BigButton>
        </div>
      </div>
    </div>
  );
}
