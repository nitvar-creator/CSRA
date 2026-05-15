import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  maternalConfirmatorySchema,
  motherSelfReportSchema,
} from './schemas';

describe('signupSchema', () => {
  it('accepts a valid signup', () => {
    const ok = signupSchema.safeParse({
      fullName: 'Alice',
      mobile: '9876543210',
      email: 'a@example.com',
      password: 'longenoughpw',
    });
    expect(ok.success).toBe(true);
  });

  it('rejects 9-digit mobile', () => {
    const r = signupSchema.safeParse({
      fullName: 'Alice',
      mobile: '987654321',
      email: 'a@example.com',
      password: 'longenoughpw',
    });
    expect(r.success).toBe(false);
  });

  it('rejects mobile starting with 5', () => {
    const r = signupSchema.safeParse({
      fullName: 'Alice',
      mobile: '5876543210',
      email: 'a@example.com',
      password: 'longenoughpw',
    });
    expect(r.success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    const r = signupSchema.safeParse({
      fullName: 'Alice',
      mobile: '9876543210',
      email: 'a@example.com',
      password: 'short',
    });
    expect(r.success).toBe(false);
  });
});

describe('maternalConfirmatorySchema', () => {
  const base = {
    maternalBasicId: '00000000-0000-4000-8000-000000000000',
    testType: 'TPPA',
    testDate: '2025-06-01',
    titres: '1:16',
  };

  it('accepts negative result without treatment fields', () => {
    const r = maternalConfirmatorySchema.safeParse({ ...base, result: 'Negative' });
    expect(r.success).toBe(true);
  });

  it('requires treatmentGiven when result is Positive', () => {
    const r = maternalConfirmatorySchema.safeParse({ ...base, result: 'Positive' });
    expect(r.success).toBe(false);
  });

  it('requires drug/dose/date when treatmentGiven is Yes', () => {
    const r = maternalConfirmatorySchema.safeParse({
      ...base,
      result: 'Positive',
      treatmentGiven: 'Yes',
    });
    expect(r.success).toBe(false);
  });

  it('accepts Positive + treatmentGiven=No without drug fields', () => {
    const r = maternalConfirmatorySchema.safeParse({
      ...base,
      result: 'Positive',
      treatmentGiven: 'No',
    });
    expect(r.success).toBe(true);
  });
});

describe('motherSelfReportSchema', () => {
  const startFields = {
    name: 'M',
    age: 25,
    location_text: 'Mumbai',
    visiting_doctor: true,
    allow_contact: false,
  };

  it('accepts a minimal pregnant negative submission', () => {
    const r = motherSelfReportSchema.safeParse({
      ...startFields,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'negative',
    });
    expect(r.success).toBe(true);
  });

  it('rejects pregnant positive without treatment fields', () => {
    const r = motherSelfReportSchema.safeParse({
      ...startFields,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'positive',
    });
    expect(r.success).toBe(false);
  });

  it('rejects when allow_contact=true and contact_phone is missing', () => {
    const r = motherSelfReportSchema.safeParse({
      ...startFields,
      allow_contact: true,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'negative',
    });
    expect(r.success).toBe(false);
  });

  it('rejects delivered + positive without baby_health', () => {
    const r = motherSelfReportSchema.safeParse({
      ...startFields,
      status: 'delivered',
      baby_name: 'Baby',
      delivery_year: 2024,
      delivery_place: 'Hospital',
      anc_received: true,
      tested_for_syphilis: true,
      syphilis_result: 'positive',
      took_treatment: true,
      doses_count: 1,
    });
    expect(r.success).toBe(false);
  });

  it('rejects when neither GPS nor location_text is set', () => {
    const r = motherSelfReportSchema.safeParse({
      name: 'M',
      age: 25,
      visiting_doctor: true,
      allow_contact: false,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'negative',
    });
    expect(r.success).toBe(false);
  });
});
