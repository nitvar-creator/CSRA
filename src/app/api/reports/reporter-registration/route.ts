import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseJson, serverError } from '@/lib/api/validate';
import { reporterRegistrationSchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, reporterRegistrationSchema);
    if (!parsed.ok) return parsed.response;
    const d = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.from('reporter_details').insert({
      user_id: d.userId,
      full_name: d.fullName,
      age: d.age,
      qualification: d.qualification,
      designation: d.designation,
      facility_name: d.facilityName,
      district: d.district,
      contact: d.contact,
      facility_type: d.facilityType,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Reporter registered successfully' });
  } catch {
    return serverError();
  }
}
