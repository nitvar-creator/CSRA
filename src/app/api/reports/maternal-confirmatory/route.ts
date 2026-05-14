import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      maternalBasicId, 
      testType, 
      testDate, 
      titres, 
      result,
      treatmentGiven, 
      drugName, 
      dose, 
      treatmentDate 
    } = body;

    if (!maternalBasicId || !testType || !testDate || !titres || !result || !treatmentGiven) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from('maternal_confirmatory').insert({
      maternal_basic_id: maternalBasicId,
      test_type: testType,
      test_date: testDate,
      titres: titres,
      result: result,
      treatment_given: treatmentGiven,
      drug_name: drugName || null,
      dose: dose || null,
      treatment_date: treatmentDate || null
    });

    if (error) {
      console.error('Maternal confirmatory error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Confirmatory test saved' });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
