"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "@/components/mother/BigButton";
import QuestionCard from "@/components/mother/QuestionCard";
import ProgressBar from "@/components/mother/ProgressBar";
import GpsCaptureField, { GpsValue } from "@/components/GpsCaptureField";
import {
  MotherAnswers,
  ROUTE_BY_STEP,
  nextStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

export default function MotherStartPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [name, setName] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.name === "string" ? a.name : "";
  });
  const [ageInput, setAgeInput] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.age === "number" ? String(a.age) : "";
  });
  const [gps, setGps] = useState<GpsValue>(() => {
    const a = readDraftAnswers();
    return {
      lat: typeof a.gps_lat === "number" ? a.gps_lat : null,
      lng: typeof a.gps_lng === "number" ? a.gps_lng : null,
      manual_text:
        typeof a.location_text === "string" ? a.location_text : null,
    };
  });
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    setError(null);
    const trimmedName = name.trim();
    const age = Number(ageInput);
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!Number.isFinite(age) || age < 10 || age > 80) {
      setError("Please enter a valid age between 10 and 80.");
      return;
    }
    const hasGps = gps.lat != null && gps.lng != null;
    const hasText = !!(gps.manual_text && gps.manual_text.trim().length > 0);
    if (!hasGps && !hasText) {
      setError("Please provide your location.");
      return;
    }

    const updated: MotherAnswers = {
      ...answers,
      name: trimmedName,
      age,
      gps_lat: gps.lat,
      gps_lng: gps.lng,
      location_text: gps.manual_text,
    };
    setAnswers(updated);
    saveDraft({ currentStep: "start", answers: updated });
    const next = nextStep("start", updated);
    if (next) router.push(ROUTE_BY_STEP[next]);
  };

  const total = visitedSteps(answers).length || 11;

  if (!hydrated) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={1} total={total} />

      <div className="mt-8 space-y-6">
        <QuestionCard title="What is your name?" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors text-lg"
          />
        </QuestionCard>

        <QuestionCard title="How old are you?" required>
          <input
            type="number"
            inputMode="numeric"
            min={10}
            max={80}
            value={ageInput}
            onChange={(e) => setAgeInput(e.target.value)}
            placeholder="Enter your age"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-pink-500 focus:bg-white transition-colors text-lg"
          />
        </QuestionCard>

        <QuestionCard title="Where are you?" required>
          <GpsCaptureField value={gps} onChange={setGps} required />
        </QuestionCard>
      </div>

      {error ? (
        <p className="mt-6 text-base font-semibold text-rose-600">{error}</p>
      ) : null}

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1" />
        <div className="flex-1">
          <BigButton onClick={handleContinue} variant="primary">
            Continue
          </BigButton>
        </div>
      </div>
    </div>
  );
}
