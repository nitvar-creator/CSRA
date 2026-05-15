import { describe, it, expect } from 'vitest';
import {
  nextStep,
  prevStep,
  isComplete,
  visitedSteps,
  ROUTE_BY_STEP,
  STEP_BY_ROUTE,
  type MotherAnswers,
  type MotherStep,
} from './flow';

describe('nextStep', () => {
  it('start always goes to status', () => {
    expect(nextStep('start', {})).toBe('status');
  });

  it('status routes by status value', () => {
    expect(nextStep('status', { status: 'pregnant' })).toBe('pregnant_about');
    expect(nextStep('status', { status: 'delivered' })).toBe('delivered_baby');
  });

  describe('pregnant branch', () => {
    it('pregnant_about -> pregnant_info_1', () => {
      expect(nextStep('pregnant_about', { status: 'pregnant' })).toBe('pregnant_info_1');
    });
    it('pregnant_info_1 -> pregnant_testing', () => {
      expect(nextStep('pregnant_info_1', { status: 'pregnant' })).toBe('pregnant_testing');
    });
    it('pregnant_testing positive -> pregnant_treatment', () => {
      expect(nextStep('pregnant_testing', { status: 'pregnant', syphilis_result: 'positive' })).toBe('pregnant_treatment');
    });
    it('pregnant_testing negative -> follow_up (skip treatment)', () => {
      expect(nextStep('pregnant_testing', { status: 'pregnant', syphilis_result: 'negative' })).toBe('follow_up');
    });
    it('pregnant_testing dont_know -> follow_up', () => {
      expect(nextStep('pregnant_testing', { status: 'pregnant', syphilis_result: 'dont_know' })).toBe('follow_up');
    });
    it('pregnant_treatment -> follow_up', () => {
      expect(nextStep('pregnant_treatment', { status: 'pregnant' })).toBe('follow_up');
    });
  });

  describe('delivered branch', () => {
    it('delivered_baby -> delivered_anc', () => {
      expect(nextStep('delivered_baby', { status: 'delivered' })).toBe('delivered_anc');
    });
    it('delivered_anc -> delivered_info_1', () => {
      expect(nextStep('delivered_anc', { status: 'delivered' })).toBe('delivered_info_1');
    });
    it('delivered_info_1 -> delivered_testing', () => {
      expect(nextStep('delivered_info_1', { status: 'delivered' })).toBe('delivered_testing');
    });
    it('delivered_testing positive -> delivered_treatment', () => {
      expect(nextStep('delivered_testing', { status: 'delivered', syphilis_result: 'positive' })).toBe('delivered_treatment');
    });
    it('delivered_testing negative -> follow_up (skip all baby_health)', () => {
      expect(nextStep('delivered_testing', { status: 'delivered', syphilis_result: 'negative' })).toBe('follow_up');
    });
    it('delivered_treatment -> delivered_info_2', () => {
      expect(nextStep('delivered_treatment', { status: 'delivered', syphilis_result: 'positive' })).toBe('delivered_info_2');
    });
    it('delivered_info_2 -> delivered_baby_health_1', () => {
      expect(nextStep('delivered_info_2', { status: 'delivered', syphilis_result: 'positive' })).toBe('delivered_baby_health_1');
    });
    it('baby_health chain: 1 -> 2 -> 3 -> follow_up', () => {
      const a: MotherAnswers = { status: 'delivered', syphilis_result: 'positive' };
      expect(nextStep('delivered_baby_health_1', a)).toBe('delivered_baby_health_2');
      expect(nextStep('delivered_baby_health_2', a)).toBe('delivered_baby_health_3');
      expect(nextStep('delivered_baby_health_3', a)).toBe('follow_up');
    });
  });

  it('follow_up -> review', () => {
    expect(nextStep('follow_up', {})).toBe('review');
  });
  it('review -> thank_you', () => {
    expect(nextStep('review', {})).toBe('thank_you');
  });
  it('thank_you -> null', () => {
    expect(nextStep('thank_you', {})).toBeNull();
  });
});

describe('prevStep', () => {
  it('start has no previous', () => {
    expect(prevStep('start', {})).toBeNull();
  });

  it('mirrors negative-skip: from follow_up on pregnant-negative, prev is pregnant_testing', () => {
    const answers: MotherAnswers = { status: 'pregnant', syphilis_result: 'negative' };
    expect(prevStep('follow_up', answers)).toBe('pregnant_testing');
  });

  it('mirrors negative-skip: from follow_up on delivered-negative, prev is delivered_testing', () => {
    const answers: MotherAnswers = { status: 'delivered', syphilis_result: 'negative' };
    expect(prevStep('follow_up', answers)).toBe('delivered_testing');
  });

  it('on delivered-positive, prev from follow_up is delivered_baby_health_3', () => {
    const answers: MotherAnswers = { status: 'delivered', syphilis_result: 'positive' };
    expect(prevStep('follow_up', answers)).toBe('delivered_baby_health_3');
  });
});

describe('visitedSteps', () => {
  it('empty answers produces a default pregnant path', () => {
    const steps = visitedSteps({});
    expect(steps[0]).toBe('start');
    expect(steps[steps.length - 1]).toBe('thank_you');
  });

  it('pregnant + negative skips treatment', () => {
    const steps = visitedSteps({ status: 'pregnant', syphilis_result: 'negative' });
    expect(steps).not.toContain('pregnant_treatment');
    expect(steps).toContain('pregnant_testing');
    expect(steps).toContain('follow_up');
  });

  it('delivered + positive includes baby_health chain', () => {
    const steps = visitedSteps({ status: 'delivered', syphilis_result: 'positive' });
    expect(steps).toContain('delivered_treatment');
    expect(steps).toContain('delivered_info_2');
    expect(steps).toContain('delivered_baby_health_1');
    expect(steps).toContain('delivered_baby_health_2');
    expect(steps).toContain('delivered_baby_health_3');
  });

  it('delivered + negative skips treatment AND baby_health', () => {
    const steps = visitedSteps({ status: 'delivered', syphilis_result: 'negative' });
    expect(steps).not.toContain('delivered_treatment');
    expect(steps).not.toContain('delivered_info_2');
    expect(steps).not.toContain('delivered_baby_health_1');
    expect(steps).not.toContain('delivered_baby_health_2');
    expect(steps).not.toContain('delivered_baby_health_3');
  });
});

describe('isComplete', () => {
  const baseLocation = { name: 'Test', age: 25, location_text: 'Mumbai' };
  const baseFollowUp = { visiting_doctor: true, allow_contact: false };

  it('returns false for empty answers', () => {
    expect(isComplete({})).toBe(false);
  });

  it('returns true for pregnant + negative with required fields', () => {
    const answers: MotherAnswers = {
      ...baseLocation,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr. A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'negative',
      ...baseFollowUp,
    };
    expect(isComplete(answers)).toBe(true);
  });

  it('returns false for pregnant + positive missing took_treatment', () => {
    const answers: MotherAnswers = {
      ...baseLocation,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr. A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'positive',
      ...baseFollowUp,
    };
    expect(isComplete(answers)).toBe(false);
  });

  it('returns false when allow_contact=true but contact_phone is invalid', () => {
    const answers: MotherAnswers = {
      ...baseLocation,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr. A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'negative',
      visiting_doctor: true,
      allow_contact: true,
      contact_phone: '12345',
    };
    expect(isComplete(answers)).toBe(false);
  });

  it('returns true when allow_contact=true and contact_phone is a valid Indian mobile', () => {
    const answers: MotherAnswers = {
      ...baseLocation,
      status: 'pregnant',
      months_pregnant: 4,
      anc_received: true,
      doctor_name: 'Dr. A',
      tested_during_pregnancy: true,
      tested_for_syphilis: true,
      syphilis_result: 'negative',
      visiting_doctor: true,
      allow_contact: true,
      contact_phone: '9876543210',
    };
    expect(isComplete(answers)).toBe(true);
  });
});

describe('ROUTE_BY_STEP <-> STEP_BY_ROUTE', () => {
  it('every step has a route', () => {
    const steps: MotherStep[] = [
      'start','status','pregnant_about','pregnant_info_1','pregnant_testing','pregnant_treatment',
      'delivered_baby','delivered_anc','delivered_info_1','delivered_testing','delivered_treatment',
      'delivered_info_2','delivered_baby_health_1','delivered_baby_health_2','delivered_baby_health_3',
      'follow_up','review','thank_you',
    ];
    for (const s of steps) {
      expect(ROUTE_BY_STEP[s]).toMatch(/^\/mother\//);
    }
  });

  it('STEP_BY_ROUTE is the inverse of ROUTE_BY_STEP', () => {
    for (const [step, route] of Object.entries(ROUTE_BY_STEP)) {
      expect(STEP_BY_ROUTE[route]).toBe(step);
    }
  });
});
