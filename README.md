# Our Little Space

Private-feeling digital space for two people — simple, light, and personal.

**No login. No email. No password.**  
Anyone with the website URL can open it and use every feature right away.

## Important: this website is public

Website ini sengaja dibuat public. Data yang disimpan melalui aplikasi dapat dilihat oleh pengunjung website.

Jangan menyimpan:

- Password
- Nomor identitas
- Alamat pribadi
- Nomor telepon
- Informasi finansial
- Informasi sensitif lainnya

Hanya cocok untuk data ringan seperti mood, catatan sederhana, ide kegiatan, foto kenangan, dan pesan singkat.

## Tech stack

- **Frontend:** React + Vite + React Router
- **Backend:** Supabase (PostgreSQL + Storage only — **no Auth**)
- **Deploy:** Vercel
- **Identity:** local choice `kamu` / `dia` stored in `localStorage`

## Requirements

- Node.js 20+
- npm
- Free Supabase project
- Free Vercel account (for deploy)

## Setup steps

### 1. Clone repository

```bash
git clone <your-repo-url>
cd ourlittlespace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project

### 4. Run the SQL schema

1. Open **SQL Editor**
2. Paste and run [`supabase/schema.sql`](supabase/schema.sql)

This creates public tables + policies (no `auth.users`).

> If you previously ran the old auth-based schema, this script drops the old tables first.

### 5. Setup Storage

The SQL file creates a **public** bucket named `memories` (max 5 MB, JPG/PNG/WEBP).

Bucket is public because the website has no authentication — photos need to be readable without login.

### 6. Create `.env`

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Fill:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Get values from Supabase → **Project Settings → API**.  
Use only the **anon/public** key. Never put the service role key in the frontend.

### 7. Local development

```bash
npm run dev
```

```bash
npm run build
npm run preview
```

### 8. Push to GitHub

```bash
git init
git add .
git commit -m "Our Little Space public site"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Do **not** commit `.env`.

### 9–11. Deploy on Vercel

1. Import the GitHub repository in Vercel
2. Framework: **Vite**
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

Flow:

```text
GitHub → Vercel → Import → Env vars → Deploy
```

## Configure names

Edit [`src/config.js`](src/config.js):

```js
export const PERSON_ONE_NAME = 'Nadhif'
export const PERSON_TWO_NAME = 'Nama Pacar'
```

Those names appear across the whole app.

## How identity works

1. Open the website
2. Choose **Nadhif** or **Nama Pacar** (keys: `kamu` / `dia`)
3. Choice is saved in `localStorage` as `current_person`
4. Use **Switch person** anytime

No accounts. No invite codes.

## Features

| Feature | Route |
|--------|-------|
| Home / Dashboard | `/` |
| Mood | `/mood` |
| Notes | `/notes` |
| Things To Do | `/things-to-do` |
| Memories | `/memories` |
| Random Date | `/date-ideas` |

## Project structure

```text
src/
├── components/
├── config.js
├── context/
│   ├── PersonContext.jsx
│   └── ToastContext.jsx
├── lib/supabase.js
├── pages/
├── utils/
├── App.jsx
└── index.css
supabase/
└── schema.sql
```

## PWA (optional)

`public/manifest.webmanifest` is included so the site can be added to a phone home screen. This is optional and not required for core features.

## Security notes

- No Supabase Auth
- Anonymous users can read/write the configured tables via the anon key + RLS policies
- Storage bucket `memories` is public
- Never store secrets or sensitive personal data here

## Troubleshooting

### Unable to connect to our little space

- Check `.env` values
- Restart `npm run dev` after changing env
- Confirm schema.sql was run successfully

### Photos not uploading

- Confirm bucket `memories` exists and is public
- Confirm storage policies from schema.sql are applied
- File must be JPG/PNG/WEBP and ≤ 5 MB

### Old auth tables still present

Re-run the latest `supabase/schema.sql` (it drops old auth-based tables).

## License

Private / personal use.
