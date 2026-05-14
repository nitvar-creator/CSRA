import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('users')
      .update({ role: role })
      .eq('id', userId);

    if (error) {
      console.error('Role update error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Role updated' });
    
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
