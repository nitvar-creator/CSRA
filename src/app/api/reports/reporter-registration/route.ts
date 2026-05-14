import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, fullName, age, qualification, designation, facilityName, district, contact, facilityType } = body;

    const supabase = await createClient();

    const { error } = await supabase.from('reporter_details').insert({
      user_id: userId,
      full_name: fullName,
      age: age,
      qualification: qualification,
      designation: designation,
      facility_name: facilityName,
      district: district,
      contact: contact,
      facility_type: facilityType
    });

    if (error) {
      console.error('Reporter error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Reporter registered successfully' });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
