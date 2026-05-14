import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, mobile, email, username, password } = body;

    const supabase = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 });
    }

    if (authData?.user) {
       // Insert into custom users table as legacy app did
       const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          full_name: fullName,
          mobile: mobile,
          email: email
       });

       if (dbError) {
         console.error('DB insert error:', dbError);
       }
       
       return NextResponse.json({ success: true, message: 'Signup successful', userId: authData.user.id });
    }

    return NextResponse.json({ success: false, message: 'Unknown error occurred' }, { status: 400 });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
