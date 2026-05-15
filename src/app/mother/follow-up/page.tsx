"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BigButton from "@/components/mother/BigButton";
import QuestionCard from "@/components/mother/QuestionCard";
import BigRadioGroup from "@/components/mother/BigRadioGroup";
import ProgressBar from "@/components/mother/ProgressBar";
import PhoneInput from "@/components/PhoneInput";
import {
  MotherAnswers,
  ROUTE_BY_STEP,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";

const PHONE_REGEX = /^[6-9]\d{9}$/;

function readDraftAnswers(): MotherAnswers {
  if (typeof window === "undefined") return {};
  return loadDraft()?.answers ?? {};
}

function isGuardSatisfied(a: MotherAnswers): boolean {
  return (
    typeof a.name === "string" &&
    typeof a.age === "number" &&
    (a.status === "pregnant" || a.status === "delivered")
  );
}

export default function MotherFollowUpPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers, setAnswers] = useState<MotherAnswers>(() => readDraftAnswers());
  const [visitingDoctor, setVisitingDoctor] = useState<"" | "yes" | "no">(() => {
    const a = readDraftAnswers();
    return typeof a.visiting_doctor === "boolean"
      ? a.visiting_doctor
        ? "yes"
        : "no"
      : "";
  });
  const [allowContact, setAllowContact] = useState<"" | "yes" | "no">(() => {
    const a = readDraftAnswers();
    return typeof a.allow_contact === "boolean"
      ? a.allow_contact
        ? "yes"
        : "no"
      : "";
  });
  const [phone, setPhone] = useState<string>(() => {
    const a = readDraftAnswers();
    return typeof a.contact_phone === "string" ? a.contact_phone : "";
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isGuardSatisfied(answers)) {
      router.push("/mother/start");
    }
  }, [hydrated, answers, router]);

  const steps = visitedSteps(answers);
  const total = steps.length || 11;
  const idx = steps.indexOf("follow_up");
  const current = idx >= 0 ? idx + 1 : total - 1;

  const handleBack = () => {
    const prev = prevStep("follow_up", answers);
    if (prev) router.push(ROUTE_BY_STEP[prev]);
  };

  const handleContinue = () => {
    setError(null);
    if (visitingDoctor === "" || allowContact === "") {
      setError("Please answer both questions.");
      return;
    }
    const allow = allowContact === "yes";
    if (allow && !PHONE_REGEX.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    const updated: MotherAnswers = {
      ...answers,
      visiting_doctor: visitingDoctor === "yes",
      allow_contact: allow,
      contact_phone: allow ? phone : undefined,
    };
    setAnswers(updated);
    saveDraft({ currentStep: "follow_up", answers: updated });
    router.push("/mother/review");
  };

  if (!hydrated) return null;
  if (!isGuardSatisfied(answers)) return null;

  const yesNoOptions = [
    { value: "yes", label: "Yes", tone: "neutral" as const },
    { value: "no", label: "No", tone: "neutral" as const },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <div className="mt-8 space-y-6">
        <QuestionCard
          title="Are you visiting your doctor for regular check-ups?"
          required
        >
          <BigRadioGroup
            name="visiting_doctor"
            value={visitingDoctor}
            onChange={(v) => setVisitingDoctor(v as "yes" | "no")}
            options={yesNoOptions}
            required
          />
        </QuestionCard>

        <QuestionCard
          title="Can we allow a health worker to contact you?"
          required
        >
          <BigRadioGroup
            name="allow_contact"
            value={allowContact}
            onChange={(v) => {
              const next = v as "yes" | "no";
              setAllowContact(next);
              if (next === "no") setPhone("");
            }}
            options={yesNoOptions}
            required
          />
        </QuestionCard>

        {allowContact === "yes" ? (
          <QuestionCard title="Your contact number" required>
            <PhoneInput
              name="contact_phone"
              value={phone}
              onChange={setPhone}
              required
            />
          </QuestionCard>
        ) : null}
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
