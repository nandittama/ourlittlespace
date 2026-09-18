-- ============================================================
-- Migrate existing Our Little Space DB → Stitch redesign
-- Safe-ish: keeps memories; remaps kamu/dia → nadhif/diah
-- Run in Supabase SQL Editor.
-- ============================================================

-- Moods: ensure columns + remap person
alter table public.moods add column if not exists mood_date date;
alter table public.moods add column if not exists updated_at timestamptz;

update public.moods set mood_date = (timezone('Asia/Jakarta', created_at))::date where mood_date is null;
update public.moods set updated_at = coalesce(updated_at, created_at) where updated_at is null;
update public.moods set person = 'nadhif' where person in ('kamu', 'nadhif');
update public.moods set person = 'diah' where person in ('dia', 'diah');

alter table public.moods alter column mood_date set default ((timezone('Asia/Jakarta', now()))::date);
alter table public.moods alter column mood_date set not null;
alter table public.moods alter column updated_at set default now();
alter table public.moods alter column updated_at set not null;

delete from public.moods a using public.moods b
where a.person = b.person and a.mood_date = b.mood_date and a.created_at < b.created_at;

do $$ begin
  alter table public.moods drop constraint if exists moods_person_check;
exception when undefined_object then null; end $$;

alter table public.moods drop constraint if exists moods_person_check;
-- recreate check by dropping old and adding new (Postgres named checks vary)
alter table public.moods alter column person type text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'moods_person_date_unique') then
    alter table public.moods add constraint moods_person_date_unique unique (person, mood_date);
  end if;
end $$;

-- Notes: add sender/receiver/is_read
alter table public.notes add column if not exists sender text;
alter table public.notes add column if not exists receiver text;
alter table public.notes add column if not exists is_read boolean default false;

-- Migrate from legacy person column if present
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notes' and column_name = 'person'
  ) then
    update public.notes set sender = case
      when person in ('kamu', 'nadhif') then 'nadhif'
      else 'diah'
    end
    where sender is null;

    update public.notes set receiver = case
      when person in ('kamu', 'nadhif') then 'diah'
      else 'nadhif'
    end
    where receiver is null;
  end if;
end $$;

update public.notes set is_read = coalesce(is_read, false);

alter table public.notes alter column sender set not null;
alter table public.notes alter column receiver set not null;
alter table public.notes alter column is_read set not null;
alter table public.notes alter column is_read set default false;

-- Memories person remap
update public.memories set person = 'nadhif' where person in ('kamu', 'nadhif');
update public.memories set person = 'diah' where person in ('dia', 'diah');

-- New tables
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

-- Seed bucket from todo_items if empty
insert into public.bucket_items (title, status, created_by, completed_date, created_at)
select
  title,
  case when is_completed then 'completed' else 'planned' end,
  case when person in ('kamu', 'nadhif') then 'nadhif' else 'diah' end,
  case when is_completed then (timezone('Asia/Jakarta', coalesce(completed_at, now())))::date else null end,
  created_at
from public.todo_items
where not exists (select 1 from public.bucket_items limit 1);

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

alter table public.note_reactions enable row level security;
alter table public.bucket_items enable row level security;
alter table public.secret_letters enable row level security;
alter table public.hugs enable row level security;

drop policy if exists "Public can update moods" on public.moods;
create policy "Public can update moods" on public.moods for update using (true) with check (true);

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

grant select, insert, update on public.moods to anon, authenticated;
grant select, insert, update, delete on public.notes to anon, authenticated;
grant select, insert, delete on public.note_reactions to anon, authenticated;
grant select, insert, update, delete on public.bucket_items to anon, authenticated;
grant select, insert on public.secret_letters to anon, authenticated;
grant select, insert on public.hugs to anon, authenticated;
