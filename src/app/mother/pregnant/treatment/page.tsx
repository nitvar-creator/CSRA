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
  nextStep,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

const THIS_STEP = "pregnant_treatment" as const;

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isPrereqSatisfied(a: MotherAnswers): boolean {
  return (
    typeof a.name === "string" &&
    typeof a.age === "number" &&
    a.status === "pregnant" &&
    typeof a.months_pregnant === "number" &&
    typeof a.anc_received === "boolean" &&
    typeof a.doctor_name === "string" &&
    typeof a.tested_during_pregnancy === "boolean" &&
    typeof a.tested_for_syphilis === "boolean" &&
    typeof a.syphilis_result === "string"
  );
}

function shouldShow(a: MotherAnswers): boolean {
  return isPrereqSatisfied(a) && a.syphilis_result === "positive";
}

export default function PregnantTreatmentPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [tookTreatment, setTookTreatment] = useState<"" | "yes" | "no">(() => {
    const a = readDraftAnswers();
    return typeof a.took_treatment === "boolean"
      ? a.took_treatment
        ? "yes"
        : "no"
      : "";
  });
  const [doses, setDoses] = useState<"" | "1" | "2" | "3">(() => {
    const a = readDraftAnswers();
    return typeof a.doses_count === "number" &&
      a.doses_count >= 1 &&
      a.doses_count <= 3
      ? (String(a.doses_count) as "1" | "2" | "3")
      : "";
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isPrereqSatisfied(answers)) {
      router.push("/mother/start");
      return;
    }
    if (answers.syphilis_result !== "positive") {
      router.push("/mother/follow-up");
    }
  }, [hydrated, answers, router]);

  if (!hydrated) return null;
  if (!shouldShow(answers)) return null;

  const steps = visitedSteps(answers);
  const current = steps.indexOf(THIS_STEP) + 1;
  const total = steps.length;
  const back = prevStep(THIS_STEP, answers);

  const handleContinue = () => {
    if (tookTreatment !== "yes" && tookTreatment !== "no") {
      setError("Please answer whether you took treatment.");
      return;
    }
    const dosesNum = Number(doses);
    if (!Number.isFinite(dosesNum) || dosesNum < 1 || dosesNum > 3) {
      setError("Please select how many doses you received.");
      return;
    }
    setError(null);
    const updated: MotherAnswers = {
      ...answers,
      took_treatment: tookTreatment === "yes",
      doses_count: dosesNum,
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
          title="Did you take treatment for syphilis?"
          required
        >
          <BigRadioGroup
            name="took_treatment"
            value={tookTreatment}
            onChange={(v) => setTookTreatment(v as "yes" | "no")}
            options={[
              { value: "yes", label: "Yes", tone: "neutral" },
              { value: "no", label: "No", tone: "neutral" },
            ]}
            required
          />
        </QuestionCard>

        <QuestionCard title="How many doses did you receive?" required>
          <BigRadioGroup
            name="doses_count"
            value={doses}
            onChange={(v) => setDoses(v as "1" | "2" | "3")}
            options={[
              { value: "1", label: "1 dose", tone: "neutral" },
              { value: "2", label: "2 doses", tone: "neutral" },
              { value: "3", label: "3 doses", tone: "neutral" },
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
