"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import BigButton from "@/components/mother/BigButton";
import InfoBlock from "@/components/mother/InfoBlock";
import ProgressBar from "@/components/mother/ProgressBar";
import {
  MotherAnswers,
  ROUTE_BY_STEP,
  isComplete,
  prevStep,
  visitedSteps,
} from "@/lib/mother/flow";
import { clearDraft, loadDraft, saveDraft } from "@/lib/mother/storage";
import { useHydrated } from "@/lib/mother/useHydrated";
import { createClient } from "@/lib/supabase/client";

function readDraftAnswers(): MotherAnswers | null {
  if (typeof window === "undefined") return null;
  return loadDraft()?.answers ?? null;
}

function fmtBool(v: boolean | undefined): string {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "—";
}

function fmtStr(v: string | null | undefined): string {
  if (typeof v === "string" && v.trim().length > 0) return v;
  return "—";
}

function fmtNum(v: number | undefined): string {
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "—";
}

function Section({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {label}
            </dt>
            <dd className="text-base text-slate-900 font-medium mt-0.5">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default function MotherReviewPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const [answers] = useState<MotherAnswers | null>(() => readDraftAnswers());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!hydrated) return;
    if (!answers) {
      router.push("/mother/start");
    }
  }, [hydrated, answers, router]);

  useEffect(() => {
    if (!hydrated) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setIsAnonymous(!data.session);
    });
  }, [hydrated]);

  useEffect(() => {
    (
      window as unknown as { csraOnCaptcha?: (token: string) => void }
    ).csraOnCaptcha = (token: string) => {
      setCaptchaToken(token);
    };
    (
      window as unknown as { csraOnCaptchaExpired?: () => void }
    ).csraOnCaptchaExpired = () => {
      setCaptchaToken(null);
    };
    return () => {
      delete (window as unknown as { csraOnCaptcha?: unknown })
        .csraOnCaptcha;
      delete (window as unknown as { csraOnCaptchaExpired?: unknown })
        .csraOnCaptchaExpired;
    };
  }, []);

  if (!hydrated) return null;
  if (!answers) return null;

  const complete = isComplete(answers);
  const steps = visitedSteps(answers);
  const total = steps.length || 11;
  const idx = steps.indexOf("review");
  const current = idx >= 0 ? idx + 1 : total;

  const handleBack = () => {
    const prev = prevStep("review", answers);
    if (prev) router.push(ROUTE_BY_STEP[prev]);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const basePayload: Record<string, unknown> =
        answers.status === "delivered" &&
        answers.syphilis_result === "positive"
          ? {
              ...answers,
              baby_health: {
                doctor_said_infection: answers.doctor_said_infection,
                baby_tested_syphilis: answers.baby_tested_syphilis,
                baby_tested_hiv: answers.baby_tested_hiv,
                baby_unwell: answers.baby_unwell,
                baby_fever: answers.baby_fever,
                baby_skin_rashes: answers.baby_skin_rashes,
                baby_feeding_difficulty: answers.baby_feeding_difficulty,
              },
            }
          : { ...answers };

      const payload = {
        ...basePayload,
        ...(captchaToken ? { captchaToken } : {}),
      };

      saveDraft({ currentStep: "review", answers });
      const res = await fetch("/api/reports/mother-self-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(
          typeof data?.message === "string"
            ? data.message
            : "Could not submit. Please try again.",
        );
        setSubmitting(false);
        return;
      }
      clearDraft();
      router.push("/mother/thank-you");
    } catch {
      setError("Could not submit. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  if (!complete) {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
        <ProgressBar current={current} total={total} />
        <div className="mt-8">
          <InfoBlock
            tone="warning"
            title="Some answers are missing"
            body="Please go back and complete them before submitting."
          />
        </div>
        <div className="mt-8">
          <BigButton
            onClick={() => router.push("/mother/start")}
            variant="primary"
          >
            Go back to start
          </BigButton>
        </div>
      </div>
    );
  }

  const startRows: Array<[string, string]> = [
    ["Name", fmtStr(answers.name)],
    ["Age", fmtNum(answers.age)],
    [
      "Location",
      answers.gps_lat != null && answers.gps_lng != null
        ? `${answers.gps_lat.toFixed(4)}, ${answers.gps_lng.toFixed(4)}`
        : fmtStr(answers.location_text),
    ],
  ];

  const statusRows: Array<[string, string]> = [
    [
      "Status",
      answers.status === "pregnant"
        ? "Pregnant"
        : answers.status === "delivered"
          ? "Delivered"
          : "—",
    ],
  ];

  const branchRows: Array<[string, string]> =
    answers.status === "pregnant"
      ? [
          ["Months pregnant", fmtNum(answers.months_pregnant)],
          ["ANC received", fmtBool(answers.anc_received)],
          ["Doctor name", fmtStr(answers.doctor_name)],
          [
            "Tested during pregnancy",
            fmtBool(answers.tested_during_pregnancy),
          ],
          ["Tested for syphilis", fmtBool(answers.tested_for_syphilis)],
          ["Syphilis result", fmtStr(answers.syphilis_result)],
        ]
      : answers.status === "delivered"
        ? [
            ["Baby name", fmtStr(answers.baby_name)],
            ["Delivery year", fmtNum(answers.delivery_year)],
            ["Delivery place", fmtStr(answers.delivery_place)],
            ["ANC received", fmtBool(answers.anc_received)],
            ["Tested for syphilis", fmtBool(answers.tested_for_syphilis)],
            ["Syphilis result", fmtStr(answers.syphilis_result)],
          ]
        : [];

  const treatmentRows: Array<[string, string]> | null =
    answers.syphilis_result === "positive"
      ? [
          ["Took treatment", fmtBool(answers.took_treatment)],
          ["Doses count", fmtNum(answers.doses_count)],
          ...(answers.status === "delivered"
            ? ([["Treatment when", fmtStr(answers.treatment_when)]] as Array<
                [string, string]
              >)
            : []),
        ]
      : null;

  const babyHealthRows: Array<[string, string]> | null =
    answers.status === "delivered" && answers.syphilis_result === "positive"
      ? [
          [
            "Doctor said infection",
            fmtBool(answers.doctor_said_infection),
          ],
          ["Baby tested syphilis", fmtBool(answers.baby_tested_syphilis)],
          ["Baby tested HIV", fmtBool(answers.baby_tested_hiv)],
          ["Baby unwell", fmtBool(answers.baby_unwell)],
          ["Baby fever", fmtBool(answers.baby_fever)],
          ["Baby skin rashes", fmtBool(answers.baby_skin_rashes)],
          [
            "Baby feeding difficulty",
            fmtBool(answers.baby_feeding_difficulty),
          ],
        ]
      : null;

  const followUpRows: Array<[string, string]> = [
    ["Visiting doctor", fmtBool(answers.visiting_doctor)],
    ["Allow contact", fmtBool(answers.allow_contact)],
    ...(answers.allow_contact === true
      ? ([["Contact phone", fmtStr(answers.contact_phone)]] as Array<
          [string, string]
        >)
      : []),
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-10 pb-20">
      <ProgressBar current={current} total={total} />

      <h1 className="mt-8 text-3xl font-extrabold text-slate-900">
        Review your answers
      </h1>
      <p className="mt-2 text-slate-600">
        Please check everything looks right before submitting.
      </p>

      <div className="mt-6 space-y-4">
        <Section title="Start" rows={startRows} />
        <Section title="Status" rows={statusRows} />
        {branchRows.length > 0 ? (
          <Section
            title={
              answers.status === "pregnant"
                ? "Pregnancy"
                : "Delivery"
            }
            rows={branchRows}
          />
        ) : null}
        {treatmentRows ? (
          <Section title="Treatment" rows={treatmentRows} />
        ) : null}
        {babyHealthRows ? (
          <Section title="Baby Health" rows={babyHealthRows} />
        ) : null}
        <Section title="Follow-up" rows={followUpRows} />
      </div>

      {error ? (
        <p className="mt-6 text-base font-semibold text-rose-600">{error}</p>
      ) : null}

      {isAnonymous === true && siteKey ? (
        <div className="mt-6 flex justify-center">
          <Script
            src="https://js.hcaptcha.com/1/api.js"
            strategy="afterInteractive"
            async
            defer
          />
          <div
            className="h-captcha"
            data-sitekey={siteKey}
            data-callback="csraOnCaptcha"
            data-expired-callback="csraOnCaptchaExpired"
          />
        </div>
      ) : null}
      {isAnonymous === true && !siteKey ? (
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
          Captcha is not configured for this environment. Submissions are
          accepted but rate-limited.
        </div>
      ) : null}
      {isAnonymous === true && siteKey && !captchaToken ? (
        <p className="mt-2 text-center text-sm text-slate-500">
          Please complete the captcha above to submit.
        </p>
      ) : null}

      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1">
          <BigButton
            onClick={handleBack}
            variant="secondary"
            disabled={submitting}
          >
            Back
          </BigButton>
        </div>
        <div className="flex-1">
          <BigButton
            onClick={handleSubmit}
            variant="primary"
            loading={submitting}
            disabled={
              submitting ||
              (isAnonymous === true && !!siteKey && !captchaToken)
            }
          >
            Submit
          </BigButton>
        </div>
      </div>
    </div>
  );
}
