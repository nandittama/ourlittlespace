-- Fix notes 400 errors: legacy person column + policies
-- Run in Supabase SQL Editor

-- Drop old check constraints on notes
do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class cl on cl.oid = c.conrelid
    join pg_namespace n on n.oid = cl.relnamespace
    where c.contype = 'c'
      and n.nspname = 'public'
      and cl.relname = 'notes'
  loop
    execute format('alter table public.notes drop constraint if exists %I', r.conname);
  end loop;
end $$;

-- Ensure sender/receiver exist
alter table public.notes add column if not exists sender text;
alter table public.notes add column if not exists receiver text;
alter table public.notes add column if not exists is_read boolean default false;

-- Backfill from legacy person if needed
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'notes' and column_name = 'person'
  ) then
    update public.notes
    set sender = case
      when coalesce(sender, person) in ('kamu', 'nadhif') then 'nadhif'
      else 'diah'
    end
    where sender is null;

    update public.notes
    set receiver = case
      when coalesce(sender, person) in ('kamu', 'nadhif') then 'diah'
      else 'nadhif'
    end
    where receiver is null;

    -- Make legacy person optional so inserts without it succeed
    alter table public.notes alter column person drop not null;
  end if;
end $$;

update public.notes set sender = 'nadhif' where sender is null;
update public.notes set receiver = 'diah' where receiver is null;
update public.notes set is_read = coalesce(is_read, false);

alter table public.notes alter column sender set not null;
alter table public.notes alter column receiver set not null;
alter table public.notes alter column is_read set default false;
alter table public.notes alter column is_read set not null;

alter table public.notes
  add constraint notes_sender_check check (sender in ('nadhif', 'diah'));
alter table public.notes
  add constraint notes_receiver_check check (receiver in ('nadhif', 'diah'));

-- Relax content length to 500 if old check was 300
-- (drop already done above; re-add soft check)
alter table public.notes
  add constraint notes_content_check
  check (char_length(trim(content)) > 0 and char_length(content) <= 500);

-- RLS policies for new columns
drop policy if exists "Public can insert notes" on public.notes;
drop policy if exists "notes_insert" on public.notes;
create policy "Public can insert notes" on public.notes
  for insert with check (sender in ('nadhif', 'diah'));

drop policy if exists "Public can read notes" on public.notes;
drop policy if exists "notes_select" on public.notes;
create policy "Public can read notes" on public.notes
  for select using (true);

drop policy if exists "Public can delete notes" on public.notes;
drop policy if exists "notes_delete" on public.notes;
create policy "Public can delete notes" on public.notes
  for delete using (true);

drop policy if exists "notes_update" on public.notes;
create policy "notes_update" on public.notes
  for update using (true) with check (true);

grant select, insert, update, delete on public.notes to anon, authenticated;
