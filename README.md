# Typenx Web

The React frontend for Typenx — discovery, library, account, and addon management for a self-hostable anime hub.

Typenx Web is a TanStack Start application that talks to [Typenx Core](https://github.com/typenx/typenx-core) over a typed SDK. It handles the AniList and MyAnimeList sign-in flows, browses anime through any registered metadata addon, surfaces recommendations from your own data, and gives you a panel to plug in new addon URLs without touching the backend config.

## Prerequisites

- Node.js 20 or newer
- npm
- A running Typenx Core API (`http://127.0.0.1:8080` by default)

## Quick start

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The dev server runs on `http://127.0.0.1:3000`.

## Environment

Configuration is read from `.env`:

- `VITE_TYPENX_API_BASE_URL` — base URL for Typenx Core API requests.
- `VITE_TYPENX_AUTH_CALLBACK_PATH` — frontend route used after OAuth login.

A working local pair:

```ini
VITE_TYPENX_API_BASE_URL=http://127.0.0.1:8080
VITE_TYPENX_AUTH_CALLBACK_PATH=/auth/callback
```

## Backend pairing

Start Typenx Core in a sibling terminal before signing in or hitting authenticated routes:

```powershell
cd ..\core
Copy-Item .env.example .env
cargo run -p typenx-server
```

The backend must allow the frontend origin and set `TYPENX_WEB_REDIRECT_URL` to the frontend callback route, for example:

```ini
TYPENX_WEB_REDIRECT_URL=http://127.0.0.1:3000/auth/callback
```

## Scripts

```powershell
npm run dev      # Start the local development server
npm run build    # Build for production
npm run preview  # Preview the production build
npm run test     # Run Vitest
npm run lint     # Run ESLint
npm run format   # Format and fix lint issues
npm run check    # Check Prettier formatting
```

## Project structure

- `src/routes/` — file-based application routes.
- `src/components/` — shared UI and application components.
- `src/sdk/` — typed API client for Typenx Core.
- `src/styles.css` — Tailwind CSS entrypoint and global styles.

## Production build

```powershell
npm run build
```

The output lands in `dist/`. Serve it with whichever static host or platform you deploy to; the frontend is a fully static bundle.
