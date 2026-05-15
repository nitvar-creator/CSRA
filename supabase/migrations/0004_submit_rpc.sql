-- 0004_submit_rpc.sql — Atomic insert for mother self-report parent + optional baby health child.

create or replace function public.submit_mother_self_report(
  p_parent jsonb,
  p_baby_health jsonb default null
)
returns uuid                              -- the id of the new mother_self_report row
language plpgsql
security invoker                          -- run as the caller; RLS applies
set search_path = public
as $$
declare
  v_report_id uuid;
begin
  insert into public.mother_self_report (
    user_id,
    name,
    age,
    gps_lat,
    gps_lng,
    location_text,
    status,
    months_pregnant,
    anc_received,
    doctor_name,
    tested_during_pregnancy,
    tested_for_syphilis,
    syphilis_result,
    took_treatment,
    doses_count,
    baby_name,
    delivery_year,
    delivery_place,
    treatment_when,
    visiting_doctor,
    allow_contact,
    contact_phone
  )
  values (
    (p_parent->>'user_id')::uuid,
    p_parent->>'name',
    (p_parent->>'age')::int,
    nullif(p_parent->>'gps_lat','')::double precision,
    nullif(p_parent->>'gps_lng','')::double precision,
    nullif(p_parent->>'location_text',''),
    p_parent->>'status',
    nullif(p_parent->>'months_pregnant','')::int,
    nullif(p_parent->>'anc_received','')::boolean,
    nullif(p_parent->>'doctor_name',''),
    nullif(p_parent->>'tested_during_pregnancy','')::boolean,
    nullif(p_parent->>'tested_for_syphilis','')::boolean,
    nullif(p_parent->>'syphilis_result',''),
    nullif(p_parent->>'took_treatment','')::boolean,
    nullif(p_parent->>'doses_count','')::int,
    nullif(p_parent->>'baby_name',''),
    nullif(p_parent->>'delivery_year','')::int,
    nullif(p_parent->>'delivery_place',''),
    nullif(p_parent->>'treatment_when','')::date,
    nullif(p_parent->>'visiting_doctor','')::boolean,
    nullif(p_parent->>'allow_contact','')::boolean,
    nullif(p_parent->>'contact_phone','')
  )
  returning id into v_report_id;

  if p_baby_health is not null then
    insert into public.mother_self_report_baby_health (
      report_id,
      doctor_said_infection,
      baby_tested_syphilis,
      baby_tested_hiv,
      baby_unwell,
      baby_fever,
      baby_skin_rashes,
      baby_feeding_difficulty
    )
    values (
      v_report_id,
      nullif(p_baby_health->>'doctor_said_infection','')::boolean,
      nullif(p_baby_health->>'baby_tested_syphilis','')::boolean,
      nullif(p_baby_health->>'baby_tested_hiv','')::boolean,
      nullif(p_baby_health->>'baby_unwell','')::boolean,
      nullif(p_baby_health->>'baby_fever','')::boolean,
      nullif(p_baby_health->>'baby_skin_rashes','')::boolean,
      nullif(p_baby_health->>'baby_feeding_difficulty','')::boolean
    );
  end if;

  return v_report_id;
end;
$$;

-- Allow anon + authenticated to call (RLS still enforces the row-level checks).
grant execute on function public.submit_mother_self_report(jsonb, jsonb) to anon, authenticated;
