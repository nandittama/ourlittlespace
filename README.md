# Our Little Space

A little place for us — **one-page relationship space**.

Open → scroll → interact.

## Concept

Tidak ada login, navbar, sidebar, atau bottom navigation.
Semua fitur ada di **satu halaman** yang di-scroll vertikal.

## Features

1. Hero / greeting + pilih identitas
2. Mood
3. Today summary
4. Little Notes
5. Things To Do
6. Random Date
7. Memories (foto via Supabase Storage)
8. Quick Messages
9. Little settings + footer

## Setup

```bash
npm install
cp .env.example .env
```

Isi:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Jalankan SQL: `supabase/schema.sql`

```bash
npm run dev
npm run build
```

## Identity

Disimpan di `localStorage`:

- `current_person` = `kamu` | `dia`
- `display_name_kamu` / `display_name_dia` (opsional)

Default nama di `src/config.js`.

## Catatan

Website ini sengaja public. Jangan simpan data sensitif.
Hanya gunakan anon key di frontend.
