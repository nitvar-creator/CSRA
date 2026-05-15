import { z } from 'zod';

const trimmedString = (max = 500) => z.string().trim().min(1).max(max);
const optionalString = (max = 1000) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v === '' || v == null ? null : v));
const isoDate = z
  .string()
  .trim()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: 'Invalid date' });
const optionalIsoDate = z
  .string()
  .trim()
  .optional()
  .nullable()
  .transform((v) => (v === '' || v == null ? null : v))
  .refine((v) => v == null || !Number.isNaN(Date.parse(v)), { message: 'Invalid date' });
const uuid = z.string().uuid();
const optionalUuid = z
  .string()
  .optional()
  .nullable()
  .transform((v) => (v === '' || v == null ? null : v))
  .refine((v) => v == null || z.string().uuid().safeParse(v).success, {
    message: 'Invalid id',
  });

const indianMobile = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, 'Enter a 10-digit Indian mobile number');

export const signupSchema = z.object({
  fullName: trimmedString(200),
  mobile: indianMobile,
  email: z.string().trim().email().max(320),
  password: z.string().min(8).max(200),
});

export const updateRoleSchema = z.object({
  userId: uuid,
  role: z.enum(['mother', 'reporter']),
});

export const reporterRegistrationSchema = z.object({
  userId: uuid,
  fullName: trimmedString(200),
  age: z.coerce.number().int().min(0).max(150),
  qualification: trimmedString(200),
  designation: trimmedString(200),
  facilityName: trimmedString(300),
  district: trimmedString(200),
  contact: indianMobile,
  facilityType: trimmedString(100),
});

export const maternalBasicSchema = z.object({
  fullName: trimmedString(200),
  age: z.coerce.number().int().min(0).max(150),
  location: trimmedString(300),
  mctsId: trimmedString(100),
  contact: indianMobile,
});

export const maternalConfirmatorySchema = z
  .object({
    maternalBasicId: uuid,
    testType: trimmedString(100),
    testDate: isoDate,
    titres: trimmedString(100),
    result: z.enum(['Positive', 'Negative', 'Inconclusive']),
    treatmentGiven: z.enum(['Yes', 'No']).optional(),
    drugName: optionalString(200),
    dose: optionalString(100),
    treatmentDate: optionalIsoDate,
  })
  .superRefine((v, ctx) => {
    if (v.result === 'Positive') {
      if (!v.treatmentGiven) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['treatmentGiven'],
          message: 'Required when result is Positive',
        });
      }
      if (v.treatmentGiven === 'Yes') {
        if (!v.drugName) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['drugName'], message: 'Required when treatment is given' });
        }
        if (!v.dose) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dose'], message: 'Required when treatment is given' });
        }
        if (!v.treatmentDate) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['treatmentDate'], message: 'Required when treatment is given' });
        }
      }
    }
  });

export const maternalScreeningFieldsSchema = z.object({
  maternalBasicId: uuid,
  testType: trimmedString(100),
  testDate: isoDate,
  titres: trimmedString(100),
  result: trimmedString(100),
});

export const babyBasicSchema = z.object({
  name: trimmedString(200),
  deliveryDate: optionalIsoDate,
  age: z.coerce.number().int().min(0).max(150),
  mctsId: trimmedString(100),
  weight: z.coerce.number().min(0).max(20),
  location: trimmedString(300),
  gender: z.enum(['male', 'female', 'other']),
});

export const babySerologicalSchema = z
  .object({
    babyBasicId: optionalUuid,
    testType: trimmedString(100),
    testDate: optionalIsoDate,
    titres: trimmedString(100),
    result: z.enum(['Positive', 'Negative', 'Inconclusive']),
    maternalTitres: optionalString(100),
    manifestations: optionalString(1000),
    prematurity: optionalString(50),
    lowBirthWeight: optionalString(50),
    complications: optionalString(1000),
    treatmentGiven: z.enum(['Yes', 'No', 'Ongoing']).optional(),
    drugName: optionalString(200),
    dose: optionalString(100),
    treatmentDate: optionalIsoDate,
    followup: optionalString(1000),
  })
  .superRefine((v, ctx) => {
    if (v.result === 'Positive') {
      if (!v.treatmentGiven) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['treatmentGiven'],
          message: 'Required when result is Positive',
        });
      }
      if (v.treatmentGiven === 'Yes') {
        if (!v.drugName) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['drugName'], message: 'Required when treatment is given' });
        }
        if (!v.dose) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dose'], message: 'Required when treatment is given' });
        }
        if (!v.treatmentDate) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['treatmentDate'], message: 'Required when treatment is given' });
        }
      }
    }
  });

// ---------------------------------------------------------------------------
// Self-Reporting Mother flow
// ---------------------------------------------------------------------------

const motherBaseShape = z.object({
  name: trimmedString(200),
  age: z.coerce.number().int().min(10).max(80),
  gps_lat: z.number().min(-90).max(90).nullable().optional(),
  gps_lng: z.number().min(-180).max(180).nullable().optional(),
  location_text: z.string().trim().max(500).nullable().optional(),
  visiting_doctor: z.boolean(),
  allow_contact: z.boolean(),
  contact_phone: z.string().optional().nullable(),
  captchaToken: z.string().optional().nullable(),
});

// Shared refinements applied at the end of each branch schema
function applyMotherRefinements<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((value: unknown, ctx: z.RefinementCtx) => {
    const v = value as Record<string, unknown>;
    // location: at least one of (gps lat+lng) or location_text non-empty
    const hasGps = typeof v.gps_lat === 'number' && typeof v.gps_lng === 'number';
    const hasText = typeof v.location_text === 'string' && (v.location_text as string).trim().length > 0;
    if (!hasGps && !hasText) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location_text'],
        message: 'GPS coordinates or a location description is required',
      });
    }
    // phone when allow_contact === true must be 10-digit Indian
    if (v.allow_contact === true) {
      const phone = (typeof v.contact_phone === 'string' ? v.contact_phone : '').trim();
      if (!/^[6-9]\d{9}$/.test(phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['contact_phone'],
          message: 'Enter a 10-digit Indian mobile number',
        });
      }
    } else if (typeof v.contact_phone === 'string' && v.contact_phone.trim() !== '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contact_phone'],
        message: 'Phone must be empty when contact is not allowed',
      });
    }
    // syphilis_result === 'positive' → require took_treatment and doses_count
    if (v.syphilis_result === 'positive') {
      if (typeof v.took_treatment !== 'boolean') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['took_treatment'],
          message: 'Required when syphilis result is positive',
        });
      }
      if (typeof v.doses_count !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['doses_count'],
          message: 'Required when syphilis result is positive',
        });
      }
    }
  });
}

export const motherSelfReportPregnantSchema = applyMotherRefinements(
  motherBaseShape.extend({
    status: z.literal('pregnant'),
    months_pregnant: z.coerce.number().int().min(1).max(10),
    anc_received: z.boolean(),
    doctor_name: trimmedString(200),
    tested_during_pregnancy: z.boolean(),
    tested_for_syphilis: z.boolean(),
    syphilis_result: z.enum(['positive', 'negative', 'dont_know']),
    took_treatment: z.boolean().optional().nullable(),
    doses_count: z.coerce.number().int().min(1).max(3).optional().nullable(),
  }),
);

export const motherSelfReportDeliveredSchema = applyMotherRefinements(
  motherBaseShape.extend({
    status: z.literal('delivered'),
    baby_name: trimmedString(200),
    delivery_year: z.coerce.number().int().min(1950).max(2100),
    delivery_place: trimmedString(200),
    anc_received: z.boolean(),
    tested_for_syphilis: z.boolean(),
    syphilis_result: z.enum(['positive', 'negative', 'dont_know']),
    took_treatment: z.boolean().optional().nullable(),
    doses_count: z.coerce.number().int().min(1).max(3).optional().nullable(),
    treatment_when: optionalIsoDate,
    baby_health: z
      .object({
        doctor_said_infection: z.boolean(),
        baby_tested_syphilis: z.boolean(),
        baby_tested_hiv: z.boolean(),
        baby_unwell: z.boolean(),
        baby_fever: z.boolean(),
        baby_skin_rashes: z.boolean(),
        baby_feeding_difficulty: z.boolean(),
      })
      .optional()
      .nullable(),
  }),
).superRefine((v, ctx) => {
  // delivered + positive → require baby_health
  if (v.status === 'delivered' && v.syphilis_result === 'positive' && v.baby_health == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['baby_health'],
      message: 'Baby health questions are required when syphilis result is positive',
    });
  }
});

export const motherSelfReportSchema = z.union([
  motherSelfReportPregnantSchema,
  motherSelfReportDeliveredSchema,
]);
