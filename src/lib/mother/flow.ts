/**
 * CSRA Self-Reporting Mother flow state machine.
 *
 * Pure module — no DOM, no React, no Node-only APIs.
 * Encodes the step graph, skip rules, and submission completeness check
 * derived from `docs/architectre-and-uf.md` (SELF-REPORTING MOTHER FLOW).
 */

export type MotherStep =
  | "start"
  | "status"
  | "pregnant_about"
  | "pregnant_info_1"
  | "pregnant_testing"
  | "pregnant_treatment"
  | "delivered_baby"
  | "delivered_anc"
  | "delivered_info_1"
  | "delivered_testing"
  | "delivered_treatment"
  | "delivered_info_2"
  | "delivered_baby_health_1"
  | "delivered_baby_health_2"
  | "delivered_baby_health_3"
  | "follow_up"
  | "review"
  | "thank_you";

export type SyphilisResult = "positive" | "negative" | "dont_know";
export type Status = "pregnant" | "delivered";

export type MotherAnswers = {
  // start
  name?: string;
  age?: number;
  gps_lat?: number | null;
  gps_lng?: number | null;
  location_text?: string | null;
  // status
  status?: Status;
  // pregnant_about
  months_pregnant?: number;
  anc_received?: boolean;
  doctor_name?: string;
  // pregnant_testing / delivered_testing share these
  tested_during_pregnancy?: boolean;
  tested_for_syphilis?: boolean;
  syphilis_result?: SyphilisResult;
  // treatment
  took_treatment?: boolean;
  doses_count?: number;
  treatment_when?: string; // ISO date
  // delivered baby
  baby_name?: string;
  delivery_year?: number;
  delivery_place?: string;
  // baby health
  doctor_said_infection?: boolean;
  baby_tested_syphilis?: boolean;
  baby_tested_hiv?: boolean;
  baby_unwell?: boolean;
  baby_fever?: boolean;
  baby_skin_rashes?: boolean;
  baby_feeding_difficulty?: boolean;
  // follow up
  visiting_doctor?: boolean;
  allow_contact?: boolean;
  contact_phone?: string;
};

export const ROUTE_BY_STEP: Record<MotherStep, string> = {
  start: "/mother/start",
  status: "/mother/status",
  pregnant_about: "/mother/pregnant/about",
  pregnant_info_1: "/mother/pregnant/info-1",
  pregnant_testing: "/mother/pregnant/testing",
  pregnant_treatment: "/mother/pregnant/treatment",
  delivered_baby: "/mother/delivered/baby",
  delivered_anc: "/mother/delivered/anc",
  delivered_info_1: "/mother/delivered/info-1",
  delivered_testing: "/mother/delivered/testing",
  delivered_treatment: "/mother/delivered/treatment",
  delivered_info_2: "/mother/delivered/info-2",
  delivered_baby_health_1: "/mother/delivered/baby-health-1",
  delivered_baby_health_2: "/mother/delivered/baby-health-2",
  delivered_baby_health_3: "/mother/delivered/baby-health-3",
  follow_up: "/mother/follow-up",
  review: "/mother/review",
  thank_you: "/mother/thank-you",
};

export const STEP_BY_ROUTE: Record<string, MotherStep> = Object.fromEntries(
  (Object.entries(ROUTE_BY_STEP) as [MotherStep, string][]).map(
    ([step, route]) => [route, step],
  ),
) as Record<string, MotherStep>;

const PHONE_REGEX = /^[6-9]\d{9}$/;

function isPositive(answers: MotherAnswers): boolean {
  return answers.syphilis_result === "positive";
}

/**
 * Returns the next step given the current step and the accumulated answers.
 * Returns null when there is no next step (currentStep === "thank_you").
 */
export function nextStep(
  current: MotherStep,
  answers: MotherAnswers,
): MotherStep | null {
  switch (current) {
    case "start":
      return "status";
    case "status":
      if (answers.status === "delivered") return "delivered_baby";
      // default to pregnant branch (also covers status === 'pregnant')
      return "pregnant_about";
    case "pregnant_about":
      return "pregnant_info_1";
    case "pregnant_info_1":
      return "pregnant_testing";
    case "pregnant_testing":
      return isPositive(answers) ? "pregnant_treatment" : "follow_up";
    case "pregnant_treatment":
      return "follow_up";
    case "delivered_baby":
      return "delivered_anc";
    case "delivered_anc":
      return "delivered_info_1";
    case "delivered_info_1":
      return "delivered_testing";
    case "delivered_testing":
      return isPositive(answers) ? "delivered_treatment" : "follow_up";
    case "delivered_treatment":
      return "delivered_info_2";
    case "delivered_info_2":
      return "delivered_baby_health_1";
    case "delivered_baby_health_1":
      return "delivered_baby_health_2";
    case "delivered_baby_health_2":
      return "delivered_baby_health_3";
    case "delivered_baby_health_3":
      return "follow_up";
    case "follow_up":
      return "review";
    case "review":
      return "thank_you";
    case "thank_you":
      return null;
  }
}

/**
 * Returns the full ordered list of steps the user will actually visit given
 * their current answers. Walks forward via `nextStep` until null, starting
 * from "start".
 */
export function visitedSteps(answers: MotherAnswers): MotherStep[] {
  const steps: MotherStep[] = [];
  let cursor: MotherStep | null = "start";
  // Guard against cycles defensively, though the graph is acyclic.
  const seen = new Set<MotherStep>();
  while (cursor !== null) {
    if (seen.has(cursor)) break;
    seen.add(cursor);
    steps.push(cursor);
    cursor = nextStep(cursor, answers);
  }
  return steps;
}

/**
 * Returns the previous step given the current step and accumulated answers.
 * Returns null if there is no previous step (currentStep === "start").
 * Honors the same skip rules in reverse by reusing `visitedSteps`.
 */
export function prevStep(
  current: MotherStep,
  answers: MotherAnswers,
): MotherStep | null {
  const steps = visitedSteps(answers);
  const idx = steps.indexOf(current);
  if (idx <= 0) return null;
  return steps[idx - 1];
}

function hasLocation(answers: MotherAnswers): boolean {
  const hasGps =
    typeof answers.gps_lat === "number" && typeof answers.gps_lng === "number";
  const hasText =
    typeof answers.location_text === "string" &&
    answers.location_text.trim().length > 0;
  return hasGps || hasText;
}

function isBool(v: unknown): v is boolean {
  return typeof v === "boolean";
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Returns true when answers have everything needed for a valid submission.
 * Used to gate the "Submit" button on /mother/review.
 */
export function isComplete(answers: MotherAnswers): boolean {
  // Common start
  if (!isNonEmptyString(answers.name)) return false;
  if (!isNumber(answers.age)) return false;
  if (!hasLocation(answers)) return false;

  if (answers.status !== "pregnant" && answers.status !== "delivered") {
    return false;
  }

  if (answers.status === "pregnant") {
    if (!isNumber(answers.months_pregnant)) return false;
    if (!isBool(answers.anc_received)) return false;
    if (!isNonEmptyString(answers.doctor_name)) return false;
    if (!isBool(answers.tested_during_pregnancy)) return false;
    if (!isBool(answers.tested_for_syphilis)) return false;
    if (
      answers.syphilis_result !== "positive" &&
      answers.syphilis_result !== "negative" &&
      answers.syphilis_result !== "dont_know"
    ) {
      return false;
    }
    if (answers.syphilis_result === "positive") {
      if (!isBool(answers.took_treatment)) return false;
      if (!isNumber(answers.doses_count)) return false;
    }
  } else {
    // delivered
    if (!isNonEmptyString(answers.baby_name)) return false;
    if (!isNumber(answers.delivery_year)) return false;
    if (!isNonEmptyString(answers.delivery_place)) return false;
    if (!isBool(answers.anc_received)) return false;
    if (!isBool(answers.tested_for_syphilis)) return false;
    if (
      answers.syphilis_result !== "positive" &&
      answers.syphilis_result !== "negative" &&
      answers.syphilis_result !== "dont_know"
    ) {
      return false;
    }
    if (answers.syphilis_result === "positive") {
      if (!isBool(answers.took_treatment)) return false;
      if (!isNumber(answers.doses_count)) return false;
      if (!isNonEmptyString(answers.treatment_when)) return false;
      if (!isBool(answers.doctor_said_infection)) return false;
      if (!isBool(answers.baby_tested_syphilis)) return false;
      if (!isBool(answers.baby_tested_hiv)) return false;
      if (!isBool(answers.baby_unwell)) return false;
      if (!isBool(answers.baby_fever)) return false;
      if (!isBool(answers.baby_skin_rashes)) return false;
      if (!isBool(answers.baby_feeding_difficulty)) return false;
    }
  }

  // Always: follow-up
  if (!isBool(answers.visiting_doctor)) return false;
  if (!isBool(answers.allow_contact)) return false;
  if (answers.allow_contact === true) {
    if (!isNonEmptyString(answers.contact_phone)) return false;
    if (!PHONE_REGEX.test(answers.contact_phone)) return false;
  }

  return true;
}
