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

const STEP = "delivered_baby_health_1" as const;

const yesNoOptions = [
  { value: "yes", label: "Yes", tone: "neutral" as const },
  { value: "no", label: "No", tone: "neutral" as const },
];

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isPrereqSatisfied(a: MotherAnswers): boolean {
  return a.status === "delivered";
}

function shouldShow(a: MotherAnswers): boolean {
  return isPrereqSatisfied(a) && a.syphilis_result === "positive";
}

function boolToYesNo(v: unknown): string {
  return typeof v === "boolean" ? (v ? "yes" : "no") : "";
}

export default function MotherDeliveredBabyHealth1Page() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [infection, setInfection] = useState<string>(() =>
    boolToYesNo(readDraftAnswers().doctor_said_infection),
  );
  const [babyTestedSyphilis, setBabyTestedSyphilis] = useState<string>(() =>
    boolToYesNo(readDraftAnswers().baby_tested_syphilis),
  );
  const [babyTestedHiv, setBabyTestedHiv] = useState<string>(() =>
    boolToYesNo(readDraftAnswers().baby_tested_hiv),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isPrereqSatisfied(answers)) {
      router.replace("/mother/start");
      return;
    }
    if (answers.syphilis_result !== "positive") {
      router.replace("/mother/follow-up");
    }
  }, [hydrated, answers, router]);

  const handleContinue = () => {
    setError(null);
    if (
      (infection !== "yes" && infection !== "no") ||
      (babyTestedSyphilis !== "yes" && babyTestedSyphilis !== "no") ||
      (babyTestedHiv !== "yes" && babyTestedHiv !== "no")
    ) {
      setError("Please answer all three questions.");
      return;
    }
    const updated: MotherAnswers = {
      ...answers,
      doctor_said_infection: infection === "yes",
      baby_tested_syphilis: babyTestedSyphilis === "yes",
      baby_tested_hiv: babyTestedHiv === "yes",
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
  if (!shouldShow(answers)) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <div className="mt-8 space-y-6">
        <QuestionCard
          title="Did the doctor say the baby has an infection?"
          required
        >
          <BigRadioGroup
            name="doctor_said_infection"
            value={infection}
            onChange={setInfection}
            required
            options={yesNoOptions}
          />
        </QuestionCard>

        <QuestionCard title="Was the baby tested for syphilis?" required>
          <BigRadioGroup
            name="baby_tested_syphilis"
            value={babyTestedSyphilis}
            onChange={setBabyTestedSyphilis}
            required
            options={yesNoOptions}
          />
        </QuestionCard>

        <QuestionCard title="Was the baby tested for HIV?" required>
          <BigRadioGroup
            name="baby_tested_hiv"
            value={babyTestedHiv}
            onChange={setBabyTestedHiv}
            required
            options={yesNoOptions}
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
