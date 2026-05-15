import { createClient } from '@/lib/supabase/server';

export type SessionRoleResult = {
  userId: string | null;
  role: 'mother' | 'reporter' | null;
};

export async function getSessionRole(): Promise<SessionRoleResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { userId: null, role: null };

  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = data?.role;
  return {
    userId: user.id,
    role: role === 'mother' || role === 'reporter' ? role : null,
  };
}
