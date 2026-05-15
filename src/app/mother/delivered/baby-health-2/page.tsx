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

const STEP = "delivered_baby_health_2" as const;

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

export default function MotherDeliveredBabyHealth2Page() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [unwell, setUnwell] = useState<string>(() =>
    boolToYesNo(readDraftAnswers().baby_unwell),
  );
  const [fever, setFever] = useState<string>(() =>
    boolToYesNo(readDraftAnswers().baby_fever),
  );
  const [rashes, setRashes] = useState<string>(() =>
    boolToYesNo(readDraftAnswers().baby_skin_rashes),
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
      (unwell !== "yes" && unwell !== "no") ||
      (fever !== "yes" && fever !== "no") ||
      (rashes !== "yes" && rashes !== "no")
    ) {
      setError("Please answer all three questions.");
      return;
    }
    const updated: MotherAnswers = {
      ...answers,
      baby_unwell: unwell === "yes",
      baby_fever: fever === "yes",
      baby_skin_rashes: rashes === "yes",
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
        <QuestionCard title="Has the baby been unwell?" required>
          <BigRadioGroup
            name="baby_unwell"
            value={unwell}
            onChange={setUnwell}
            required
            options={yesNoOptions}
          />
        </QuestionCard>

        <QuestionCard title="Has the baby had a fever?" required>
          <BigRadioGroup
            name="baby_fever"
            value={fever}
            onChange={setFever}
            required
            options={yesNoOptions}
          />
        </QuestionCard>

        <QuestionCard title="Has the baby had skin rashes?" required>
          <BigRadioGroup
            name="baby_skin_rashes"
            value={rashes}
            onChange={setRashes}
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
