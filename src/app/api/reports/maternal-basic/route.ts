import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, age, location, mctsId, contact } = body;

    const supabase = await createClient();

    const { data, error } = await supabase.from('maternal_basic').insert({
      full_name: fullName,
      age: age,
      location: location,
      mcts_id: mctsId,
      contact: contact
    }).select();

    if (error) {
      console.error('Maternal basic error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, maternalBasicId: data[0].id });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
