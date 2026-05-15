"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

const STEP = "delivered_info_2" as const;

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

export default function MotherDeliveredInfo2Page() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers] = useState<MotherAnswers>(() => readDraftAnswers());

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
    saveDraft({ currentStep: STEP, answers });
    const next = nextStep(STEP, answers);
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
        <InfoBlock
          tone="warning"
          title="Syphilis can pass from mother to baby"
          body="Untreated syphilis during pregnancy can affect a baby's health. The next few questions help us understand whether your baby may need follow-up care. Please answer based on what you've observed."
        />
      </div>

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
