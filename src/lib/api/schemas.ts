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

export const signupSchema = z.object({
  fullName: trimmedString(200),
  mobile: z
    .string()
    .trim()
    .regex(/^[+0-9 \-()]{6,20}$/, 'Invalid mobile number'),
  email: z.string().trim().email().max(320),
  username: trimmedString(100),
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
  contact: z
    .string()
    .trim()
    .regex(/^[+0-9 \-()]{6,20}$/, 'Invalid contact number'),
  facilityType: trimmedString(100),
});

export const maternalBasicSchema = z.object({
  fullName: trimmedString(200),
  age: z.coerce.number().int().min(0).max(150),
  location: trimmedString(300),
  mctsId: trimmedString(100),
  contact: z
    .string()
    .trim()
    .regex(/^[+0-9 \-()]{6,20}$/, 'Invalid contact number'),
});

export const maternalConfirmatorySchema = z.object({
  maternalBasicId: uuid,
  testType: trimmedString(100),
  testDate: isoDate,
  titres: trimmedString(100),
  result: trimmedString(100),
  treatmentGiven: trimmedString(100),
  drugName: optionalString(200),
  dose: optionalString(100),
  treatmentDate: optionalIsoDate,
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

export const babySerologicalSchema = z.object({
  babyBasicId: optionalUuid,
  testType: trimmedString(100),
  testDate: optionalIsoDate,
  titres: trimmedString(100),
  result: trimmedString(100),
  maternalTitres: optionalString(100),
  manifestations: optionalString(1000),
  prematurity: optionalString(50),
  lowBirthWeight: optionalString(50),
  complications: optionalString(1000),
  treatmentGiven: optionalString(50),
  drugName: optionalString(200),
  dose: optionalString(100),
  treatmentDate: optionalIsoDate,
  followup: optionalString(1000),
});
