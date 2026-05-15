import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DashboardStats = {
  mothers: number;
  babies: number;
  affectedMothers: number;
  affectedBabies: number;
  treatedMothers: number;
  treatedBabies: number;
  pendingFollowups: number;
};

function countDistinct<T>(rows: Array<Record<string, T>> | null, key: string): number {
  if (!rows) return 0;
  const seen = new Set<T>();
  for (const r of rows) {
    const v = r[key];
    if (v != null) seen.add(v);
  }
  return seen.size;
}

export async function GET() {
  // The middleware (src/middleware.ts) already restricts this route to reporters.
  // Defense-in-depth: if for any reason an unauthenticated request reaches here,
  // we still want a 401 rather than a 200 with zeroes.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const [
    mothersRes,
    babiesRes,
    screeningPositiveRes,
    confirmatoryPositiveRes,
    babyPositiveRes,
    treatedMothersRes,
    treatedBabiesRes,
    pendingRes,
  ] = await Promise.all([
    supabase.from('maternal_basic').select('*', { count: 'exact', head: true }),
    supabase.from('baby_basic').select('*', { count: 'exact', head: true }),
    supabase.from('maternal_screening').select('maternal_basic_id').eq('result', 'Positive'),
    supabase.from('maternal_confirmatory').select('maternal_basic_id').eq('result', 'Positive'),
    supabase.from('baby_serological').select('baby_basic_id').eq('result', 'Positive'),
    supabase.from('maternal_confirmatory').select('maternal_basic_id').eq('treatment_given', 'Yes'),
    supabase.from('baby_serological').select('baby_basic_id').eq('treatment_given', 'Yes'),
    supabase.from('baby_serological').select('*', { count: 'exact', head: true }).eq('followup_required', true),
  ]);

  const firstError =
    mothersRes.error ||
    babiesRes.error ||
    screeningPositiveRes.error ||
    confirmatoryPositiveRes.error ||
    babyPositiveRes.error ||
    treatedMothersRes.error ||
    treatedBabiesRes.error ||
    pendingRes.error;

  if (firstError) {
    return NextResponse.json({ success: false, message: firstError.message }, { status: 500 });
  }

  const affectedMothersSet = new Set<string>();
  for (const r of screeningPositiveRes.data ?? []) {
    if (r.maternal_basic_id) affectedMothersSet.add(r.maternal_basic_id);
  }
  for (const r of confirmatoryPositiveRes.data ?? []) {
    if (r.maternal_basic_id) affectedMothersSet.add(r.maternal_basic_id);
  }

  const stats: DashboardStats = {
    mothers: mothersRes.count ?? 0,
    babies: babiesRes.count ?? 0,
    affectedMothers: affectedMothersSet.size,
    affectedBabies: countDistinct(babyPositiveRes.data, 'baby_basic_id'),
    treatedMothers: countDistinct(treatedMothersRes.data, 'maternal_basic_id'),
    treatedBabies: countDistinct(treatedBabiesRes.data, 'baby_basic_id'),
    pendingFollowups: pendingRes.count ?? 0,
  };

  return NextResponse.json({ success: true, stats });
}
