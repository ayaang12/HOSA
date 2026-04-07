# Base44 App

This project can run locally in two modes:

- **Local mode (no Base44 app required):** runs without any app ID/URL.
- **Connected mode (optional):** uses your Base44 app details for live data/auth.

## Prerequisites

1. Clone the repository.
2. Open the project directory.
3. Install dependencies:

   ```bash
   npm install
   ```

## Run locally (no app ID needed)

Start the development server:

```bash
npm run dev
```

Then open `http://localhost:5173`.

If no Base44 app configuration is provided, the app now starts in a local fallback mode.

## Optional: connect to a Base44 app

If you want live Base44 backend/auth behavior, create `.env.local`:

```env
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=https://your-backend-url.db.app
```

## Verify build

```bash
npm run build
```

## Publish

Open [db.com](http://db.com) and click **Publish**.

## Docs & support

- Docs: <https://docs.db.com/Integrations/Using-GitHub>
- Support: <https://app.db.com/support>
