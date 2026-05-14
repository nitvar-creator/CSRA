import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseJson, serverError } from '@/lib/api/validate';
import { signupSchema } from '@/lib/api/schemas';

export async function POST(request: Request) {
  try {
    const parsed = await parseJson(request, signupSchema);
    if (!parsed.ok) return parsed.response;
    const { fullName, mobile, email, password } = parsed.data;

    const supabase = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
    }

    if (authData?.user) {
      const { error: dbError } = await supabase.from('users').insert({
        id: authData.user.id,
        full_name: fullName,
        mobile,
        email,
      });

      if (dbError) {
        return NextResponse.json({ success: false, message: dbError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Signup successful', userId: authData.user.id });
    }

    return NextResponse.json({ success: false, message: 'Unknown error occurred' }, { status: 400 });
  } catch {
    return serverError();
  }
}
