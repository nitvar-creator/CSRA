import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      babyBasicId, testType, testDate, titres, result, maternalTitres,
      manifestations, prematurity, lowBirthWeight, complications,
      treatmentGiven, drugName, dose, treatmentDate, followup
    } = body;

    const supabase = await createClient();

    const { data, error } = await supabase.from('baby_serological').insert({
      baby_basic_id: babyBasicId || null,
      test_type: testType,
      test_date: testDate || null,
      titres: titres,
      result: result,
      maternal_titres: maternalTitres,
      manifestations: manifestations,
      prematurity: prematurity,
      low_birth_weight: lowBirthWeight,
      complications: complications,
      treatment_given: treatmentGiven,
      drug_name: drugName,
      dose: dose,
      treatment_date: treatmentDate || null,
      followup_required: followup
    });

    if (error) {
      console.error('Baby serological error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Serological record saved' });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
