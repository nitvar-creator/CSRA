import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseJson, serverError } from '@/lib/api/validate';
import { motherSelfReportSchema } from '@/lib/api/schemas';

export const runtime = 'nodejs';

async function verifyCaptcha(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  // If no secret configured, bypass (development mode).
  if (!secret) return true;
  if (!token) return false;

  try {
    const res = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }).toString(),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, motherSelfReportSchema);
    if (!parsed.ok) return parsed.response;
    const data = parsed.data;

    const supabase = await createClient();

    // Anonymous walk-ins are allowed; user_id is only set if a session exists.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id ?? null;

    // Anonymous walk-ins must solve hCaptcha (unless HCAPTCHA_SECRET is unset for dev).
    if (!userId) {
      const ok = await verifyCaptcha(data.captchaToken);
      if (!ok) {
        return NextResponse.json(
          { success: false, message: 'Captcha verification failed. Please try again.' },
          { status: 401 },
        );
      }
    }

    // Build the parent jsonb payload — branch-specific fields are accessed via
    // `in` narrowing so the discriminated union (pregnant | delivered) stays type-safe.
    // Note: captchaToken is intentionally excluded — it is not persisted.
    const parent: Record<string, unknown> = {
      user_id: userId,
      name: data.name,
      age: data.age,
      gps_lat: data.gps_lat ?? null,
      gps_lng: data.gps_lng ?? null,
      location_text: data.location_text ?? null,
      status: data.status,
      months_pregnant: 'months_pregnant' in data ? data.months_pregnant : null,
      anc_received: data.anc_received,
      doctor_name: 'doctor_name' in data ? data.doctor_name : null,
      tested_during_pregnancy:
        'tested_during_pregnancy' in data ? data.tested_during_pregnancy : null,
      tested_for_syphilis: data.tested_for_syphilis,
      syphilis_result: data.syphilis_result,
      took_treatment: data.took_treatment ?? null,
      doses_count: data.doses_count ?? null,
      baby_name: 'baby_name' in data ? data.baby_name : null,
      delivery_year: 'delivery_year' in data ? data.delivery_year : null,
      delivery_place: 'delivery_place' in data ? data.delivery_place : null,
      treatment_when:
        'treatment_when' in data ? (data.treatment_when ?? null) : null,
      visiting_doctor: data.visiting_doctor,
      allow_contact: data.allow_contact,
      contact_phone: data.allow_contact ? (data.contact_phone ?? null) : null,
    };

    const babyHealthPayload =
      data.status === 'delivered' && 'baby_health' in data && data.baby_health
        ? data.baby_health
        : null;

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'submit_mother_self_report',
      { p_parent: parent, p_baby_health: babyHealthPayload },
    );

    if (rpcError) {
      return NextResponse.json(
        { success: false, message: rpcError.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, reportId: rpcData });
  } catch {
    return serverError();
  }
}
