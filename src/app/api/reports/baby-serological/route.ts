import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseJson, serverError } from '@/lib/api/validate';
import { babySerologicalSchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, babySerologicalSchema);
    if (!parsed.ok) return parsed.response;
    const d = parsed.data;

    const supabase = await createClient();

    const { error } = await supabase.from('baby_serological').insert({
      baby_basic_id: d.babyBasicId,
      test_type: d.testType,
      test_date: d.testDate,
      titres: d.titres,
      result: d.result,
      maternal_titres: d.maternalTitres,
      manifestations: d.manifestations,
      prematurity: d.prematurity,
      low_birth_weight: d.lowBirthWeight,
      complications: d.complications,
      treatment_given: d.treatmentGiven,
      drug_name: d.drugName,
      dose: d.dose,
      treatment_date: d.treatmentDate,
      followup_required: d.followup,
    });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Serological record saved' });
  } catch {
    return serverError();
  }
}
