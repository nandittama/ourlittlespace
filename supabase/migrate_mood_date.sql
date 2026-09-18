-- ============================================================
-- Safe migration for EXISTING Our Little Space databases
-- Run this if tables already exist (does NOT drop data).
-- ============================================================

-- Moods: one active mood per person per Jakarta day
alter table public.moods
  add column if not exists mood_date date;

alter table public.moods
  add column if not exists updated_at timestamptz;

update public.moods
set mood_date = (timezone('Asia/Jakarta', created_at))::date
where mood_date is null;

update public.moods
set updated_at = coalesce(updated_at, created_at)
where updated_at is null;

alter table public.moods
  alter column mood_date set default ((timezone('Asia/Jakarta', now()))::date);

alter table public.moods
  alter column mood_date set not null;

alter table public.moods
  alter column updated_at set default now();

alter table public.moods
  alter column updated_at set not null;

-- Keep latest mood per person/day, drop older duplicates
delete from public.moods a
using public.moods b
where a.person = b.person
  and a.mood_date = b.mood_date
  and a.created_at < b.created_at;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'moods_person_date_unique'
  ) then
    alter table public.moods
      add constraint moods_person_date_unique unique (person, mood_date);
  end if;
end $$;

drop policy if exists "Public can update moods" on public.moods;
create policy "Public can update moods"
  on public.moods for update
  using (true)
  with check (person in ('kamu', 'dia'));

grant update on public.moods to anon, authenticated;

-- Tighten note length to 300 if previous schema allowed 500
-- (existing longer notes remain; new inserts follow app validation)
