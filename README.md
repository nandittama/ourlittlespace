# Our Little Space

Private-feeling digital space for two people — simple, light, and personal.

## Login (PIN lokal)

Website memakai **login PIN sederhana di frontend** (bukan Supabase Auth).

Akun default:

| Nama | PIN |
|------|-----|
| Nadhif | `2104` |
| Diah | `0421` |

PIN bisa diganti di halaman **Profile**. PIN disimpan di `localStorage` perangkat (`pin_nadhif` / `pin_diah`).

> Ini hanya proteksi ringan. Siapa pun yang punya URL tetap bisa melihat data di Supabase jika tahu cara. Jangan simpan data sensitif.

## Important: data tetap semi-publik

Website ini sengaja sederhana. Data di Supabase dapat diakses dengan anon key.

Jangan menyimpan:

- Password / kredensial penting
- Nomor identitas
- Alamat pribadi
- Nomor telepon
- Informasi finansial

Hanya cocok untuk mood, catatan sederhana, ide kegiatan, foto kenangan, dan pesan singkat.

## Tech stack

- **Frontend:** React + Vite + React Router
- **Backend:** Supabase (PostgreSQL + Storage only — **no Auth**)
- **Deploy:** Vercel
- **Identity:** PIN login + `localStorage` (`current_person`, `is_logged_in`)

## Names

Edit [`src/config.js`](src/config.js):

```js
export const PERSON_ONE_NAME = 'Nadhif' // kamu
export const PERSON_TWO_NAME = 'Diah'   // dia
```

## Setup

```bash
npm install
cp .env.example .env
```

Isi:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> URL harus domain project saja, **tanpa** `/rest/v1/`.

Jalankan SQL di [`supabase/schema.sql`](supabase/schema.sql), lalu:

```bash
npm run dev
npm run build
```

## Features

| Feature | Route |
|--------|-------|
| Login PIN | `/login` |
| Home | `/` |
| Mood | `/mood` |
| Notes | `/notes` |
| Things To Do | `/things-to-do` |
| Memories | `/memories` |
| Profile + ganti PIN | `/profile` |

Fitur **Surprise Me / Random Date sudah dihapus**.

## Deploy (GitHub → Vercel)

1. Push ke GitHub
2. Import di Vercel
3. Set env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
4. Deploy

Setiap `git push` ke `main` akan auto-update website.

## License

Private / personal use.
