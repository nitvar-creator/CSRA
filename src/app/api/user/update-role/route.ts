import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseJson, serverError } from '@/lib/api/validate';
import { updateRoleSchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, updateRoleSchema);
    if (!parsed.ok) return parsed.response;
    const { userId, role } = parsed.data;

    const supabase = createAdminClient();

    const { error } = await supabase.from('users').update({ role }).eq('id', userId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Role updated' });
  } catch {
    return serverError();
  }
}
