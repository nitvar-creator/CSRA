import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseJson, serverError } from '@/lib/api/validate';
import { babyBasicSchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, babyBasicSchema);
    if (!parsed.ok) return parsed.response;
    const d = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('baby_basic')
      .insert({
        name: d.name,
        delivery_date: d.deliveryDate,
        age: d.age,
        mcts_id: d.mctsId,
        weight: d.weight,
        location: d.location,
        gender: d.gender,
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, babyBasicId: data[0].id });
  } catch {
    return serverError();
  }
}
