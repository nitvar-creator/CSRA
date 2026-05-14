import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseJson, serverError } from '@/lib/api/validate';
import { maternalConfirmatorySchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, maternalConfirmatorySchema);
    if (!parsed.ok) return parsed.response;
    const d = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.from('maternal_confirmatory').insert({
      maternal_basic_id: d.maternalBasicId,
      test_type: d.testType,
      test_date: d.testDate,
      titres: d.titres,
      result: d.result,
      treatment_given: d.treatmentGiven,
      drug_name: d.drugName,
      dose: d.dose,
      treatment_date: d.treatmentDate,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Confirmatory test saved' });
  } catch {
    return serverError();
  }
}
