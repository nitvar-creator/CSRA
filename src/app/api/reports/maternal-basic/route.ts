import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseJson, serverError } from '@/lib/api/validate';
import { maternalBasicSchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, maternalBasicSchema);
    if (!parsed.ok) return parsed.response;
    const d = parsed.data;

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('maternal_basic')
      .insert({
        full_name: d.fullName,
        age: d.age,
        location: d.location,
        mcts_id: d.mctsId,
        contact: d.contact,
      })
      .select();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, maternalBasicId: data[0].id });
  } catch {
    return serverError();
  }
}
