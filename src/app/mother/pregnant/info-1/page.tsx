"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import BigButton from "@/components/mother/BigButton";
import InfoBlock from "@/components/mother/InfoBlock";
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

const THIS_STEP = "pregnant_info_1" as const;

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

export default function PregnantInfo1Page() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers] = useState<MotherAnswers>(() => readDraftAnswers());

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
    saveDraft({ currentStep: THIS_STEP, answers });
    const next = nextStep(THIS_STEP, answers);
    if (next) router.push(ROUTE_BY_STEP[next]);
  };

  const handleBack = () => {
    if (back) router.push(ROUTE_BY_STEP[back]);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <div className="flex flex-col gap-6 mt-8">
        <InfoBlock
          tone="info"
          title="Free testing and treatment available"
          body="Government health facilities provide free testing for syphilis during pregnancy and free treatment if needed. Visit your nearest PHC, CHC, or district hospital."
        />
      </div>

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
