-- ============================================================
-- Our Little Space — Stitch redesign schema (NO AUTH)
-- Prefer migrate_stitch_redesign.sql on existing projects.
-- ============================================================

create extension if not exists "pgcrypto";

drop table if exists public.note_reactions cascade;
drop table if exists public.secret_letters cascade;
drop table if exists public.hugs cascade;
drop table if exists public.quick_messages cascade;
drop table if exists public.memories cascade;
drop table if exists public.todo_items cascade;
drop table if exists public.bucket_items cascade;
drop table if exists public.notes cascade;
drop table if exists public.moods cascade;

create table public.moods (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('nadhif', 'diah')),
  mood_key text not null,
  mood_emoji text not null,
  mood_label text not null,
  message text check (message is null or char_length(message) <= 200),
  mood_date date not null default ((timezone('Asia/Jakarta', now()))::date),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint moods_person_date_unique unique (person, mood_date)
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('nadhif', 'diah')),
  receiver text not null check (receiver in ('nadhif', 'diah')),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 500),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.note_reactions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes(id) on delete cascade,
  person text not null check (person in ('nadhif', 'diah')),
  reaction_type text not null check (reaction_type in ('heart', 'love', 'sparkle')),
  created_at timestamptz not null default now(),
  constraint note_reactions_unique unique (note_id, person, reaction_type)
);

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  person text not null check (person in ('nadhif', 'diah')),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 100),
  description text check (description is null or char_length(description) <= 500),
  image_url text not null,
  memory_date date not null default ((timezone('Asia/Jakarta', now()))::date),
  created_at timestamptz not null default now()
);

create table public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0 and char_length(title) <= 120),
  status text not null default 'planned' check (status in ('planned', 'someday', 'completed')),
  created_by text not null check (created_by in ('nadhif', 'diah')),
  completed_date date,
  created_at timestamptz not null default now()
);

create table public.secret_letters (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('nadhif', 'diah')),
  receiver text not null check (receiver in ('nadhif', 'diah')),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 1000),
  open_on date,
  created_at timestamptz not null default now()
);

create table public.hugs (
  id uuid primary key default gen_random_uuid(),
  sender text not null check (sender in ('nadhif', 'diah')),
  created_at timestamptz not null default now()
);

alter table public.moods enable row level security;
alter table public.notes enable row level security;
alter table public.note_reactions enable row level security;
alter table public.memories enable row level security;
alter table public.bucket_items enable row level security;
alter table public.secret_letters enable row level security;
alter table public.hugs enable row level security;

create policy "moods_select" on public.moods for select using (true);
create policy "moods_insert" on public.moods for insert with check (person in ('nadhif', 'diah'));
create policy "moods_update" on public.moods for update using (true) with check (person in ('nadhif', 'diah'));

create policy "notes_select" on public.notes for select using (true);
create policy "notes_insert" on public.notes for insert with check (sender in ('nadhif', 'diah'));
create policy "notes_update" on public.notes for update using (true) with check (true);
create policy "notes_delete" on public.notes for delete using (true);

create policy "reactions_select" on public.note_reactions for select using (true);
create policy "reactions_insert" on public.note_reactions for insert with check (person in ('nadhif', 'diah'));
create policy "reactions_delete" on public.note_reactions for delete using (true);

create policy "memories_select" on public.memories for select using (true);
create policy "memories_insert" on public.memories for insert with check (person in ('nadhif', 'diah'));
create policy "memories_delete" on public.memories for delete using (true);

create policy "bucket_select" on public.bucket_items for select using (true);
create policy "bucket_insert" on public.bucket_items for insert with check (created_by in ('nadhif', 'diah'));
create policy "bucket_update" on public.bucket_items for update using (true) with check (true);
create policy "bucket_delete" on public.bucket_items for delete using (true);

create policy "letters_select" on public.secret_letters for select using (true);
create policy "letters_insert" on public.secret_letters for insert with check (sender in ('nadhif', 'diah'));

create policy "hugs_select" on public.hugs for select using (true);
create policy "hugs_insert" on public.hugs for insert with check (sender in ('nadhif', 'diah'));

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.moods to anon, authenticated;
grant select, insert, update, delete on public.notes to anon, authenticated;
grant select, insert, delete on public.note_reactions to anon, authenticated;
grant select, insert, delete on public.memories to anon, authenticated;
grant select, insert, update, delete on public.bucket_items to anon, authenticated;
grant select, insert on public.secret_letters to anon, authenticated;
grant select, insert on public.hugs to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'memories', 'memories', true, 5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

drop policy if exists "Public can view memory images" on storage.objects;
drop policy if exists "Public can upload memory images" on storage.objects;
drop policy if exists "Public can delete memory images" on storage.objects;

create policy "Public can view memory images" on storage.objects for select using (bucket_id = 'memories');
create policy "Public can upload memory images" on storage.objects for insert with check (bucket_id = 'memories');
create policy "Public can delete memory images" on storage.objects for delete using (bucket_id = 'memories');
