# MedGuard App

This project now supports a **Supabase backend** with a local fallback mode.

## Prerequisites

1. Clone the repository.
2. Open the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

## Run locally (no backend required)

```bash
npm run dev
```

Then open `http://localhost:5173`.

Without Supabase environment variables, the app runs in local fallback mode using in-memory/noop data responses.

## Connect to Supabase (recommended)

Create `.env.local` with:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

With these set, entity reads/writes and auth checks use Supabase.

## Verify build

```bash
npm run build
```
