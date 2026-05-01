# Typenx Web

Typenx Web is the React frontend for Typenx. It provides the local user interface for authentication, anime discovery, addon management, and account/library views backed by Typenx Core.

## Prerequisites

- Node.js 20 or newer
- npm
- A running Typenx Core API server

By default, the frontend expects the API at `http://127.0.0.1:8080`.

## Setup

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The development server starts on `http://127.0.0.1:3000`.

## Environment

Configuration is read from `.env`:

- `VITE_TYPENX_API_BASE_URL`: base URL for Typenx Core API requests.
- `VITE_TYPENX_AUTH_CALLBACK_PATH`: frontend route used after OAuth login.

For the default local backend, use:

```ini
VITE_TYPENX_API_BASE_URL=http://127.0.0.1:8080
VITE_TYPENX_AUTH_CALLBACK_PATH=/auth/callback
```

## Backend Pairing

Start the backend from the sibling `core` project before signing in or calling authenticated API routes:

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

## Project Structure

- `src/routes/`: file-based application routes.
- `src/components/`: shared UI and application components.
- `src/sdk/`: typed API client for Typenx Core.
- `src/styles.css`: Tailwind CSS entrypoint and global styles.

## Production Build

```powershell
npm run build
```

Review the generated output in `dist/` and serve it with the deployment platform used for the application.
