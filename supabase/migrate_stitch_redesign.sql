-- ============================================================
-- Migrate existing Our Little Space DB → Stitch redesign
-- IMPORTANT: drop person check constraints BEFORE remapping
-- Run all of this in Supabase SQL Editor.
-- ============================================================

-- 1) Drop ALL check constraints that mention person/sender/receiver/created_by
--    (old ones only allow kamu/dia)
do $$
declare
  r record;
begin
  for r in
    select c.conrelid::regclass as tbl, c.conname
    from pg_constraint c
    join pg_class cl on cl.oid = c.conrelid
    join pg_namespace n on n.oid = cl.relnamespace
    where c.contype = 'c'
      and n.nspname = 'public'
      and cl.relname in ('moods', 'notes', 'memories', 'todo_items', 'quick_messages')
  loop
    execute format('alter table %s drop constraint if exists %I', r.tbl, r.conname);
  end loop;
end $$;

-- 2) Moods: columns + remap person
alter table public.moods add column if not exists mood_date date;
alter table public.moods add column if not exists updated_at timestamptz;

update public.moods
set mood_date = (timezone('Asia/Jakarta', created_at))::date
where mood_date is null;

update public.moods
set updated_at = coalesce(updated_at, created_at)
where updated_at is null;

update public.moods set person = 'nadhif' where person in ('kamu', 'nadhif');
update public.moods set person = 'diah' where person in ('dia', 'diah');

-- Keep only latest mood per person/day
delete from public.moods a
using public.moods b
where a.person = b.person
  and a.mood_date = b.mood_date
  and a.created_at < b.created_at;

alter table public.moods
  alter column mood_date set default ((timezone('Asia/Jakarta', now()))::date);

alter table public.moods
  alter column mood_date set not null;

alter table public.moods
  alter column updated_at set default now();

alter table public.moods
  alter column updated_at set not null;

alter table public.moods
  drop constraint if exists moods_person_check;

alter table public.moods
  add constraint moods_person_check check (person in ('nadhif', 'diah'));

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'moods_person_date_unique'
  ) then
    alter table public.moods
      add constraint moods_person_date_unique unique (person, mood_date);
  end if;
end $$;

-- 3) Notes: sender / receiver / is_read
alter table public.notes add column if not exists sender text;
alter table public.notes add column if not exists receiver text;
alter table public.notes add column if not exists is_read boolean default false;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'notes'
      and column_name = 'person'
  ) then
    update public.notes
    set sender = case
      when person in ('kamu', 'nadhif') then 'nadhif'
      else 'diah'
    end
    where sender is null;

    update public.notes
    set receiver = case
      when person in ('kamu', 'nadhif') then 'diah'
      else 'nadhif'
    end
    where receiver is null;
  end if;
end $$;

-- Fallback if somehow still null
update public.notes set sender = 'nadhif' where sender is null;
update public.notes set receiver = 'diah' where receiver is null;
update public.notes set is_read = coalesce(is_read, false);

alter table public.notes alter column sender set not null;
alter table public.notes alter column receiver set not null;
alter table public.notes alter column is_read set not null;
alter table public.notes alter column is_read set default false;

alter table public.notes drop constraint if exists notes_sender_check;
alter table public.notes drop constraint if exists notes_receiver_check;
alter table public.notes
  add constraint notes_sender_check check (sender in ('nadhif', 'diah'));
alter table public.notes
  add constraint notes_receiver_check check (receiver in ('nadhif', 'diah'));

-- 4) Memories remap
update public.memories set person = 'nadhif' where person in ('kamu', 'nadhif');
update public.memories set person = 'diah' where person in ('dia', 'diah');

alter table public.memories drop constraint if exists memories_person_check;
alter table public.memories
  add constraint memories_person_check check (person in ('nadhif', 'diah'));

-- 5) New tables
create table if not exists public.note_reactions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  person text not null check (person in ('nadhif', 'diah')),
  reaction_type text not null check (reaction_type in ('heart', 'love', 'sparkle')),
  created_at timestamptz not null default now(),
  constraint note_reactions_unique unique (note_id, person, reaction_type)
);

create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  status text not null default 'planned' check (status in ('planned', 'someday', 'completed')),
  created_by text not null check (created_by in ('nadhif', 'diah')),
  completed_date date,
  created_at timestamptz not null default now()
);

insert into public.bucket_items (title, status, created_by, completed_date, created_at)
select
  title,
  case when is_completed then 'completed' else 'planned' end,
  case when person in ('kamu', 'nadhif') then 'nadhif' else 'diah' end,
  case
    when is_completed then (timezone('Asia/Jakarta', coalesce(completed_at, now())))::date
    else null
  end,
  created_at
from public.todo_items
where exists (
  select 1 from information_schema.tables
  where table_schema = 'public' and table_name = 'todo_items'
)
and not exists (select 1 from public.bucket_items limit 1);

create table if not exists public.secret_letters (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('nadhif', 'diah')),
  receiver text not null check (receiver in ('nadhif', 'diah')),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 1000),
  open_on date,
  created_at timestamptz not null default now()
);

create table if not exists public.hugs (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('nadhif', 'diah')),
  created_at timestamptz not null default now()
);

-- 6) RLS + grants
alter table public.moods enable row level security;
alter table public.notes enable row level security;
alter table public.note_reactions enable row level security;
alter table public.bucket_items enable row level security;
alter table public.secret_letters enable row level security;
alter table public.hugs enable row level security;
alter table public.memories enable row level security;

drop policy if exists "Public can update moods" on public.moods;
drop policy if exists "moods_update" on public.moods;
create policy "Public can update moods" on public.moods
  for update using (true) with check (true);

-- Allow inserts with new person values (recreate if old check on policy)
drop policy if exists "Public can insert moods" on public.moods;
drop policy if exists "moods_insert" on public.moods;
create policy "Public can insert moods" on public.moods
  for insert with check (person in ('nadhif', 'diah'));

drop policy if exists "Public can read moods" on public.moods;
drop policy if exists "moods_select" on public.moods;
create policy "Public can read moods" on public.moods
  for select using (true);

drop policy if exists "reactions_select" on public.note_reactions;
drop policy if exists "reactions_insert" on public.note_reactions;
drop policy if exists "reactions_delete" on public.note_reactions;
create policy "reactions_select" on public.note_reactions for select using (true);
create policy "reactions_insert" on public.note_reactions for insert with check (true);
create policy "reactions_delete" on public.note_reactions for delete using (true);

drop policy if exists "bucket_select" on public.bucket_items;
drop policy if exists "bucket_insert" on public.bucket_items;
drop policy if exists "bucket_update" on public.bucket_items;
drop policy if exists "bucket_delete" on public.bucket_items;
create policy "bucket_select" on public.bucket_items for select using (true);
create policy "bucket_insert" on public.bucket_items for insert with check (true);
create policy "bucket_update" on public.bucket_items for update using (true) with check (true);
create policy "bucket_delete" on public.bucket_items for delete using (true);

drop policy if exists "letters_select" on public.secret_letters;
drop policy if exists "letters_insert" on public.secret_letters;
create policy "letters_select" on public.secret_letters for select using (true);
create policy "letters_insert" on public.secret_letters for insert with check (true);

drop policy if exists "hugs_select" on public.hugs;
drop policy if exists "hugs_insert" on public.hugs;
create policy "hugs_select" on public.hugs for select using (true);
create policy "hugs_insert" on public.hugs for insert with check (true);

drop policy if exists "notes_update" on public.notes;
create policy "notes_update" on public.notes for update using (true) with check (true);

drop policy if exists "Public can insert notes" on public.notes;
create policy "Public can insert notes" on public.notes
  for insert with check (sender in ('nadhif', 'diah'));

drop policy if exists "Public can insert memories" on public.memories;
create policy "Public can insert memories" on public.memories
  for insert with check (person in ('nadhif', 'diah'));

grant select, insert, update on public.moods to anon, authenticated;
grant select, insert, update, delete on public.notes to anon, authenticated;
grant select, insert, delete on public.note_reactions to anon, authenticated;
grant select, insert, update, delete on public.bucket_items to anon, authenticated;
grant select, insert on public.secret_letters to anon, authenticated;
grant select, insert on public.hugs to anon, authenticated;
