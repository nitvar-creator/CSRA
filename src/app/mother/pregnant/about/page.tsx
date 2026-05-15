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

const THIS_STEP = "pregnant_about" as const;

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isGuardSatisfied(a: MotherAnswers): boolean {
  return (
    typeof a.name === "string" &&
    typeof a.age === "number" &&
    a.status === "pregnant"
  );
}

export default function PregnantAboutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [monthsInput, setMonthsInput] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.months_pregnant === "number" ? String(a.months_pregnant) : "";
  });
  const [ancInput, setAncInput] = useState<"" | "yes" | "no">(() => {
    const a = readDraftAnswers();
    return typeof a.anc_received === "boolean"
      ? a.anc_received
        ? "yes"
        : "no"
      : "";
  });
  const [doctorInput, setDoctorInput] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.doctor_name === "string" ? a.doctor_name : "";
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
    const months = Number(monthsInput);
    if (!Number.isFinite(months) || months < 1 || months > 10) {
      setError("Please enter months pregnant between 1 and 10.");
      return;
    }
    if (ancInput !== "yes" && ancInput !== "no") {
      setError("Please answer whether you have received ANC.");
      return;
    }
    if (doctorInput.trim().length === 0) {
      setError("Please enter your doctor's name.");
      return;
    }
    setError(null);
    const updated: MotherAnswers = {
      ...answers,
      months_pregnant: months,
      anc_received: ancInput === "yes",
      doctor_name: doctorInput.trim(),
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
          title="How many months pregnant are you?"
          required
        >
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={10}
            value={monthsInput}
            onChange={(e) => setMonthsInput(e.target.value)}
            className="w-full min-h-14 px-5 py-4 text-lg rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:border-pink-500"
            placeholder="e.g. 5"
          />
        </QuestionCard>

        <QuestionCard
          title="Have you received antenatal care (ANC)?"
          required
        >
          <BigRadioGroup
            name="anc_received"
            value={ancInput}
            onChange={(v) => setAncInput(v as "yes" | "no")}
            options={[
              { value: "yes", label: "Yes", tone: "neutral" },
              { value: "no", label: "No", tone: "neutral" },
            ]}
            required
          />
        </QuestionCard>

        <QuestionCard title="What is your doctor's name?" required>
          <input
            type="text"
            value={doctorInput}
            onChange={(e) => setDoctorInput(e.target.value)}
            className="w-full min-h-14 px-5 py-4 text-lg rounded-2xl border-2 border-slate-200 bg-white focus:outline-none focus:border-pink-500"
            placeholder="Dr. ..."
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
