import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, deliveryDate, age, mctsId, weight, location, gender } = body;

    const supabase = await createClient();

    const { data, error } = await supabase.from('baby_basic').insert({
      name: name,
      delivery_date: deliveryDate || null,
      age: age,
      mcts_id: mctsId,
      weight: weight,
      location: location,
      gender: gender
    }).select();

    if (error) {
      console.error('Baby basic error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, babyBasicId: data[0].id });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
