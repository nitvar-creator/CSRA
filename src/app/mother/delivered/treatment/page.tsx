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

const STEP = "delivered_treatment" as const;

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

export default function MotherDeliveredTreatmentPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [tookTreatment, setTookTreatment] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.took_treatment === "boolean"
      ? a.took_treatment
        ? "yes"
        : "no"
      : "";
  });
  const [treatmentWhen, setTreatmentWhen] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.treatment_when === "string" ? a.treatment_when : "";
  });
  const [dosesCount, setDosesCount] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.doses_count === "number" ? String(a.doses_count) : "";
  });
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
    if (tookTreatment !== "yes" && tookTreatment !== "no") {
      setError("Please indicate whether you took treatment.");
      return;
    }
    if (!treatmentWhen) {
      setError("Please enter the treatment start date.");
      return;
    }
    const parsed = Date.parse(treatmentWhen);
    if (!Number.isFinite(parsed)) {
      setError("Please enter a valid date.");
      return;
    }
    const doses = Number(dosesCount);
    if (!Number.isFinite(doses) || doses < 1 || doses > 3) {
      setError("Please select the number of doses (1, 2, or 3).");
      return;
    }
    const updated: MotherAnswers = {
      ...answers,
      took_treatment: tookTreatment === "yes",
      treatment_when: treatmentWhen,
      doses_count: doses,
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
        <QuestionCard title="Did you take treatment?" required>
          <BigRadioGroup
            name="took_treatment"
            value={tookTreatment}
            onChange={setTookTreatment}
            required
            options={[
              { value: "yes", label: "Yes", tone: "neutral" },
              { value: "no", label: "No", tone: "neutral" },
            ]}
          />
        </QuestionCard>

        <QuestionCard title="When did you start treatment?" required>
          <input
            type="date"
            value={treatmentWhen}
            onChange={(e) => setTreatmentWhen(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors text-lg"
          />
        </QuestionCard>

        <QuestionCard title="How many doses did you receive?" required>
          <BigRadioGroup
            name="doses_count"
            value={dosesCount}
            onChange={setDosesCount}
            required
            columns={3}
            options={[
              { value: "1", label: "1", tone: "neutral" },
              { value: "2", label: "2", tone: "neutral" },
              { value: "3", label: "3", tone: "neutral" },
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
