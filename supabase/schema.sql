-- ============================================================
-- Our Little Space — Public schema (NO AUTH)
-- Run in Supabase SQL Editor (full reset for new setup)
-- WARNING: Anyone with the website URL can read/write this data.
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- CLEANUP
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.quick_messages cascade;
drop table if exists public.memories cascade;
drop table if exists public.todo_items cascade;
drop table if exists public.notes cascade;
drop table if exists public.moods cascade;
drop table if exists public.couples cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.join_couple_with_code(text) cascade;
drop function if exists public.get_partner_id() cascade;
drop function if exists public.is_partnered() cascade;
drop function if exists public.are_partners(uuid, uuid) cascade;
drop function if exists public.user_in_my_couple(uuid) cascade;
drop function if exists public.generate_invite_code() cascade;

-- ============================================================
-- TABLES
-- ============================================================

create table public.moods (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('kamu', 'dia')),
  mood_key text not null,
  mood_emoji text not null,
  mood_label text not null,
  message text check (message is null or char_length(message) <= 200),
  mood_date date not null default ((timezone('Asia/Jakarta', now()))::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint moods_person_date_unique unique (person, mood_date)
);

create index moods_person_date_idx on public.moods(person, mood_date desc);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('kamu', 'dia')),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 300),
  created_at timestamptz not null default now()
);

create index notes_person_created_idx on public.notes(person, created_at desc);

create table public.todo_items (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('kamu', 'dia')),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 100),
  is_completed boolean not null default false,
  completed_by text check (completed_by is null or completed_by in ('kamu', 'dia')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index todo_items_created_idx on public.todo_items(created_at desc);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('kamu', 'dia')),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 100),
  description text check (description is null or char_length(description) <= 500),
  image_url text not null,
  memory_date date not null default ((timezone('Asia/Jakarta', now()))::date),
  created_at timestamptz not null default now()
);

create index memories_date_idx on public.memories(memory_date desc);

create table public.quick_messages (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('kamu', 'dia')),
  type text not null,
  message text not null check (char_length(message) <= 100),
  created_at timestamptz not null default now()
);

create index quick_messages_created_idx on public.quick_messages(created_at desc);

-- ============================================================
-- RLS
-- ============================================================

alter table public.moods enable row level security;
alter table public.notes enable row level security;
alter table public.todo_items enable row level security;
alter table public.memories enable row level security;
alter table public.quick_messages enable row level security;

create policy "Public can read moods" on public.moods for select using (true);
create policy "Public can insert moods" on public.moods for insert with check (person in ('kamu', 'dia'));
create policy "Public can update moods" on public.moods for update using (true) with check (person in ('kamu', 'dia'));

create policy "Public can read notes" on public.notes for select using (true);
create policy "Public can insert notes" on public.notes for insert with check (person in ('kamu', 'dia'));
create policy "Public can delete notes" on public.notes for delete using (true);

create policy "Public can read todos" on public.todo_items for select using (true);
create policy "Public can insert todos" on public.todo_items for insert with check (person in ('kamu', 'dia'));
create policy "Public can update todos" on public.todo_items for update using (true) with check (true);
create policy "Public can delete todos" on public.todo_items for delete using (true);

create policy "Public can read memories" on public.memories for select using (true);
create policy "Public can insert memories" on public.memories for insert with check (person in ('kamu', 'dia'));
create policy "Public can delete memories" on public.memories for delete using (true);

create policy "Public can read quick messages" on public.quick_messages for select using (true);
create policy "Public can insert quick messages" on public.quick_messages for insert with check (person in ('kamu', 'dia'));

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.moods to anon, authenticated;
grant select, insert, delete on public.notes to anon, authenticated;
grant select, insert, update, delete on public.todo_items to anon, authenticated;
grant select, insert, delete on public.memories to anon, authenticated;
grant select, insert on public.quick_messages to anon, authenticated;

-- ============================================================
-- STORAGE
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories',
  'memories',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

drop policy if exists "Couple can view memory images" on storage.objects;
drop policy if exists "Users can upload own memory images" on storage.objects;
drop policy if exists "Users can update own memory images" on storage.objects;
drop policy if exists "Users can delete own memory images" on storage.objects;
drop policy if exists "Public can view memory images" on storage.objects;
drop policy if exists "Public can upload memory images" on storage.objects;
drop policy if exists "Public can delete memory images" on storage.objects;

create policy "Public can view memory images"
  on storage.objects for select
  using (bucket_id = 'memories');

create policy "Public can upload memory images"
  on storage.objects for insert
  with check (bucket_id = 'memories');

create policy "Public can delete memory images"
  on storage.objects for delete
  using (bucket_id = 'memories');
